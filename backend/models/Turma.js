// models/Turma.js
const db = require('../config/db');

class Turma {
    constructor(id_turma, nome_turma, descricao, id_professor) {
        this.id_turma     = id_turma;
        this.nome_turma   = nome_turma;
        this.descricao    = descricao;
        this.id_professor = id_professor;
    }

    static async listarTodas() {
        const [rows] = await db.execute(
            `SELECT t.*, u.nome AS nome_professor
             FROM turma t LEFT JOIN usuario u ON t.id_professor = u.id_usuario
             ORDER BY t.id_turma DESC`
        );
        return rows;
    }

    static async listarDoAluno(id_aluno) {
        const [rows] = await db.execute(
            `SELECT t.*, u.nome AS nome_professor
             FROM turma t
             JOIN matricula m ON m.id_turma = t.id_turma
             LEFT JOIN usuario u ON t.id_professor = u.id_usuario
             WHERE m.id_aluno = ?`,
            [id_aluno]
        );
        return rows;
    }

    static async listarDoProfessor(id_professor) {
        const [rows] = await db.execute(
            `SELECT t.*, u.nome AS nome_professor
             FROM turma t LEFT JOIN usuario u ON t.id_professor = u.id_usuario
             WHERE t.id_professor = ?`,
            [id_professor]
        );
        return rows;
    }

    static async buscarPorId(id) {
        const [rows] = await db.execute(
            `SELECT t.*, u.nome AS nome_professor
             FROM turma t LEFT JOIN usuario u ON t.id_professor = u.id_usuario
             WHERE t.id_turma = ?`,
            [id]
        );
        return rows[0] || null;
    }

    static async criar(nome_turma, descricao, id_professor) {
        const [r] = await db.execute(
            'INSERT INTO turma (nome_turma, descricao, id_professor) VALUES (?,?,?)',
            [nome_turma, descricao || null, id_professor || null]
        );
        return r.insertId;
    }

    static async editar(id, nome_turma, descricao, id_professor) {
        await db.execute(
            'UPDATE turma SET nome_turma=?, descricao=?, id_professor=? WHERE id_turma=?',
            [nome_turma, descricao || null, id_professor || null, id]
        );
    }

    static async deletar(id) {
        await db.execute('DELETE FROM turma WHERE id_turma=?', [id]);
    }

    static async matricularAluno(id_aluno, id_turma) {
        await db.execute(
            'INSERT IGNORE INTO matricula (id_aluno, id_turma) VALUES (?,?)',
            [id_aluno, id_turma]
        );
    }

    static async desmatricularAluno(id_aluno, id_turma) {
        await db.execute(
            'DELETE FROM matricula WHERE id_aluno=? AND id_turma=?',
            [id_aluno, id_turma]
        );
    }

    static async alunosDaTurma(id_turma) {
        const [rows] = await db.execute(
            `SELECT u.id_usuario, u.nome, u.email FROM usuario u
             JOIN matricula m ON m.id_aluno = u.id_usuario
             WHERE m.id_turma = ?`,
            [id_turma]
        );
        return rows;
    }

    static async contarTotal() {
        const [rows] = await db.execute('SELECT COUNT(*) AS total FROM turma');
        return rows[0].total;
    }
}

module.exports = Turma;
