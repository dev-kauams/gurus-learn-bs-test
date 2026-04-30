const registerLink = document.getElementById('register_link');

const cardLogin = document.querySelector('.card-login');

registerLink.addEventListener('click', () => {
    cardLogin.classList.toggle('show-register');
});
