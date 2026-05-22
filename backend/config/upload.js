// Importa o Multer, biblioteca responsável por receber arquivos enviados via formulário
const multer = require('multer');

// Importa 'path' para trabalhar com caminhos de arquivo de forma segura
const path = require('path');

// Importa 'fs' (file system) para verificar e criar pastas
const fs = require('fs');

// ============================================================
// CONFIGURAÇÃO DE ARMAZENAMENTO
// Define ONDE e com QUAL NOME cada arquivo enviado será salvo
// ============================================================
const storage = multer.diskStorage({

    // 'destination' decide em qual pasta o arquivo será salvo
    destination: function (req, file, cb) {
        // Monta o caminho absoluto para a pasta 'uploads' na raiz do projeto.
        // __dirname = pasta atual (config/), então subimos dois níveis (../../)
        const uploadPath = path.join(__dirname, '../../uploads');

        // Verifica se a pasta 'uploads' existe.
        // Se não existir, o mkdirSync a cria automaticamente.
        // { recursive: true } garante que subpastas também sejam criadas se necessário.
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        // 'cb' é um "callback" — uma função que chamamos para dizer ao Multer o que fazer.
        // O primeiro parâmetro é o erro (null = sem erro), o segundo é o valor desejado.
        cb(null, uploadPath);
    },

    // 'filename' decide com qual nome o arquivo será salvo no disco
    filename: function (req, file, cb) {
        // Pega a extensão original do arquivo (ex: '.jpg', '.png')
        const extensao = path.extname(file.originalname);

        // Gera um nome único combinando o timestamp atual com um número aleatório.
        // Isso evita que dois arquivos com o mesmo nome original se sobreescrevam.
        const nomeUnico = Date.now() + '-' + Math.round(Math.random() * 1E9) + extensao;

        cb(null, nomeUnico);
    }
});

// ============================================================
// FILTRO DE TIPO DE ARQUIVO
// Rejeita qualquer arquivo que não seja uma imagem permitida
// ============================================================
const fileFilter = (req, file, cb) => {
    // Lista dos tipos MIME aceitos
    const tiposPermitidos = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

    if (tiposPermitidos.includes(file.mimetype)) {
        // Arquivo aceito: cb(null, true)
        cb(null, true);
    } else {
        // Arquivo rejeitado: cb(erro, false)
        cb(new Error('Formato inválido. Envie apenas JPG, PNG ou WEBP.'), false);
    }
};

// ============================================================
// INSTÂNCIA DO MULTER
// Junta as configurações de armazenamento, filtro e tamanho máximo
// ============================================================
const upload = multer({
    storage:    storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024  // Tamanho máximo: 5 MB (5 * 1024 bytes * 1024 bytes)
    }
});

// Exporta o objeto 'upload' para ser usado como middleware nas rotas
module.exports = upload;