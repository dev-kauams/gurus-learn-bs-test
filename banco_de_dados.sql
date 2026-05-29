drop database if exists Portal;
create database Portal;
use Portal;

create table nivel(
id_nivel int not null auto_increment primary key,
nome_nivel varchar(50) not null
);

create table usuario(
id_usuario int not null auto_increment primary key,
nome varchar(255) not null,
email varchar(255) not null unique,
cpf char(11) not null unique,
telefone varchar(20) not null,
data_nascimento date not null,
senha varchar(255) not null,
id_nivel int,

foreign key (id_nivel) references nivel(id_nivel)
);

create table materia(
id_materia int not null auto_increment primary key,
nome_materia varchar(100) not null
);

create table turma(
id_turma int not null auto_increment primary key,
nome_turma varchar(255) not null unique,
id_professor int,

foreign key (id_professor) references usuario(id_usuario)
);

create table aula(
id_aula int not null auto_increment primary key,
titulo varchar(255) not null,
data_aula datetime not null,
conteudo text not null,
id_turma int,

foreign key (id_turma) references turma(id_turma)
);

create table atividade(
id_atividade int not null auto_increment primary key,
titulo varchar(255) not null,
id_materia int,
data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP not null,
prazo DATETIME not null,

id_turma int,

foreign key (id_turma) references turma(id_turma),
foreign key (id_materia) references materia(id_materia)
);

insert into nivel(nome_nivel) values
('Aluno'),
('Professor'),
('Gestão');

-- Visão básica de turma, professor responsável.
SELECT 
    u.nome AS Nome_Professor, 
    t.nome_turma AS Turma
FROM turma AS t
INNER JOIN usuario AS u ON t.id_professor = u.id_usuario;

-- Ver as atividades de uma turma específica.
SELECT 
    a.id_atividade,
    a.titulo AS Atividade,
    m.nome_materia AS Materia,
    a.data_criacao as Data_Criacao,
    a.prazo AS Data_Entrega,
    t.nome_turma AS Turma
FROM atividade AS a
INNER JOIN turma AS t ON a.id_turma = t.id_turma
INNER JOIN materia AS m ON a.id_materia = m.id_materia
WHERE t.nome_turma = '2IH-DS';

-- Ver as aulas de uma turma específica.
SELECT 
    au.id_aula,
    au.titulo AS Titulo_Aula,
    au.data_aula AS Data_Hora,
    au.conteudo AS Conteudo,
    t.nome_turma AS Turma
FROM aula AS au
INNER JOIN turma AS t ON au.id_turma = t.id_turma
WHERE t.nome_turma = '2IG-DS';


