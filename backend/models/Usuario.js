// Importa o pool de conexões com o banco de dados
const db = require('../config/db');

// Importa o bcrypt para comparar senhas criptografadas
const bcrypt = require('bcrypt');

class Usuario {

    constructor(id_usuario, nome, email, cpf, telefone, data_nascimento, id_nivel){
        this.id = id_usuario;
        this.nome = nome;
        this.email = email;
        this.cpf = cpf;
        this.telefone = telefone;
        this.id_nivel = id_nivel;
        this.data_nascimento = data_nascimento;
    }

    // Método para exibir o Nome do usuário logado e Nível do mesmo.
    exibirUsuario() {
        return `Usuário: ${this.nome} | Nível de Perfil: ${this.id_nivel}`
    }

    static async autenticar(email, senhaDigitada){
        try {
            const [rows] = await db.execute('SELECT * FROM usuario WHERE email = ?', [email]);

            if (rows.length === 0){
                return null;
            }

            const dadosDoBanco = rows[0];

            const senhaValida = await bcrypt.compare(senhaDigitada, dadosDoBanco.senha);

            if(senhaValida){
                return new Usuario(
                dadosDoBanco.id_usuario, 
                dadosDoBanco.nome,
                dadosDoBanco.email,
                dadosDoBanco.cpf,
                dadosDoBanco.telefone,
                dadosDoBanco.data_nascimento,
                dadosDoBanco.id_nivel
            );
            }

            return null;
        } catch (erro) {
            console.error("Erro no model ao autenticar usuário: ", erro);
            throw erro;
        }
    }

    static async cadastrar(nome, email, cpf, telefone, data_nascimento, id_nivel, senhaDigitada){
        try{
            const senhaHash = await bcrypt.hash(senhaDigitada, 10);

            const [result] = await db.execute('INSERT INTO usuario (nome, email, cpf, telefone, data_nascimento, senha, id_nivel) VALUES (?, ?, ?, ?, ?, ?, ?)', 
            [nome, email, cpf, telefone, data_nascimento, senhaHash, id_nivel]
        );

        return new Usuario(result.insertId, nome, email, cpf, telefone, data_nascimento, id_nivel);
        } catch (erro) {
            console.error("Erro no model ao cadastrar usuário: ", erro);
            throw erro;
        }
    }
}

module.exports = Usuario;