// middleware/auth.js
// Níveis: 1 = Aluno | 2 = Professor | 3 = Gestão

function autenticado(req, res, next) {
    if (req.session && req.session.usuario) return next();
    return res.status(401).json({ erro: 'Acesso negado. Faça login primeiro.' });
}

function apenasGestao(req, res, next) {
    if (req.session.usuario?.id_nivel === 3) return next();
    return res.status(403).json({ erro: 'Acesso proibido. Apenas Gestão.' });
}

function professorOuGestao(req, res, next) {
    const nivel = req.session.usuario?.id_nivel;
    if (nivel === 2 || nivel === 3) return next();
    return res.status(403).json({ erro: 'Acesso proibido. Apenas Professor ou Gestão.' });
}

module.exports = { autenticado, apenasGestao, professorOuGestao };
