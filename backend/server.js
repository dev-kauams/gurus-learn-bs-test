// server.js — Ponto de entrada do Guru's Learn
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors    = require('cors');
const path    = require('path');

const apiRoutes = require('./routes/api');
const app       = express();
const PORT      = process.env.PORT || 3001;

app.use(cors({ origin: `http://localhost:${PORT}`, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret:            process.env.SESSION_SECRET || 'gurus_secret',
    resave:            false,
    saveUninitialized: false,
    cookie: { httpOnly: true, secure: false, maxAge: 1000 * 60 * 60 * 8 }
}));

// Estáticos
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API
app.use('/api', apiRoutes);

// Rotas HTML
app.get('/',          (_, res) => res.sendFile(path.join(__dirname, '../frontend/views/login.html')));
app.get('/login',     (_, res) => res.sendFile(path.join(__dirname, '../frontend/views/login.html')));
app.get('/portal',    (_, res) => res.sendFile(path.join(__dirname, '../frontend/views/index.html')));
app.get('/dashboard', (_, res) => res.sendFile(path.join(__dirname, '../frontend/views/dashboard.html')));

// Handler global de erros (Express 5)
app.use((err, req, res, next) => {
    console.error('Erro:', err.message);
    if (res.headersSent) return next(err);
    res.status(err.status || 500).json({ erro: err.message || 'Erro interno.' });
});

app.listen(PORT, () => {
    console.log(`\n🚀 Servidor:   http://localhost:${PORT}`);
    console.log(`🔐 Login:      http://localhost:${PORT}/login`);
    console.log(`🎓 Portal:     http://localhost:${PORT}/portal`);
    console.log(`⚙️  Dashboard:  http://localhost:${PORT}/dashboard\n`);
});
