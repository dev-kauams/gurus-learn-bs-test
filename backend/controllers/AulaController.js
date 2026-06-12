// controllers/AulaController.js
const Aula = require('../models/Aula');
const db = require('../config/db');

class AulaController {

    static async listar(req, res) {
        try {
            const { id_usuario, id_nivel } = req.session.usuario;
            const aulas = id_nivel === 1 ? await Aula.listarDoAluno(id_usuario) : await Aula.listarTodas();
            res.json(aulas);
        } catch (e) { res.status(500).json({ erro: 'Erro ao listar aulas.' }); }
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
        const { titulo, data_aula, conteudo, id_turma } = req.body;
        if (!titulo || !data_aula || !conteudo || !id_turma) return res.status(400).json({ erro: 'Preencha todos os campos.' });
        try {
            const id = await Aula.criar(titulo, data_aula, conteudo, id_turma);
            res.status(201).json({ mensagem: 'Aula criada!', id });
        } catch (e) { res.status(500).json({ erro: 'Erro ao criar aula.' }); }
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

    // Novo méotodo exclusivo: Controle de presença 
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