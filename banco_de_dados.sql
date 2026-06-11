-- ============================================================
-- GURU'S LEARN — Banco de Dados Atualizado
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
    FOREIGN KEY (id_nivel) REFERENCES nivel(id_nivel) ON DELETE SET NULL
);

-- ── Matérias ──────────────────────────────────────────────────
CREATE TABLE materia (
    id_materia   INT AUTO_INCREMENT PRIMARY KEY,
    nome_materia VARCHAR(100) NOT NULL
);

-- ── Turmas ────────────────────────────────────────────────────
-- Ajuste manual: Antes, ao apagar o professor, a turma era apagada também.
CREATE TABLE turma (
    id_turma     INT AUTO_INCREMENT PRIMARY KEY,
    nome_turma   VARCHAR(255) NOT NULL UNIQUE,
    descricao    TEXT,
    id_professor INT,
    criado_em    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_professor) REFERENCES usuario(id_usuario) ON DELETE SET NULL
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
-- Ajuste Manual: Se a turma for deletada, todas as aulas vinculadas a ela caem em cascata
CREATE TABLE aula (
    id_aula    INT AUTO_INCREMENT PRIMARY KEY,
    titulo     VARCHAR(255) NOT NULL,
    data_aula  DATETIME     NOT NULL,
    conteudo   TEXT         NOT NULL,
    id_turma   INT,
    criado_em  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_turma) REFERENCES turma(id_turma) ON DELETE CASCADE
);

-- ── Atividades ────────────────────────────────────────────────
-- Ajuste Manual: Se a turma for deletada, as atividades também somem em cascata
CREATE TABLE atividade (
    id_atividade INT AUTO_INCREMENT PRIMARY KEY,
    titulo       VARCHAR(255) NOT NULL,
    descricao    TEXT,
    id_materia   INT,
    id_turma     INT,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    prazo        DATETIME  NOT NULL,
    FOREIGN KEY (id_turma)   REFERENCES turma(id_turma)     ON DELETE CASCADE,
    FOREIGN KEY (id_materia) REFERENCES materia(id_materia) ON DELETE SET NULL
);


-- Novas tabelas para maior experiência do usuário. --

-- ── Chamada / Presença (Exclusivo Professor/Gestão) ───────────
CREATE TABLE presenca (
    id_presenca   INT AUTO_INCREMENT PRIMARY KEY,
    id_aula       INT NOT NULL,
    id_aluno      INT NOT NULL,
    status        ENUM('Presente', 'Ausente') NOT NULL DEFAULT 'Presente',
    data_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_aula)  REFERENCES aula(id_aula)       ON DELETE CASCADE,
    FOREIGN KEY (id_aluno) REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    UNIQUE KEY uq_aula_aluno (id_aula, id_aluno) -- Impede duplicar chamada para o mesmo aluno na mesma aula
);

-- ── Gurupos (Canais/Grupos de Conversa com Código Estilo Discord) ─
CREATE TABLE gurupo (
    id_gurupo     INT AUTO_INCREMENT PRIMARY KEY,
    nome          VARCHAR(100) NOT NULL,
    codigo_acesso VARCHAR(10)  NOT NULL UNIQUE, -- Código gerado automaticamente.
    id_criador    INT NOT NULL,
    criado_em     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_criador) REFERENCES usuario(id_usuario) ON DELETE CASCADE
);

-- ── Membros dos Gurupos ───────────────────────────────────────
CREATE TABLE gurupo_membro (
    id_gurupo INT NOT NULL,
    id_usuario INT NOT NULL,
    adicionado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_gurupo, id_usuario),
    FOREIGN KEY (id_gurupo)  REFERENCES gurupo(id_gurupo)   ON DELETE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE
);

-- ── Entregas e Confirmações de Atividades (Form Expansível) ───
CREATE TABLE entrega_atividade (
    id_entrega   INT AUTO_INCREMENT PRIMARY KEY,
    id_atividade INT NOT NULL,
    id_aluno     INT NOT NULL,
    entregue     TINYINT(1) NOT NULL DEFAULT 0, -- Botão Rádico. 1 = Sim. 0 = Não.
    arquivo_url  VARCHAR(255) NULL,             -- Guarda o caminho físico do arquivo (Multer)
    entregue_em  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_atividade) REFERENCES atividade(id_atividade) ON DELETE CASCADE,
    FOREIGN KEY (id_aluno)     REFERENCES usuario(id_usuario)     ON DELETE CASCADE,
    UNIQUE KEY uq_atividade_aluno (id_atividade, id_aluno) -- Apenas um status de entrega por aluno/atividade
);


-- ══ DADOS INICIAIS ═══════════════════════════════════════════

INSERT INTO nivel (nome_nivel) VALUES ('Aluno'), ('Professor'), ('Gestão');

INSERT INTO materia (nome_materia) VALUES
  ('Programação Orientada a Objetos'),
  ('Desenvolvimento Web'),
  ('Banco de Dados'),
  ('Lógica de Programação'),
  ('Redes de Computadores');