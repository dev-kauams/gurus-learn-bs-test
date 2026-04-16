# 🚗 Locadora Premium — Sistema de Gestão de Veículos

Sistema web completo para locadora de veículos, desenvolvido em duas etapas: primeiro o frontend estático visual e depois a integração com backend Node.js + MySQL.

---

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Etapa 1 — Frontend Estático](#etapa-1--frontend-estático)
- [Etapa 2 — Backend e Dinamismo](#etapa-2--backend-e-dinamismo)
- [Tecnologias](#tecnologias)

---

## Visão Geral

A aplicação permite que clientes visualizem a frota disponível na vitrine pública e que administradores gerenciem veículos (cadastrar, editar, alugar e devolver) através de um painel protegido por autenticação.

---

## Etapa 1 — Frontend Estático

> Nesta etapa construímos apenas a parte visual. Não há Node.js, banco de dados ou JavaScript customizado. Os dados dos veículos estão "chumbados" (hardcoded) no HTML para representação visual.
> Para visualizar, basta abrir os arquivos `.html` diretamente no navegador ou usar a extensão **Live Server** do VS Code.

### 📂 Estrutura de Pastas

```text
Locadora/
└── frontend/
    ├── css/
    │   └── style.css          ← Estilos globais (Bootstrap + customizações)
    └── views/
        ├── index.html         ← Vitrine pública com cards estáticos
        ├── login.html         ← Formulário de login (visual)
        └── dashboard.html     ← Painel administrativo com tabela estática
```

### ⚙️ Como Criar a Estrutura

Abra o terminal na raiz do projeto (`Locadora/`) e execute:

```bash
# Cria as pastas
mkdir -p frontend/css frontend/views

# Cria os arquivos
touch frontend/css/style.css \
      frontend/views/index.html \
      frontend/views/login.html \
      frontend/views/dashboard.html
```

### 🖥️ Telas

| Tela | Arquivo | Descrição |
|---|---|---|
| Vitrine Pública | `index.html` | Grid de cards com veículos e modal de detalhes |
| Login | `login.html` | Formulário de autenticação com credenciais de teste |
| Dashboard Admin | `dashboard.html` | Painel com tabela, formulário de cadastro e cálculo de previsão |

### 🎨 Dependências (CDN — sem instalação)

- [Bootstrap 5.3](https://getbootstrap.com/) — layout e componentes
- [Font Awesome 6](https://fontawesome.com/) — ícones

---

## Etapa 2 — Backend e Dinamismo

> Nesta etapa damos vida ao frontend. Configuramos o banco de dados MySQL e o servidor Node.js, e inserimos os scripts JS no frontend para que as tabelas e grids se preencham automaticamente com dados reais.

### 📂 Estrutura Completa do Projeto

```text
Locadora/
├── banco_de_dados.sql              ← Script de criação do banco
├── uploads/                        ← Imagens dos veículos (gerado automaticamente)
├── backend/
│   ├── .env                        ← Variáveis de ambiente (não versionado)
│   ├── package.json
│   ├── server.js                   ← Entrada da aplicação (Express)
│   ├── seed.js                     ← Popula usuários iniciais no banco
│   ├── config/
│   │   ├── db.js                   ← Pool de conexões MySQL
│   │   └── upload.js               ← Configuração do Multer (upload de imagens)
│   ├── models/
│   │   ├── Usuario.js              ← Queries de usuário
│   │   └── Veiculo.js              ← Queries de veículo
│   ├── middleware/
│   │   └── auth.js                 ← Proteção de rotas (verificação de sessão)
│   ├── controllers/
│   │   ├── AuthController.js       ← Login e logout
│   │   └── VeiculoController.js    ← CRUD de veículos, alugar, devolver
│   └── routes/
│       └── api.js                  ← Definição de todas as rotas da API
└── frontend/
    ├── css/
    │   └── style.css
    ├── views/
    │   ├── index.html
    │   ├── login.html
    │   └── dashboard.html
    └── js/
        ├── public.js               ← Carrega vitrine dinamicamente
        ├── auth.js                 ← Gerencia login/logout
        └── app.js                  ← Lógica do dashboard (CRUD via fetch)
```

### ✅ Pré-requisitos

- [Node.js](https://nodejs.org/) v18+
- [MySQL](https://www.mysql.com/) (ou MySQL Workbench)
- NPM

### 🗄️ 1. Configurar o Banco de Dados

Execute o arquivo `banco_de_dados.sql` no MySQL Workbench (ou via terminal):

```bash
mysql -u root -p < banco_de_dados.sql
```

Esse script cria o banco `locadora_db`, as tabelas `usuarios` e `veiculos`, e insere 3 veículos de exemplo.

### 📦 2. Instalar Dependências

```bash
# Cria as pastas do backend e os arquivos JS do frontend
mkdir -p backend/config backend/models backend/middleware backend/controllers backend/routes frontend/js

touch backend/config/db.js backend/config/upload.js \
      backend/models/Usuario.js backend/models/Veiculo.js \
      backend/seed.js backend/middleware/auth.js \
      backend/controllers/AuthController.js backend/controllers/VeiculoController.js \
      backend/routes/api.js backend/server.js \
      frontend/js/public.js frontend/js/auth.js frontend/js/app.js banco_de_dados.sql

# Entra na pasta backend e instala os pacotes
cd backend
npm init -y
npm install express mysql2 cors bcrypt express-session dotenv multer
npm install --save-dev nodemon
```

Em `backend/package.json`, adicione os scripts:

```json
"scripts": {
  "start": "node server.js",
  "dev":   "nodemon server.js",
  "seed":  "node seed.js"
}
```

### 🔐 3. Configurar Variáveis de Ambiente

Crie o arquivo `backend/.env` **(nunca suba esse arquivo para o repositório)**:

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=SuaSenhaAqui
DB_NAME=locadora_db
SESSION_SECRET=minha_chave_super_secreta_locadora_2024
```

### 👤 4. Criar Usuários Iniciais

Com o banco configurado e o `.env` preenchido, rode o seed para criar os usuários padrão:

```bash
# Ainda dentro da pasta backend/
npm run seed
```

| Perfil | Usuário | Senha |
|---|---|---|
| Administrador | `admin` | `admin123` |
| Usuário comum | `usuario` | `user123` |

### 🚀 5. Rodar o Servidor

```bash
# Dentro da pasta backend/
npm run dev
```

Acesse **[http://localhost:3000](http://localhost:3000)** no navegador. O Express serve todas as telas e a API. Os dados estáticos do HTML serão substituídos pelos dados reais vindos do banco de dados.

### 🔌 Rotas da API

| Método | Rota | Autenticação | Descrição |
|---|---|---|---|
| `POST` | `/api/auth/login` | ✗ | Realiza login |
| `POST` | `/api/auth/logout` | ✓ | Realiza logout |
| `GET` | `/api/auth/me` | ✓ | Retorna usuário da sessão |
| `GET` | `/api/veiculos` | ✗ | Lista todos os veículos |
| `POST` | `/api/veiculos` | ✓ Admin | Cadastra novo veículo |
| `PUT` | `/api/veiculos/:id` | ✓ Admin | Edita veículo |
| `DELETE` | `/api/veiculos/:id` | ✓ Admin | Remove veículo |
| `PATCH` | `/api/veiculos/:id/alugar` | ✓ | Marca como alugado |
| `PATCH` | `/api/veiculos/:id/devolver` | ✓ | Marca como disponível |

---

## 🛠️ Tecnologias

**Frontend**
- HTML5, CSS3
- Bootstrap 5.3
- Font Awesome 6
- JavaScript (Fetch API)
- SweetAlert2

**Backend**
- Node.js
- Express.js
- MySQL2
- bcrypt (hash de senhas)
- express-session (autenticação por sessão)
- Multer (upload de imagens)
- dotenv

---

> Projeto desenvolvido com fins educacionais para prática de desenvolvimento web full stack.
