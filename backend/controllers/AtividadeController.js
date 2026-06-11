// controllers/AtividadeController.js
const Atividade = require('../models/Atividade');

class AtividadeController {

    static async listar(req, res) {
        try {
            const { id_usuario, id_nivel } = req.session.usuario;
            const atividades = id_nivel === 1
                ? await Atividade.listarDoAluno(id_usuario)
                : await Atividade.listarTodas();
            res.json(atividades);
        } catch (e) { res.status(500).json({ erro: 'Erro ao listar atividades.' }); }
    }

    static async buscarUm(req, res) {
        try {
            const a = await Atividade.buscarPorId(req.params.id);
            if (!a) return res.status(404).json({ erro: 'Atividade não encontrada.' });
            res.json(a);
        } catch (e) { res.status(500).json({ erro: 'Erro ao buscar atividade.' }); }
    }

    static async criar(req, res) {
        const { titulo, descricao, id_materia, id_turma, prazo } = req.body;
        if (!titulo || !id_materia || !id_turma || !prazo)
            return res.status(400).json({ erro: 'Preencha todos os campos obrigatórios.' });
        try {
            const id = await Atividade.criar(titulo, descricao, id_materia, id_turma, prazo);
            res.status(201).json({ mensagem: 'Atividade criada!', id });
        } catch (e) { res.status(500).json({ erro: 'Erro ao criar atividade.' }); }
    }

    static async editar(req, res) {
        const { titulo, descricao, id_materia, id_turma, prazo } = req.body;
        if (!titulo || !id_materia || !id_turma || !prazo)
            return res.status(400).json({ erro: 'Preencha todos os campos obrigatórios.' });
        try {
            await Atividade.editar(req.params.id, titulo, descricao, id_materia, id_turma, prazo);
            res.json({ mensagem: 'Atividade atualizada!' });
        } catch (e) { res.status(500).json({ erro: 'Erro ao editar atividade.' }); }
    }

    static async deletar(req, res) {
        try {
            await Atividade.deletar(req.params.id);
            res.json({ mensagem: 'Atividade removida.' });
        } catch (e) { res.status(500).json({ erro: 'Erro ao remover atividade.' }); }
    }

    static async proximasPorAluno(req, res) {
        try {
            const atividades = await Atividade.proximasPorAluno(req.session.usuario.id_usuario);
            res.json(atividades);
        } catch (e) { res.status(500).json({ erro: 'Erro ao buscar atividades.' }); }
    }
}

module.exports = AtividadeController;
