// models/Aula.js
const db = require('../config/db');

class Aula {
    constructor(id_aula, titulo, data_aula, conteudo, id_turma) {
        this.id_aula   = id_aula;
        this.titulo    = titulo;
        this.data_aula = data_aula;
        this.conteudo  = conteudo;
        this.id_turma  = id_turma;
    }

    static async listarTodas() {
        const [rows] = await db.execute(
            `SELECT a.*, t.nome_turma FROM aula a
             LEFT JOIN turma t ON a.id_turma = t.id_turma
             ORDER BY a.data_aula DESC`
        );
        return rows;
    }

    static async listarPorTurma(id_turma) {
        const [rows] = await db.execute(
            `SELECT a.*, t.nome_turma FROM aula a
             LEFT JOIN turma t ON a.id_turma = t.id_turma
             WHERE a.id_turma = ? ORDER BY a.data_aula DESC`,
            [id_turma]
        );
        return rows;
    }

    static async listarDoAluno(id_aluno) {
        const [rows] = await db.execute(
            `SELECT a.*, t.nome_turma FROM aula a
             JOIN turma t ON a.id_turma = t.id_turma
             JOIN matricula m ON m.id_turma = t.id_turma
             WHERE m.id_aluno = ? ORDER BY a.data_aula DESC`,
            [id_aluno]
        );
        return rows;
    }

    static async buscarPorId(id) {
        const [rows] = await db.execute(
            `SELECT a.*, t.nome_turma FROM aula a
             LEFT JOIN turma t ON a.id_turma = t.id_turma
             WHERE a.id_aula = ?`,
            [id]
        );
        return rows[0] || null;
    }

    static async criar(titulo, data_aula, conteudo, id_turma) {
        const [r] = await db.execute(
            'INSERT INTO aula (titulo, data_aula, conteudo, id_turma) VALUES (?,?,?,?)',
            [titulo, data_aula, conteudo, id_turma]
        );
        return r.insertId;
    }

    static async editar(id, titulo, data_aula, conteudo, id_turma) {
        await db.execute(
            'UPDATE aula SET titulo=?, data_aula=?, conteudo=?, id_turma=? WHERE id_aula=?',
            [titulo, data_aula, conteudo, id_turma, id]
        );
    }

    static async deletar(id) {
        await db.execute('DELETE FROM aula WHERE id_aula=?', [id]);
    }

    static async contarTotal() {
        const [rows] = await db.execute('SELECT COUNT(*) AS total FROM aula');
        return rows[0].total;
    }

    static async proximasAulas(id_aluno) {
        const [rows] = await db.execute(
            `SELECT a.*, t.nome_turma FROM aula a
             JOIN turma t ON a.id_turma = t.id_turma
             JOIN matricula m ON m.id_turma = t.id_turma
             WHERE m.id_aluno = ? AND a.data_aula >= NOW()
             ORDER BY a.data_aula ASC LIMIT 5`,
            [id_aluno]
        );
        return rows;
    }
}

module.exports = Aula;
