// controllers/AtividadeController.js
const Atividade = require('../models/Atividade');
const db = require('../config/db');

class AtividadeController {

    static async listar(req, res) {
        try {
            const { id_usuario, id_nivel } = req.session.usuario;
            
            // Query customizada para trazer o status de entrega (Sim/Não) junto com a listagem
            let atividades;
            if (id_nivel === 1) {
                const [rows] = await db.execute(`
                    SELECT at.*, t.nome_turma, m.nome_materia, COALESCE(ea.entregue, 0) AS entregue
                    FROM atividade at
                    JOIN turma t ON at.id_turma = t.id_turma
                    JOIN matricula mt ON mt.id_turma = t.id_turma
                    LEFT JOIN materia m ON at.id_materia = m.id_materia
                    LEFT JOIN entrega_atividade ea ON at.id_atividade = ea.id_atividade AND ea.id_aluno = ?
                    WHERE mt.id_aluno = ?
                    ORDER BY at.prazo ASC
                `, [id_usuario, id_usuario]);
                atividades = rows;
            } else {
                atividades = await Atividade.listarTodas();
            }
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
        if (!titulo || !id_materia || !id_turma || !prazo) return res.status(400).json({ erro: 'Preencha todos os campos obrigatórios.' });
        try {
            const id = await Atividade.criar(titulo, descricao, id_materia, id_turma, prazo);
            res.status(201).json({ mensagem: 'Atividade criada!', id });
        } catch (e) { res.status(500).json({ erro: 'Erro ao criar atividade.' }); }
    }

    static async editar(req, res) {
        const { titulo, descricao, id_materia, id_turma, prazo } = req.body;
        if (!titulo || !id_materia || !id_turma || !prazo) return res.status(400).json({ erro: 'Preencha todos os campos obrigatórios.' });
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

    // Novo Método específico: Confirmação Sim/Não via Botão Rádio do Aluno
    static async confirmarEntrega(req, res) {
        const { entregue } = req.body; // Espera 1 para Sim e 0 para Não
        if (entregue === undefined) return res.status(400).json({ erro: 'Selecione uma opção de status.' });
        try {
            await db.execute(`
                INSERT INTO entrega_atividade (id_atividade, id_aluno, entregue) VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE entregue = VALUES(entregue)
            `, [req.params.id, req.session.usuario.id_usuario, entregue]);
            res.json({ mensagem: 'Status da entrega salvo!' });
        } catch (e) { res.status(500).json({ erro: 'Erro ao processar confirmação de entrega.' }); }
    }
}

module.exports = AtividadeController;