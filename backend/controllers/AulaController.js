// controllers/AulaController.js
const Aula = require('../models/Aula');
const db = require('../config/db');

class AulaController {

    static async listar(req, res) {
        try {
            const { id_usuario, id_nivel } = req.session.usuario;
            let query = '';
            let params = [];

            if (id_nivel === 1) { 
                // ALUNO: Só vê aulas das turmas em que está MATRICULADO
                query = `SELECT a.*, t.nome_turma 
                        FROM aula a
                        INNER JOIN turma t ON a.id_turma = t.id_turma
                        INNER JOIN matricula m ON m.id_turma = t.id_turma
                        WHERE m.id_aluno = ?
                        ORDER BY a.data_aula DESC`;
                params = [id_usuario];
            } else if (id_nivel === 2) { 
                // PROFESSOR: Só vê aulas das turmas que ELE está assignado
                query = `SELECT a.*, t.nome_turma 
                        FROM aula a
                        INNER JOIN turma t ON a.id_turma = t.id_turma
                        WHERE t.id_professor = ?
                        ORDER BY a.data_aula DESC`;
                params = [id_usuario];
            } else { 
                // GESTÃO / ADMIN: Vê tudo
                query = `SELECT a.*, t.nome_turma 
                        FROM aula a 
                        INNER JOIN turma t ON a.id_turma = t.id_turma 
                        ORDER BY a.data_aula DESC`;
            }

            const [rows] = await db.execute(query, params);
            res.json(rows);
        } catch (e) {
            res.status(500).json({ erro: 'Erro ao listar aulas.' });
        }
    }

    static async listarPorTurma(req, res) {
        try {
            const aulas = await Aula.listarPorTurma(req.params.id_turma);
            res.json(aulas);
        } catch (e) { res.status(500).json({ erro: 'Erro ao listar aulas da turma.' }); }
    }

    static async buscarUm(req, res) {
        try {
            const a = await Aula.buscarPorId(req.params.id);
            if (!a) return res.status(404).json({ erro: 'Aula não encontrada.' });
            res.json(a);
        } catch (e) { res.status(500).json({ erro: 'Erro ao buscar aula.' }); }
    }

    static async criar(req, res) {
        try {
            const { titulo, data_aula, conteudo, id_turma } = req.body;
            const { id_usuario, id_nivel } = req.session.usuario;

            if (!titulo || !data_aula || !id_turma) {
                return res.status(400).json({ erro: 'Título, data e turma são obrigatórios.' });
            }

            // Validação de Professor (Segurança)
            if (id_nivel === 2) {
                const [turma] = await db.execute(
                    'SELECT id_turma FROM turma WHERE id_turma = ? AND id_professor = ?',
                    [id_turma, id_usuario]
                );
                if (turma.length === 0) {
                    return res.status(403).json({ erro: 'Acesso negado. Você não gerencia esta turma.' });
                }
            }

            // Evita a criação de aulas duplas
            const [existente] = await db.execute(
                'SELECT id_aula FROM aula WHERE LOWER(titulo) = LOWER(?) AND id_turma = ?',
                [titulo.trim(), id_turma]
            );

            if (existente.length > 0) {
                return res.status(400).json({ erro: 'Já existe uma aula cadastrada com este mesmo título nesta turma!' });
            }
            // ----------------------------------

            await db.execute(
                'INSERT INTO aula (titulo, data_aula, conteudo, id_turma) VALUES (?, ?, ?, ?)',
                [titulo.trim(), data_aula, conteudo || null, id_turma]
            );

            res.status(201).json({ success: true, message: 'Aula criada com sucesso!' });
        } catch (e) {
            console.error(e);
            res.status(500).json({ erro: 'Erro ao criar aula.' });
        }
    }

    static async editar(req, res) {
        const { titulo, data_aula, conteudo, id_turma } = req.body;
        if (!titulo || !data_aula || !conteudo || !id_turma) return res.status(400).json({ erro: 'Preencha todos os campos.' });
        try {
            await Aula.editar(req.params.id, titulo, data_aula, conteudo, id_turma);
            res.json({ mensagem: 'Aula atualizada!' });
        } catch (e) { res.status(500).json({ erro: 'Erro ao editar aula.' }); }
    }

    static async deletar(req, res) {
        try {
            await Aula.deletar(req.params.id);
            res.json({ mensagem: 'Aula removida.' });
        } catch (e) { res.status(500).json({ erro: 'Erro ao remover aula.' }); }
    }

    static async proximasAulas(req, res) {
        try {
            const aulas = await Aula.proximasAulas(req.session.usuario.id_usuario);
            res.json(aulas);
        } catch (e) { res.status(500).json({ erro: 'Erro ao buscar próximas aulas.' }); }
    }

    // Novo método exclusivo: Controle de presença 
    static async listarPresencas(req, res) {
        try {
            const [rows] = await db.execute('SELECT id_aluno, status FROM presenca WHERE id_aula = ?', [req.params.id]);
            res.json(rows);
        } catch (e) { res.status(500).json({ erro: 'Erro ao buscar dados da chamada.' }); }
    }

    static async registrarPresenca(req, res) {
        const { id_aluno, status } = req.body; // status deve ser 'Presente' ou 'Ausente'
        if (!id_aluno || !status) return res.status(400).json({ erro: 'Dados incompletos para chamada.' });
        try {
            await db.execute(`
                INSERT INTO presenca (id_aula, id_aluno, status) VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE status = VALUES(status)
            `, [req.params.id, id_aluno, status]);
            res.json({ mensagem: 'Presença atualizada com sucesso!' });
        } catch (e) { res.status(500).json({ erro: 'Erro ao registrar presença.' }); }
    }
}

module.exports = AulaController;