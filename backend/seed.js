// seed.js — Cria usuários e dados iniciais
require('dotenv').config();
const bcrypt = require('bcrypt');
const pool   = require('./config/db');

async function seed() {
    console.log('\n🌱 Criando dados iniciais...\n');

    const usuarios = [
        { nome: 'Admin Gestão',      email: 'admin@gurus.com',     cpf: '00000000001', telefone: '11999990001', data: '1980-01-01', senha: 'admin123',   nivel: 3 },
        { nome: 'Prof. Carlos Silva', email: 'carlos@gurus.com',    cpf: '00000000002', telefone: '11999990002', data: '1985-05-10', senha: 'prof123',    nivel: 2 },
        { nome: 'Prof. Ana Lima',    email: 'ana@gurus.com',        cpf: '00000000003', telefone: '11999990003', data: '1990-08-22', senha: 'prof123',    nivel: 2 },
        { nome: 'Aluno João',        email: 'joao@gurus.com',       cpf: '00000000004', telefone: '11999990004', data: '2005-03-15', senha: 'aluno123',   nivel: 1 },
        { nome: 'Aluna Maria',       email: 'maria@gurus.com',      cpf: '00000000005', telefone: '11999990005', data: '2006-07-20', senha: 'aluno123',   nivel: 1 },
    ];

    const ids = {};
    for (const u of usuarios) {
        const hash = await bcrypt.hash(u.senha, 10);
        const [r]  = await pool.execute(
            `INSERT INTO usuario (nome, email, cpf, telefone, data_nascimento, senha, id_nivel)
             VALUES (?,?,?,?,?,?,?)
             ON DUPLICATE KEY UPDATE senha=VALUES(senha)`,
            [u.nome, u.email, u.cpf, u.telefone, u.data, hash, u.nivel]
        );
        const id = r.insertId || (await pool.execute('SELECT id_usuario FROM usuario WHERE email=?', [u.email]))[0][0].id_usuario;
        ids[u.email] = id;
        const nivel = ['', 'Aluno', 'Professor', 'Gestão'][u.nivel];
        console.log(`✅  ${u.nome.padEnd(22)} (${nivel})  →  ${u.email} / ${u.senha}`);
    }

    // Turmas
    const turmas = [
        { nome: '2IH-DS', descricao: 'Turma de Desenvolvimento de Sistemas', prof: ids['carlos@gurus.com'] },
        { nome: '2IG-DS', descricao: 'Turma de Informática Geral',           prof: ids['ana@gurus.com']    },
    ];
    const tidMap = {};
    for (const t of turmas) {
        const [r] = await pool.execute(
            `INSERT INTO turma (nome_turma, descricao, id_professor) VALUES (?,?,?)
             ON DUPLICATE KEY UPDATE descricao=VALUES(descricao)`,
            [t.nome, t.descricao, t.prof]
        );
        const tid = r.insertId || (await pool.execute('SELECT id_turma FROM turma WHERE nome_turma=?', [t.nome]))[0][0].id_turma;
        tidMap[t.nome] = tid;
        console.log(`📚  Turma: ${t.nome}`);
    }

    // Matrículas
    const matr = [
        [ids['joao@gurus.com'],  tidMap['2IH-DS']],
        [ids['maria@gurus.com'], tidMap['2IH-DS']],
        [ids['joao@gurus.com'],  tidMap['2IG-DS']],
    ];
    for (const [al, tr] of matr)
        await pool.execute('INSERT IGNORE INTO matricula (id_aluno, id_turma) VALUES (?,?)', [al, tr]);

    // Matérias (já inseridas no SQL, só pega os IDs)
    const [mats] = await pool.execute('SELECT id_materia, nome_materia FROM materia');
    const midMap = Object.fromEntries(mats.map(m => [m.nome_materia, m.id_materia]));

    // Aulas
    const aulas = [
        { titulo: 'Introdução à POO',      data: '2026-06-10 08:00:00', conteudo: 'Conceitos de classes, objetos, herança e polimorfismo.', turma: '2IH-DS' },
        { titulo: 'HTML & CSS Avançado',   data: '2026-06-12 10:00:00', conteudo: 'Flexbox, Grid Layout e boas práticas de semântica.', turma: '2IH-DS' },
        { titulo: 'Banco de Dados I',      data: '2026-06-14 14:00:00', conteudo: 'Modelagem relacional, normalização e SQL básico.', turma: '2IG-DS' },
    ];
    for (const a of aulas)
        await pool.execute('INSERT IGNORE INTO aula (titulo, data_aula, conteudo, id_turma) VALUES (?,?,?,?)',
            [a.titulo, a.data, a.conteudo, tidMap[a.turma]]);

    // Atividades
    const pooId = midMap['Programação Orientada a Objetos'];
    const webId = midMap['Desenvolvimento Web'];
    const atividades = [
        { titulo: 'POO - Exercício 1',  descricao: 'Criar classe Aluno com herança.',      id_mat: pooId, turma: '2IH-DS', prazo: '2026-06-17 23:59:00' },
        { titulo: 'Landing Page React', descricao: 'Página com React.js e TypeScript.',    id_mat: webId, turma: '2IH-DS', prazo: '2026-06-20 23:59:00' },
        { titulo: 'SQL - Exercício 1',  descricao: 'Consultas com JOIN e GROUP BY.',       id_mat: midMap['Banco de Dados'], turma: '2IG-DS', prazo: '2026-06-22 23:59:00' },
    ];
    for (const at of atividades)
        await pool.execute('INSERT IGNORE INTO atividade (titulo, descricao, id_materia, id_turma, prazo) VALUES (?,?,?,?,?)',
            [at.titulo, at.descricao, at.id_mat, tidMap[at.turma], at.prazo]);

    console.log('\n✅  Seed concluído!\n');
    console.log('──────────────────────────────────────────────────');
    console.log('⚙️   admin@gurus.com   / admin123  → Gestão (dashboard)');
    console.log('👨‍🏫  carlos@gurus.com  / prof123   → Professor');
    console.log('👩‍🏫  ana@gurus.com     / prof123   → Professor');
    console.log('👤  joao@gurus.com    / aluno123  → Aluno');
    console.log('👤  maria@gurus.com   / aluno123  → Aluno\n');
    process.exit(0);
}

seed().catch(e => { console.error('❌ Erro no seed:', e); process.exit(1); });
