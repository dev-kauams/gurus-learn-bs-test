// Pega o array de classes no localStorage compartilhado do dashboard.
const classes = JSON.parse(localStorage.getItem("classes")) || [];

// Pega o usuário logado salvo no localStorage.
const loggedUser = localStorage.getItem("loggedUser");

// Transforma novamente em objeto. Se não tiver usuário logado, ele retorna null.
const user = loggedUser ? JSON.parse(loggedUser) : null;

const usernameShow = document.querySelector("#username-info");

const container = document.querySelector(".card-gruop");

function renderClasses(){
    container.innerHTML = "";

    classes.forEach(classe => {
        const card = document.createElement("div");
        card.className = "card";

        card.innerHTML = `
                <div class="info-classroom">
                <img src="../assets/img/restart.svg" alt="Icon Turma" />
                <h2>${classe.title}</h2>
                </div>
                <div class="more-info-classroom">
                <p>Professor ${classe.instructor}</p>
                <p>Matéria: ${classe.lecture}</p>
                <img src="../assets/img/profile-pic-card.jpg" alt="">
                <button class="card-class-button">Ver Calendário</button>
                </div>
                <div class="more-info-input">
                <label>
                    <input type="checkbox" />
                    <img src="../assets/img/arrow-card.svg" />
                </label>
                </div>
        `;

        container.appendChild(card);
    });
}

usernameShow.innerHTML = `${user.fullname}`;
renderClasses();


