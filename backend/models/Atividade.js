// models/Atividade.js
const db = require('../config/db');

class Atividade {
    static async listarTodas() {
        const [rows] = await db.execute(
            `SELECT at.*, t.nome_turma, m.nome_materia FROM atividade at
             LEFT JOIN turma t ON at.id_turma = t.id_turma
             LEFT JOIN materia m ON at.id_materia = m.id_materia
             ORDER BY at.prazo ASC`
        );
        return rows;
    }

    static async listarDoAluno(id_aluno) {
        const [rows] = await db.execute(
            `SELECT at.*, t.nome_turma, m.nome_materia FROM atividade at
             JOIN turma t ON at.id_turma = t.id_turma
             JOIN matricula mt ON mt.id_turma = t.id_turma
             LEFT JOIN materia m ON at.id_materia = m.id_materia
             WHERE mt.id_aluno = ? ORDER BY at.prazo ASC`,
            [id_aluno]
        );
        return rows;
    }

    static async buscarPorId(id) {
        const [rows] = await db.execute(
            `SELECT at.*, t.nome_turma, m.nome_materia FROM atividade at
             LEFT JOIN turma t ON at.id_turma = t.id_turma
             LEFT JOIN materia m ON at.id_materia = m.id_materia
             WHERE at.id_atividade = ?`,
            [id]
        );
        return rows[0] || null;
    }

    static async criar(titulo, descricao, id_materia, id_turma, prazo) {
        const [r] = await db.execute(
            'INSERT INTO atividade (titulo, descricao, id_materia, id_turma, prazo) VALUES (?,?,?,?,?)',
            [titulo, descricao || null, id_materia, id_turma, prazo]
        );
        return r.insertId;
    }

    static async editar(id, titulo, descricao, id_materia, id_turma, prazo) {
        await db.execute(
            'UPDATE atividade SET titulo=?, descricao=?, id_materia=?, id_turma=?, prazo=? WHERE id_atividade=?',
            [titulo, descricao || null, id_materia, id_turma, prazo, id]
        );
    }

    static async deletar(id) {
        await db.execute('DELETE FROM atividade WHERE id_atividade=?', [id]);
    }

    static async contarTotal() {
        const [rows] = await db.execute('SELECT COUNT(*) AS total FROM atividade');
        return rows[0].total;
    }

    static async proximasPorAluno(id_aluno) {
        const [rows] = await db.execute(
            `SELECT at.*, t.nome_turma, m.nome_materia FROM atividade at
             JOIN turma t ON at.id_turma = t.id_turma
             JOIN matricula mt ON mt.id_turma = t.id_turma
             LEFT JOIN materia m ON at.id_materia = m.id_materia
             WHERE mt.id_aluno = ? AND at.prazo >= NOW()
             ORDER BY at.prazo ASC LIMIT 10`,
            [id_aluno]
        );
        return rows;
    }
}

module.exports = Atividade;
