const registerLink = document.getElementById('register_link');

const cardLogin = document.querySelector('.card-login');

registerLink.addEventListener('click', () => {
    cardLogin.classList.toggle('show-register');
    
    if (registerLink.textContent === 'Não possui conta? Registre-se agora!') {
        registerLink.textContent = 'Possui conta? Logue agora!';
    } else {
        registerLink.textContent = 'Não possui conta? Registre-se agora!';
    }
});
