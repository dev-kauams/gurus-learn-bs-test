const loginForm = document.querySelector(".form-login");
const registerForm = document.querySelector(".form-register");


loginForm.addEventListener('submit', function(e){
    e.preventDefault();

    let user = loginForm.querySelector('#username').value;
    let password = loginForm.querySelector('#password').value;

    const logged = authenticUser(user, password);

    if(logged){
        console.log(`Login efetuado pelo usuário: ${logged.username} e senha: ${logged.password}. O nível da conta é: ${logged.nivel}`)
    } else {
        console.log(`O usuário não foi encontrado. Confira a senha ou usuário enviado.`)
    }

    loginForm.querySelector('#username').value = "";
    loginForm.querySelector('#password').value = "";
});


registerForm.addEventListener('submit', function(e){
    e.preventDefault();

    let user = registerForm.querySelector('#username').value;
    let password = registerForm.querySelector('#password').value;
    let email = registerForm.querySelector('#email').value;
    
    const registered = registerUser(user, email)

    if (registered){
        console.log(`Um usuário já existe com essas credenciais. Por favor, forneça outra credencial.`);
    } else {
        console.log(`Cadastro sucedido.`)
        users.push({
            username: user,
            password: password,
            email: email,
            nivel: 1
            
        });
        console.log(users);
    }
        registerForm.querySelector('#username').value = "";
        registerForm.querySelector('#password').value = "";
        registerForm.querySelector('#email').value = "";
})

const users = [
    {

    username: "test.user",
    password: "user.password",
    email: "test.user@gmail.com",
    nivel: 1 // Usuário

    },
    {

    username: "test.admin",
    password: "admin.password",
    email: "test.admin@gmail.com",
    nivel: 2 // Admin   

    }
];


function authenticUser(user, password){
return users.find(u => u.username === user && u.password === password);
}

function registerUser(user, email){
    return users.find(u => u.username === user || u.email === email);
}

