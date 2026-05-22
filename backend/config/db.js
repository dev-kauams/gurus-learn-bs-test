// Carrega as variáveis de ambiente do arquivo .env
require('dotenv').config();

// Importa a versão com suporte a Promises (async/await) do mysql2
const mysql = require('mysql2/promise');

// Cria um "pool" de conexões.
// Um pool é uma reserva de conexões abertas com o banco.
// Quando uma requisição precisa do banco, ela "pega emprestado" uma conexão
// do pool e a devolve ao terminar — muito mais eficiente do que abrir/fechar sempre.
const pool = mysql.createPool({
    host:     process.env.DB_HOST,      // Endereço do servidor MySQL (normalmente localhost)
    user:     process.env.DB_USER,      // Usuário do banco (normalmente root)
    password: process.env.DB_PASSWORD,  // Senha do banco (lida do .env, nunca escrita aqui)
    database: process.env.DB_NAME,      // Nome do banco que vamos usar

    waitForConnections: true,  // Se todas as conexões estiverem em uso, espera ao invés de dar erro
    connectionLimit:    10,    // Número máximo de conexões simultâneas no pool
    queueLimit:         0      // Fila ilimitada de requisições esperando por uma conexão
});

// Exporta o pool para que os Models possam importar e usar
module.exports = pool;