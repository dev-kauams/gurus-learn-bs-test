const loginForm = document.querySelector(".form-login");
const registerForm = document.querySelector(".form-register");


loginForm.addEventListener('submit', function(e){
    e.preventDefault();

    let user = loginForm.querySelector('#username').value;
    let password = loginForm.querySelector('#password').value;

    const logged = authenticUser(user, password);

    if(logged){
        console.log(`Login efetuado pelo usuário: ${logged.fullname}. O nível da conta é: ${logged.nivel}`)
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
    let dob = registerForm.querySelector('#dataNasc').value;
    let cellphone = registerForm.querySelector('#phone').value;
    let passConfirm = registerForm.querySelector('#passwordConfirm').value;
    
    const registered = emailExists(email)

    if (registered){
        console.log(`Um usuário já existe com essas credenciais (email). Por favor, forneça outra credencial.`);
        registerForm.querySelector('#email').value = "";
    } else if (password !== passConfirm) {
        console.log(`Verifique se a confirmação da senha está exatamente igual a senha.`)
        registerForm.querySelector('#passwordConfirm').value = "";
        registerForm.querySelector('#password').value = "";
    } else {
        console.log(`Cadastro sucedido.`)
        users.push({
            fullname: user,
            password: password,
            email: email,
            dateofbirth: dob,
            cellphone: cellphone,
            nivel: 1
        });
        console.log(users);
        registerForm.querySelector('#username').value = ""; 
        registerForm.querySelector('#password').value = ""; 
        registerForm.querySelector('#email').value = ""; 
        registerForm.querySelector('#dataNasc').value = ""; 
        registerForm.querySelector('#password').value = ""; 
        registerForm.querySelector('#passwordConfirm').value = "";
        registerForm.querySelector('#phone').value = "";
    }
})

const users = [
    {

    fullname: "test.user",
    password: "user.password",
    email: "test.user@gmail.com",
    dateofbirth: "22/03/2009",
    cellphone: "11972762077",
    nivel: 1 // Usuário

    },
    {

    fullname: "test.admin",
    password: "admin.password",
    email: "test.admin@gmail.com",
    dateofbirth: "20/04/1889",
    cellphone: "11123456789",
    nivel: 2 // Admin   

    }
];


function authenticUser(user, password){
return users.find(u => u.fullname === user && u.password === password);
}

function emailExists(email){
    return users.find(u => u.email === email);
}

