// controllers/AtividadeController.js
const Atividade = require('../models/Atividade');
const db = require('../config/db');

class AtividadeController {

    static async listar(req, res) {
        try {
            const { id_usuario, id_nivel } = req.session.usuario;
            let atividades;
            
            if (id_nivel === 1) {
                // ALUNO: Vê apenas atividades das turmas nas quais está matriculado
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
            } else if (id_nivel === 2) {
                // PROFESSOR: Vê apenas as atividades das turmas em que ELE é o professor designado
                const [rows] = await db.execute(`
                    SELECT at.*, t.nome_turma, m.nome_materia
                    FROM atividade at
                    JOIN turma t ON at.id_turma = t.id_turma
                    LEFT JOIN materia m ON at.id_materia = m.id_materia
                    WHERE t.id_professor = ?
                    ORDER BY at.prazo ASC
                `, [id_usuario]);
                atividades = rows;
            } else {
                // GESTÃO / ADMIN: Vê tudo do sistema
                const [rows] = await db.execute(`
                    SELECT at.*, t.nome_turma, m.nome_materia
                    FROM atividade at
                    JOIN turma t ON at.id_turma = t.id_turma
                    LEFT JOIN materia m ON at.id_materia = m.id_materia
                    ORDER BY at.prazo ASC
                `);
                atividades = rows;
            }
            res.json(atividades);
        } catch (e) { 
            res.status(500).json({ erro: 'Erro ao listar atividades.' }); 
        }
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

    static async listarEntregas(req, res) {
        try {
            const id_atividade = req.params.id;
            // Junta todos os alunos daquela turma e cruza com as entregas efetuadas
            const [rows] = await db.execute(`
                SELECT 
                    u.nome AS nome_aluno,
                    u.email AS email_aluno,
                    COALESCE(ea.entregue, 0) AS entregue,
                    ea.arquivo_url,
                    ea.entregue_em
                FROM atividade at
                INNER JOIN matricula m ON m.id_turma = at.id_turma
                INNER JOIN usuario u ON m.id_aluno = u.id_usuario
                LEFT JOIN entrega_atividade ea ON ea.id_atividade = at.id_atividade AND ea.id_aluno = u.id_usuario
                WHERE at.id_atividade = ?
                ORDER BY u.nome ASC
            `, [id_atividade]);
            res.json(rows);
        } catch (e) {
            res.status(500).json({ erro: 'Erro ao processar relatório de entregas.' });
        }
    }
}

module.exports = AtividadeController;