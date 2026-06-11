-- ============================================================
-- GURU'S LEARN — Banco de Dados
-- ============================================================
DROP DATABASE IF EXISTS gurus_learn_db;

CREATE DATABASE gurus_learn_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE gurus_learn_db;

-- ── Níveis de perfil ──────────────────────────────────────────
-- 1 = Aluno  |  2 = Professor  |  3 = Gestão (admin)
CREATE TABLE nivel (
    id_nivel   INT AUTO_INCREMENT PRIMARY KEY,
    nome_nivel VARCHAR(50) NOT NULL
);

-- ── Usuários ──────────────────────────────────────────────────
CREATE TABLE usuario (
    id_usuario      INT AUTO_INCREMENT PRIMARY KEY,
    nome            VARCHAR(255) NOT NULL,
    email           VARCHAR(255) NOT NULL UNIQUE,
    cpf             CHAR(11)     NOT NULL UNIQUE,
    telefone        VARCHAR(20)  NOT NULL,
    data_nascimento DATE         NOT NULL,
    senha           VARCHAR(255) NOT NULL,
    id_nivel        INT,
    criado_em       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_nivel) REFERENCES nivel(id_nivel)
);

-- ── Matérias ──────────────────────────────────────────────────
CREATE TABLE materia (
    id_materia   INT AUTO_INCREMENT PRIMARY KEY,
    nome_materia VARCHAR(100) NOT NULL
);

-- ── Turmas ────────────────────────────────────────────────────
CREATE TABLE turma (
    id_turma     INT AUTO_INCREMENT PRIMARY KEY,
    nome_turma   VARCHAR(255) NOT NULL UNIQUE,
    descricao    TEXT,
    id_professor INT,
    criado_em    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_professor) REFERENCES usuario(id_usuario)
);

-- ── Matrícula de alunos em turmas ────────────────────────────
CREATE TABLE matricula (
    id_matricula INT AUTO_INCREMENT PRIMARY KEY,
    id_aluno     INT NOT NULL,
    id_turma     INT NOT NULL,
    criado_em    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_matricula (id_aluno, id_turma),
    FOREIGN KEY (id_aluno) REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_turma) REFERENCES turma(id_turma)     ON DELETE CASCADE
);

-- ── Aulas ─────────────────────────────────────────────────────
CREATE TABLE aula (
    id_aula    INT AUTO_INCREMENT PRIMARY KEY,
    titulo     VARCHAR(255) NOT NULL,
    data_aula  DATETIME     NOT NULL,
    conteudo   TEXT         NOT NULL,
    id_turma   INT,
    criado_em  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_turma) REFERENCES turma(id_turma)
);

-- ── Atividades ────────────────────────────────────────────────
CREATE TABLE atividade (
    id_atividade INT AUTO_INCREMENT PRIMARY KEY,
    titulo       VARCHAR(255) NOT NULL,
    descricao    TEXT,
    id_materia   INT,
    id_turma     INT,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    prazo        DATETIME  NOT NULL,
    FOREIGN KEY (id_turma)   REFERENCES turma(id_turma),
    FOREIGN KEY (id_materia) REFERENCES materia(id_materia)
);

-- ══ DADOS INICIAIS ═══════════════════════════════════════════

INSERT INTO nivel (nome_nivel) VALUES ('Aluno'), ('Professor'), ('Gestão');

INSERT INTO materia (nome_materia) VALUES
  ('Programação Orientada a Objetos'),
  ('Desenvolvimento Web'),
  ('Banco de Dados'),
  ('Lógica de Programação'),
  ('Redes de Computadores');
