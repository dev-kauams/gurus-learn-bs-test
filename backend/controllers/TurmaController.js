// controllers/TurmaController.js
const Turma = require('../models/Turma');

class TurmaController {

    // GET /api/turmas — todas (gestão) ou filtradas por perfil
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

    // GET /api/turmas/:id
    static async buscarUm(req, res) {
        try {
            const t = await Turma.buscarPorId(req.params.id);
            if (!t) return res.status(404).json({ erro: 'Turma não encontrada.' });
            res.json(t);
        } catch (e) { res.status(500).json({ erro: 'Erro ao buscar turma.' }); }
    }

    // GET /api/turmas/:id/alunos
    static async alunos(req, res) {
        try {
            const alunos = await Turma.alunosDaTurma(req.params.id);
            res.json(alunos);
        } catch (e) { res.status(500).json({ erro: 'Erro ao listar alunos.' }); }
    }

    // POST /api/turmas
    static async criar(req, res) {
        const { nome_turma, descricao, id_professor } = req.body;
        if (!nome_turma) return res.status(400).json({ erro: 'Informe o nome da turma.' });
        try {
            const id = await Turma.criar(nome_turma, descricao, id_professor);
            res.status(201).json({ mensagem: 'Turma criada!', id });
        } catch (e) {
            if (e.code === 'ER_DUP_ENTRY')
                return res.status(409).json({ erro: 'Já existe uma turma com esse nome.' });
            res.status(500).json({ erro: 'Erro ao criar turma.' });
        }
    }

    // PUT /api/turmas/:id
    static async editar(req, res) {
        const { nome_turma, descricao, id_professor } = req.body;
        if (!nome_turma) return res.status(400).json({ erro: 'Informe o nome da turma.' });
        try {
            await Turma.editar(req.params.id, nome_turma, descricao, id_professor);
            res.json({ mensagem: 'Turma atualizada!' });
        } catch (e) { res.status(500).json({ erro: 'Erro ao editar turma.' }); }
    }

    // DELETE /api/turmas/:id
    static async deletar(req, res) {
        try {
            await Turma.deletar(req.params.id);
            res.json({ mensagem: 'Turma removida.' });
        } catch (e) { res.status(500).json({ erro: 'Erro ao remover turma.' }); }
    }

    // POST /api/turmas/:id/matricular
    static async matricular(req, res) {
        const { id_aluno } = req.body;
        try {
            await Turma.matricularAluno(id_aluno || req.session.usuario.id_usuario, req.params.id);
            res.json({ mensagem: 'Matriculado com sucesso!' });
        } catch (e) { res.status(500).json({ erro: 'Erro ao matricular.' }); }
    }

    // DELETE /api/turmas/:id/matricular
    static async desmatricular(req, res) {
        try {
            await Turma.desmatricularAluno(req.session.usuario.id_usuario, req.params.id);
            res.json({ mensagem: 'Desmatriculado.' });
        } catch (e) { res.status(500).json({ erro: 'Erro ao desmatricular.' }); }
    }
}

module.exports = TurmaController;
