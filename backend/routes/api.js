// backend/routes/api.js

const express = require('express');
const router  = express.Router();

const AuthController      = require('../controllers/AuthController');
const TurmaController     = require('../controllers/TurmaController');
const AulaController      = require('../controllers/AulaController');
const AtividadeController = require('../controllers/AtividadeController');
const UsuarioController   = require('../controllers/UsuarioController');

const { autenticado, apenasGestao, professorOuGestao } = require('../middleware/auth');

// ── AUTENTICAÇÃO ──────────────────────────────────────────────
router.post('/login',    AuthController.login);
router.post('/register', AuthController.register);
router.post('/logout',   autenticado, AuthController.logout);
router.get ('/sessao',   autenticado, AuthController.sessao);

// ── ESTATÍSTICAS ──────────────────────────────────────────────
router.get('/estatisticas', autenticado, UsuarioController.estatisticas);
router.get('/materias',     autenticado, UsuarioController.materias);
router.get('/professores',  autenticado, UsuarioController.professores);

// ── TURMAS ────────────────────────────────────────────────────
router.get   ('/turmas',               autenticado,                    TurmaController.listar);
router.post('/turmas/ingressar',       autenticado,                    TurmaController.ingressar);
router.get   ('/turmas/disponiveis',   autenticado,                    TurmaController.listarDisponiveis);
router.get   ('/turmas/:id',           autenticado,                    TurmaController.buscarUm);
router.get   ('/turmas/:id/alunos',    autenticado, professorOuGestao, TurmaController.alunos); // Ajuste Manual: Permite ver quem está na sala!
router.post  ('/turmas',               autenticado, apenasGestao,      TurmaController.criar);
router.put   ('/turmas/:id',           autenticado, apenasGestao,      TurmaController.editar);
router.delete('/turmas/:id',           autenticado, apenasGestao,      TurmaController.deletar);
router.post  ('/turmas/:id/matricular',autenticado,                    TurmaController.matricular);
router.delete('/turmas/:id/matricular',autenticado,                    TurmaController.desmatricular);

// ── AULAS ─────────────────────────────────────────────────────
router.get   ('/aulas',                autenticado,                   AulaController.listar);
router.get   ('/aulas/proximas',       autenticado,                   AulaController.proximasAulas);
router.get   ('/aulas/:id',            autenticado,                   AulaController.buscarUm);
router.get   ('/turmas/:id_turma/aulas',autenticado,                  AulaController.listarPorTurma);
router.post  ('/aulas',                autenticado, professorOuGestao, AulaController.criar);
router.put   ('/aulas/:id',            autenticado, professorOuGestao, AulaController.editar);
router.delete('/aulas/:id',            autenticado, professorOuGestao, AulaController.deletar);

// ── SISTEMA DE PRESENÇA / CHAMADA ─────────────────────────────
router.get ('/aulas/:id/presencas', autenticado, professorOuGestao, AulaController.listarPresencas);
router.post('/aulas/:id/presenca',  autenticado, professorOuGestao, AulaController.registrarPresenca);

// ── GURUPOS HUB ───────────────────────────────────────────────
router.get ('/gurupos',        autenticado, TurmaController.listarGurupos);
router.post('/gurupos/criar',  autenticado, TurmaController.criarGurupo);
router.post('/gurupos/entrar', autenticado, TurmaController.entrarGurupo);

// ── ATIVIDADES ────────────────────────────────────────────────
router.get   ('/atividades',           autenticado,                    AtividadeController.listar);
router.get   ('/atividades/:id/entregas', autenticado,                 AtividadeController.listarEntregas);
router.get   ('/atividades/proximas',  autenticado,                    AtividadeController.proximasPorAluno);
router.get   ('/atividades/:id',       autenticado,                    AtividadeController.buscarUm);
router.post  ('/atividades',           autenticado, professorOuGestao, AtividadeController.criar);
router.put   ('/atividades/:id',       autenticado, professorOuGestao, AtividadeController.editar);
router.delete('/atividades/:id',       autenticado, professorOuGestao, AtividadeController.deletar);

// ── CONFIRMAÇÃO DE ENTREGA (Sim/Não) ──────────────────────────
router.post('/atividades/:id/entregar', autenticado, AtividadeController.confirmarEntrega);

// ── USUÁRIOS ──────────────────────────────────────────────────
router.get   ('/usuarios',     autenticado, apenasGestao, UsuarioController.listar);
router.get   ('/usuarios/:id', autenticado,               UsuarioController.buscarUm);
router.put   ('/usuarios/:id', autenticado, apenasGestao, UsuarioController.atualizar);
router.delete('/usuarios/:id', autenticado, apenasGestao, UsuarioController.deletar);

module.exports = router;
