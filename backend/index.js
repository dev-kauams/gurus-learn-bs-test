// Pega o array de classes no localStorage compartilhado do dashboard.
const classes = JSON.parse(localStorage.getItem("classes")) || [];

// Pega o usuário logado salvo no localStorage.
const loggedUser = localStorage.getItem("loggedUser");

// Transforma novamente em objeto. Se não tiver usuário logado, ele retorna null.
const user = loggedUser ? JSON.parse(loggedUser) : null;

const container = document.querySelector("#classesContainer");

function renderClasses(){
    container.innerHTML = "";

    classes.forEach(classe => {
        const card = document.createElement("div");

        card.innerHTML = `
            <h3>${classe.title}</h3>
            <p><strong>Matéria:</strong> ${classe.lecture}</p>
            <p><strong>Professor:</strong> ${classe.instructor}</p>
        `;

        container.appendChild(card);
    });
}

renderClasses();