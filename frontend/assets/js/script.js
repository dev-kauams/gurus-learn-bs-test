const registerLink = document.getElementById('register_link');
const loginLink = document.getElementById('login_link');
const cardLogin = document.querySelector('.card-login');

registerLink.addEventListener('click', () => {
    cardLogin.classList.add('show-register');
});

loginLink.addEventListener('click', () => {
    cardLogin.classList.remove('show-register');
});