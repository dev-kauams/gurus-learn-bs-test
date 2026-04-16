# 🚀 PROJETO LOCADORA — FASE 1: Frontend Estático (Visual)

Nesta fase, criaremos apenas a parte visual. Não usaremos Node.js, banco de dados ou arquivos JavaScript customizados. Os dados (veículos) estarão "chumbados" (hardcoded) no HTML apenas para você ver como a tela vai ficar.

Para visualizar, basta abrir os arquivos `.html` diretamente no seu navegador ou usar a extensão "Live Server" do VS Code.

### 📂 Estrutura de Pastas da Fase 1
```text
Locadora/
└── frontend/
    ├── css/
    │   └── style.css
    └── views/
        ├── index.html        (Vitrine com dados estáticos)
        ├── login.html        (Formulário visual)
        └── dashboard.html    (Painel com tabela estática)
```

Abra o terminal e crie as pastas:
```bash
# PULAR ESTE PASSO (PROFESSOR DISPONIBILIZOU PRONTO)______

# Cria as pastas (o -p garante que crie a pasta 'frontend' e as subpastas juntas)
mkdir -p frontend/css frontend/views

# Cria os arquivos vazios
touch frontend/css/style.css frontend/views/index.html frontend/views/login.html frontend/views/dashboard.html
```
<!-- FIM DO PULAR PASSO________ -->

### 1.1 O Estilo CSS Global
Crie o arquivo `Locadora/frontend/css/style.css`. Ele será usado por todas as telas.

```css


/* 1ª Digitação (Pasta Códigos) */


```

### 1.2 Tela Principal (Vitrine Estática)
Crie o arquivo `Locadora/frontend/views/index.html`. Note que adicionei dois cards estáticos para representação visual. O modal abrirá usando recursos nativos do Bootstrap (sem nosso JS).

```html


<!-- 2ª Digitação (Pasta Códigos) -->



```

### 1.3 Tela de Login (Apenas Visual)
Crie o arquivo `Locadora/frontend/views/login.html`. O formulário não envia dados para lugar nenhum por enquanto.

# PULAR ESTE PASSO (PROFESSOR DISPONIBILIZOU PRONTO)______

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <!-- Configurações básicas -->
    <meta charset="UTF-8"> <!-- Suporte a acentuação -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0"> <!-- Responsividade -->
    <title>Login — Área Restrita</title>

    <!-- Bootstrap (estilização e layout) -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">

    <!-- Biblioteca de ícones -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">

    <!-- CSS personalizado -->
    <link href="../css/style.css" rel="stylesheet">

    <!-- Ícone da aba -->
    <link rel="icon" type="image/png" href="https://cdn-icons-png.flaticon.com/512/3202/3202926.png">
</head>
<body>

    <!-- Container central do login -->
    <div class="container login-container">

        <!-- Link para voltar à página inicial -->
        <div class="mb-3 text-center">
            <a href="index.html" class="text-decoration-none text-muted">
                <i class="fas fa-arrow-left"></i> Voltar para a página inicial
            </a>
        </div>

        <!-- Card principal do login -->
        <div class="card shadow-sm border-0">

            <!-- Cabeçalho -->
            <div class="card-header card-header-blue fs-5 text-center py-3">
                <i class="fas fa-user-lock me-2"></i> Acesso Restrito
            </div>

            <!-- Corpo -->
            <div class="card-body p-4">

                <!-- Formulário de login -->
                <!-- onsubmit evita o envio real e simula comportamento -->
                <form id="loginForm" onsubmit="event.preventDefault(); alert('Na Fase 2 isso fará o login no Backend!');">
                    
                    <!-- Campo usuário -->
                    <div class="mb-3">
                        <label class="form-label text-muted">
                            <i class="far fa-user me-1"></i> Usuário
                        </label>
                        <input 
                            type="text" 
                            class="form-control" 
                            id="username" 
                            placeholder="Digite seu usuário" 
                            required
                        >
                    </div>

                    <!-- Campo senha -->
                    <div class="mb-4">
                        <label class="form-label text-muted">
                            <i class="fas fa-key me-1"></i> Senha
                        </label>
                        <input 
                            type="password" 
                            class="form-control" 
                            id="password" 
                            placeholder="Digite sua senha" 
                            required
                        >
                    </div>

                    <!-- Área de erro -->
                    <!-- d-none = escondido inicialmente -->
                    <!-- Será exibido via JavaScript (ex: auth.js) -->
                    <div id="erroLogin" class="alert alert-danger py-2 d-none"></div>

                    <!-- Botão de envio -->
                    <button type="submit" class="btn btn-primary w-100 py-2 fw-bold">
                        Entrar no Painel 
                        <i class="fas fa-sign-in-alt ms-1"></i>
                    </button>
                </form>

                <!-- Caixa informativa -->
                <div class="info-box border border-primary border-opacity-25 mt-4">
                    <h6 class="text-primary mb-2">
                        <i class="fas fa-info-circle"></i> Acesso ao Sistema
                    </h6>
                    <p class="mb-1 small">
                        Apenas demonstração visual nesta etapa.
                    </p>
                </div>

            </div>
        </div>
    </div>

</body>
</html>
```

<!-- FIM DO PULAR PASSO________ -->

### 1.4 Tela de Dashboard (Painel Estático)
Crie `Locadora/frontend/views/dashboard.html`. Simulamos a visão de um administrador, com a tabela preenchida com um dado falso para visualização.

```html


<!-- 3ª Digitação (Pasta Códigos) -->



```

<!-- FIM (FRONTEND) -->
