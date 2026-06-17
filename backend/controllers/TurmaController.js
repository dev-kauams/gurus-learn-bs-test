const Turma = require('../models/Turma');
const db = require('../config/db'); 

class TurmaController {

    static async listar(req, res) {
        try {
            const { id_usuario, id_nivel } = req.session.usuario;
            let turmas;
            if (id_nivel === 3)      turmas = await Turma.listarTodas();
            else if (id_nivel === 2) turmas = await Turma.listarDoProfessor(id_usuario);
            else                     turmas = await Turma.listarDoAluno(id_usuario);
            res.json(turmas);
        } catch (e) { res.status(500).json({ erro: 'Erro ao listar turmas.' }); }
    }

    static async listarDisponiveis(req, res) {
        try {
            const id_aluno = req.session.usuario.id_usuario;
            // Seleciona apenas as turmas onde o aluno NÃO possui matrícula ativa
            const [rows] = await db.execute(`
                SELECT t.*, u.nome AS nome_professor 
                FROM turma t
                LEFT JOIN usuario u ON t.id_professor = u.id_usuario
                WHERE t.id_turma NOT IN (
                    SELECT id_turma FROM matricula WHERE id_aluno = ?
                )
            `, [id_aluno]);
            res.json(rows);
        } catch (e) {
            res.status(500).json({ erro: 'Erro ao buscar turmas disponíveis.' });
        }
    }

    static async buscarUm(req, res) {
        try {
            const t = await Turma.buscarPorId(req.params.id);
            if (!t) return res.status(404).json({ erro: 'Turma não encontrada.' });
            res.json(t);
        } catch (e) { res.status(500).json({ erro: 'Erro ao buscar turma.' }); }
    }

    static async alunos(req, res) {
        try {
            const [rows] = await db.execute(`
                SELECT u.id_usuario, u.nome, u.email 
                FROM matricula m
                JOIN usuario u ON m.id_aluno = u.id_usuario
                WHERE m.id_turma = ?
                ORDER BY u.nome ASC
            `, [req.params.id]);
            res.json(rows);
        } catch (e) { res.status(500).json({ erro: 'Erro ao listar alunos da sala.' }); }
    }

    static async criar(req, res) {
        const { nome_turma, descricao, id_professor } = req.body;
        if (!nome_turma) return res.status(400).json({ erro: 'Informe o nome da turma.' });
        try {
            const id = await Turma.criar(nome_turma, descricao, id_professor);
            res.status(201).json({ mensagem: 'Turma criada!', id });
        } catch (e) {
            if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ erro: 'Já existe uma turma com esse nome.' });
            res.status(500).json({ erro: 'Erro ao criar turma.' });
        }
    }

    static async editar(req, res) {
        const { nome_turma, descricao, id_professor } = req.body;
        if (!nome_turma) return res.status(400).json({ erro: 'Informe o nome da turma.' });
        try {
            await Turma.editar(req.params.id, nome_turma, descricao, id_professor);
            res.json({ mensagem: 'Turma atualizada!' });
        } catch (e) { res.status(500).json({ erro: 'Erro ao editar turma.' }); }
    }

    static async deletar(req, res) {
        try {
            await Turma.deletar(req.params.id);
            res.json({ mensagem: 'Turma removida.' });
        } catch (e) { res.status(500).json({ erro: 'Erro ao remover turma.' }); }
    }

    static async matricular(req, res) {
        const { id_aluno } = req.body;
        try {
            await Turma.matricularAluno(id_aluno || req.session.usuario.id_usuario, req.params.id);
            res.json({ mensagem: 'Matriculado com sucesso!' });
        } catch (e) { res.status(500).json({ erro: 'Erro ao matricular.' }); }
    }

    static async desmatricular(req, res) {
        try {
            await Turma.desmatricularAluno(req.session.usuario.id_usuario, req.params.id);
            res.json({ mensagem: 'Desmatriculado.' });
        } catch (e) { res.status(500).json({ erro: 'Erro ao desmatricular.' }); }
    }

    static async listarGurupos(req, res) {
        try {
            const [rows] = await db.execute(`
                SELECT g.* FROM gurupo g
                JOIN gurupo_membro gm ON g.id_gurupo = gm.id_gurupo
                WHERE gm.id_usuario = ?
                ORDER BY g.criado_em DESC
            `, [req.session.usuario.id_usuario]);
            res.json(rows);
        } catch (e) { res.status(500).json({ erro: 'Erro ao listar Gurupos.' }); }
    }

    static async criarGurupo(req, res) {
        const { nome } = req.body;
        if (!nome) return res.status(400).json({ erro: 'Nome do Gurupo é obrigatório.' });
        
        const codigo = Math.random().toString(36).substring(2, 7).toUpperCase();
        try {
            const [r] = await db.execute(
                'INSERT INTO gurupo (nome, codigo_acesso, id_criador) VALUES (?, ?, ?)',
                [nome, codigo, req.session.usuario.id_usuario]
            );
            await db.execute('INSERT INTO gurupo_membro (id_gurupo, id_usuario) VALUES (?, ?)', [r.insertId, req.session.usuario.id_usuario]);
            res.status(201).json({ mensagem: 'Gurupo criado!', codigo });
        } catch (e) { res.status(500).json({ erro: 'Erro ao criar Gurupo.' }); }
    }

    static async entrarGurupo(req, res) {
        const { codigo } = req.body;
        if (!codigo) return res.status(400).json({ erro: 'Código necessário.' });
        try {
            const [grupos] = await db.execute('SELECT * FROM gurupo WHERE codigo_acesso = ?', [codigo.toUpperCase().trim()]);
            if (grupos.length === 0) return res.status(404).json({ erro: 'Código de Gurupo não encontrado.' });
            
            await db.execute('INSERT IGNORE INTO gurupo_membro (id_gurupo, id_usuario) VALUES (?, ?)', [grupos[0].id_gurupo, req.session.usuario.id_usuario]);
            res.json({ mensagem: `Você entrou no Gurupo: ${grupos[0].nome}!` });
        } catch (e) { res.status(500).json({ erro: 'Erro ao entrar no Gurupo.' }); }
    }

    // Alinhamento de chaves consertado e propriedades JSON padronizadas para o front
    static async ingressar(req, res) {
        try {
            const { id_turma } = req.body;
            const id_aluno = req.session.usuario.id_usuario;

            if (!id_turma) {
                return res.status(400).json({ success: false, erro: 'O ID da turma é obrigatório.' });
            }

            // Evita duplicar a matrícula caso ele clique duas vezes
            const [existe] = await db.execute(
                'SELECT * FROM matricula WHERE id_aluno = ? AND id_turma = ?',
                [id_aluno, id_turma]
            );
            
            if (existe.length > 0) {
                return res.status(400).json({ success: false, erro: 'Você já está matriculado nesta turma.' });
            }

            // Insere o vínculo oficial do aluno com a turma
            await db.execute(
                'INSERT INTO matricula (id_aluno, id_turma, criado_em) VALUES (?, ?, NOW())',
                [id_aluno, id_turma]
            );

            return res.json({ success: true, message: 'Inscrição realizada com sucesso!' });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ success: false, erro: 'Erro interno ao ingressar na turma.' });
        }
    }
}

module.exports = TurmaController;