// Verifica em qual formulário o usuário está no momento e controla as ações nele.
const loginForm = document.querySelector(".form-login");
const registerForm = document.querySelector(".form-register");

// Cria usuários de teste, que são carregados até o momento que um usuário real é cadastrado.
const defaultUsers = [ 
    {
    id: 1,
    fullname: "test.user",
    password: "user.password",
    email: "test.user@gmail.com",
    dateofbirth: "22/03/2009",
    cellphone: "11972762077",
    nivel: 1 // Usuário

    },
    {
    id: 2,
    fullname: "test.admin",
    password: "admin.password",
    email: "test.admin@gmail.com",
    dateofbirth: "20/04/1889",
    cellphone: "11123456789",
    nivel: 2 // Admin   

    }
];

// Se ele não tiver o array users criado, ele utiliza o defaultUsers.
if (!localStorage.getItem("users")) {
    localStorage.setItem("users", JSON.stringify(defaultUsers));
}

// Tenta pegar um usuário que foi criado na sessão. Se não houver nenhum, ele pega o do array padrão mesmo. 
const users = JSON.parse(localStorage.getItem("users")) || defaultUsers;

// Função de autenticação de usuário, utilizando usuário e senha.
function authenticUser(email, password){
return users.find(u => u.email === email && u.password === password);
}

// Função que verifica se o email já está registrado.
function emailExists(email){
    return users.find(u => u.email === email);
}

// Função para criar ID's para cada usuário cadastrado.
function generateId(users) {
    if (users.length === 0) 
        return 1; 
        const lastItem = users[users.length - 1]; 
        return lastItem.id + 1; 
}


// Dentro do formulário de login, ao clicar submit, tais funções acontecem.
loginForm.addEventListener('submit', function(e){
    e.preventDefault();

    // Pega os valores inseridos nos input's.
    let email = loginForm.querySelector('#email').value;
    let password = loginForm.querySelector('#password').value;

    // E cria a constante de logado, utilizando uma função de autenticação com email e senha.
    const logged = authenticUser(email, password);

    // Se a constante retorna true, ele efetua o login.
    if(logged){
        console.log(`Login efetuado pelo usuário: ${logged.fullname}, com email: ${logged.email}. O nível da conta é: ${logged.nivel}`);

        // Salva o usuário logado no localStorage.
        localStorage.setItem("loggedUser", JSON.stringify(logged));

        // E verifica qual o nível de permissão do usuário.
        if(logged.nivel === 2){
            window.location.href = "dashboard.html";
        } else {
            window.location.href = "index.html";
        }
    } else {

        // Caso nenhuma das alternativas aconteçam, o login é inválido. 
        alert(`O usuário não foi encontrado. Confira a senha ou usuário enviado.`)
    }
        // Limpa os input's para responsividade da página.
    loginForm.querySelector('#email').value = "";
    loginForm.querySelector('#password').value = "";
});

    // Dentro do formulário de registro, ao clicar submit, tais funções acontecem.
registerForm.addEventListener('submit', function(e){
    e.preventDefault();

    // Captura os valores inseridos nos input's.
    let user = registerForm.querySelector('#username').value;
    let password = registerForm.querySelector('#password').value;
    let email = registerForm.querySelector('#email').value;
    let dob = registerForm.querySelector('#dataNasc').value;
    let cellphone = registerForm.querySelector('#phone').value;
    let passConfirm = registerForm.querySelector('#passwordConfirm').value;
    const newID = generateId(users);
    // Efetua uma função que verifica se o email inserido já é cadastrado.
    const registered = emailExists(email)

    // Se a constante retorna true (Esse email já é cadastrado)...
    if (registered){

        // Alerta o usuário que já existe uma conta com esse email. E reinicia o registro.
        alert(`Um usuário já existe com essas credenciais (email). Por favor, forneça outra credencial.`);
        registerForm.querySelector('#email').value = "";

    } else if (password !== passConfirm) {  // Se a senha não estiver igual a de confirmação...

        // Alerta o usuário quanto ao erro e limpa os input's específicos.
        alert(`Verifique se a confirmação da senha está exatamente igual a senha.`)
        registerForm.querySelector('#passwordConfirm').value = "";
        registerForm.querySelector('#password').value = "";

    } else { // Se nada deu errado, ele segue e cria o registro.
        alert(`Cadastro sucedido.`)
        users.push({
            id: newID,
            fullname: user,
            password: password,
            email: email,
            dateofbirth: dob,
            cellphone: cellphone,
            nivel: 1
        });
        console.log(users);

        // E logo depois, cria um item no localStorage, onde se salva os novos registros.
        localStorage.setItem("users", JSON.stringify(users));
        registerForm.querySelector('#username').value = ""; 
        registerForm.querySelector('#password').value = ""; 
        registerForm.querySelector('#email').value = ""; 
        registerForm.querySelector('#dataNasc').value = ""; 
        registerForm.querySelector('#password').value = ""; 
        registerForm.querySelector('#passwordConfirm').value = "";
        registerForm.querySelector('#phone').value = "";
    }
})


