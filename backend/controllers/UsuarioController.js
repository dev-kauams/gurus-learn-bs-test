// controllers/UsuarioController.js
const Usuario  = require('../models/Usuario');
const Atividade = require('../models/Atividade');
const Aula      = require('../models/Aula');
const Turma     = require('../models/Turma');

class UsuarioController {

    static async listar(req, res) {
        try {
            const usuarios = await Usuario.listarTodos();
            res.json(usuarios);
        } catch (e) { res.status(500).json({ erro: 'Erro ao listar usuários.' }); }
    }

    static async buscarUm(req, res) {
        try {
            const u = await Usuario.buscarPorId(req.params.id);
            if (!u) return res.status(404).json({ erro: 'Usuário não encontrado.' });
            const { senha, ...sem_senha } = u;
            res.json(sem_senha);
        } catch (e) { res.status(500).json({ erro: 'Erro ao buscar usuário.' }); }
    }

    static async atualizar(req, res) {
        const { nome, email, telefone, id_nivel } = req.body;
        if (!nome || !email) return res.status(400).json({ erro: 'Nome e email são obrigatórios.' });
        try {
            await Usuario.atualizar(req.params.id, nome, email, telefone, id_nivel);
            res.json({ mensagem: 'Usuário atualizado!' });
        } catch (e) { res.status(500).json({ erro: 'Erro ao atualizar usuário.' }); }
    }

    static async deletar(req, res) {
        if (req.params.id == req.session.usuario.id_usuario)
            return res.status(400).json({ erro: 'Você não pode remover a si mesmo.' });
        try {
            await Usuario.deletar(req.params.id);
            res.json({ mensagem: 'Usuário removido.' });
        } catch (e) { res.status(500).json({ erro: 'Erro ao remover usuário.' }); }
    }

    // GET /api/estatisticas — cards do dashboard
    static async estatisticas(req, res) {
        try {
            const [porNivel, totalTurmas, totalAulas, totalAtividades] = await Promise.all([
                Usuario.contarPorNivel(),
                Turma.contarTotal(),
                Aula.contarTotal(),
                Atividade.contarTotal()
            ]);
            const alunos     = porNivel.find(n => n.nome_nivel === 'Aluno')?.total     || 0;
            const professores= porNivel.find(n => n.nome_nivel === 'Professor')?.total || 0;
            res.json({ alunos, professores, totalTurmas, totalAulas, totalAtividades });
        } catch (e) { res.status(500).json({ erro: 'Erro ao buscar estatísticas.' }); }
    }

    // GET /api/materias
    static async materias(req, res) {
        try {
            const db = require('../config/db');
            const [rows] = await db.execute('SELECT * FROM materia ORDER BY nome_materia');
            res.json(rows);
        } catch (e) { res.status(500).json({ erro: 'Erro ao listar matérias.' }); }
    }

    // GET /api/professores
    static async professores(req, res) {
        try {
            const db = require('../config/db');
            const [rows] = await db.execute(
                'SELECT id_usuario, nome FROM usuario WHERE id_nivel = 2 ORDER BY nome'
            );
            res.json(rows);
        } catch (e) { res.status(500).json({ erro: 'Erro ao listar professores.' }); }
    }
}

module.exports = UsuarioController;
