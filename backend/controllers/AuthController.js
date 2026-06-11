// controllers/AuthController.js
const Usuario = require('../models/Usuario');

class AuthController {

    // POST /api/login
    static async login(req, res) {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ success: false, message: 'Informe email e senha.' });

        try {
            const usuario = await Usuario.autenticar(email, password);
            if (!usuario)
                return res.status(401).json({ success: false, message: 'Email ou senha incorretos.' });

            req.session.usuario = {
                id_usuario:  usuario.id_usuario,
                nome:        usuario.nome,
                email:       usuario.email,
                id_nivel:    usuario.id_nivel
            };

            // Redireciona conforme nível: 3 = gestão → dashboard admin
            const redirectTo = usuario.ehGestao() ? '/dashboard' : '/portal';
            return res.json({ success: true, user: req.session.usuario, redirectTo });

        } catch (e) {
            console.error(e);
            return res.status(500).json({ success: false, message: 'Erro interno.' });
        }
    }

    // POST /api/register
    static async register(req, res) {
        const { nome, email, cpf, telefone, dataNasc, password, passwordConfirm, id_nivel } = req.body;

        if (!nome || !email || !cpf || !telefone || !dataNasc || !password)
            return res.status(400).json({ success: false, message: 'Preencha todos os campos obrigatórios.' });

        if (password !== passwordConfirm)
            return res.status(400).json({ success: false, message: 'As senhas não coincidem.' });

        if (password.length < 8)
            return res.status(400).json({ success: false, message: 'Senha deve ter no mínimo 8 caracteres.' });

        try {
            const nivel = parseInt(id_nivel) || 1; // padrão: Aluno
            const usuario = await Usuario.cadastrar(nome, email, cpf, telefone, dataNasc, nivel, password);
            return res.status(201).json({ success: true, message: 'Cadastro realizado!', id: usuario.id_usuario });
        } catch (e) {
            if (e.code === 'ER_DUP_ENTRY')
                return res.status(409).json({ success: false, message: 'Email ou CPF já cadastrado.' });
            console.error(e);
            return res.status(500).json({ success: false, message: 'Erro interno.' });
        }
    }

    // POST /api/logout
    static logout(req, res) {
        req.session.destroy(() => {
            res.clearCookie('connect.sid');
            res.json({ success: true });
        });
    }

    // GET /api/sessao
    static sessao(req, res) {
        res.json({ success: true, user: req.session.usuario });
    }
}

module.exports = AuthController;
