// models/Usuario.js
const db     = require('../config/db');
const bcrypt = require('bcrypt');

class Usuario {
    constructor(id_usuario, nome, email, cpf, telefone, data_nascimento, id_nivel) {
        this.id_usuario      = id_usuario;
        this.nome            = nome;
        this.email           = email;
        this.cpf             = cpf;
        this.telefone        = telefone;
        this.data_nascimento = data_nascimento;
        this.id_nivel        = id_nivel;
    }

    ehAluno()     { return this.id_nivel === 1; }
    ehProfessor() { return this.id_nivel === 2; }
    ehGestao()    { return this.id_nivel === 3; }

    exibirUsuario() {
        const niveis = { 1: 'Aluno', 2: 'Professor', 3: 'Gestão' };
        return `${this.nome} | ${niveis[this.id_nivel] || 'Desconhecido'}`;
    }

    // ── Autenticação ──────────────────────────────────────────
    static async autenticar(email, senhaDigitada) {
        const [rows] = await db.execute('SELECT * FROM usuario WHERE email = ?', [email]);
        if (!rows.length) return null;
        const u = rows[0];
        const ok = await bcrypt.compare(senhaDigitada, u.senha);
        if (!ok) return null;
        return new Usuario(u.id_usuario, u.nome, u.email, u.cpf, u.telefone, u.data_nascimento, u.id_nivel);
    }

    // ── CRUD ──────────────────────────────────────────────────
    static async cadastrar(nome, email, cpf, telefone, data_nascimento, id_nivel, senha) {
        const hash = await bcrypt.hash(senha, 10);
        const [r]  = await db.execute(
            'INSERT INTO usuario (nome, email, cpf, telefone, data_nascimento, senha, id_nivel) VALUES (?,?,?,?,?,?,?)',
            [nome, email, cpf, telefone, data_nascimento, hash, id_nivel]
        );
        return new Usuario(r.insertId, nome, email, cpf, telefone, data_nascimento, id_nivel);
    }

    static async listarTodos() {
        const [rows] = await db.execute(
            `SELECT u.id_usuario, u.nome, u.email, u.cpf, u.telefone, u.data_nascimento, u.id_nivel, n.nome_nivel, u.criado_em
             FROM usuario u JOIN nivel n ON u.id_nivel = n.id_nivel ORDER BY u.id_usuario`
        );
        return rows;
    }

    static async buscarPorId(id) {
        const [rows] = await db.execute(
            `SELECT u.*, n.nome_nivel FROM usuario u JOIN nivel n ON u.id_nivel = n.id_nivel WHERE u.id_usuario = ?`, [id]
        );
        return rows[0] || null;
    }

    static async atualizar(id, nome, email, telefone, id_nivel) {
        await db.execute(
            'UPDATE usuario SET nome=?, email=?, telefone=?, id_nivel=? WHERE id_usuario=?',
            [nome, email, telefone, id_nivel, id]
        );
    }

    static async deletar(id) {
        await db.execute('DELETE FROM usuario WHERE id_usuario=?', [id]);
    }

    static async contarPorNivel() {
        const [rows] = await db.execute(
            `SELECT n.nome_nivel, COUNT(u.id_usuario) as total
             FROM nivel n LEFT JOIN usuario u ON n.id_nivel = u.id_nivel
             GROUP BY n.id_nivel, n.nome_nivel`
        );
        return rows;
    }
}

module.exports = Usuario;
