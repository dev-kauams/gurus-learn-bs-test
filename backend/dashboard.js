// Pega o JSON salvo no localStorage criado lá na página de login.
const loggedUser = localStorage.getItem("loggedUser");

// Transforma novamente em objeto. Se não tiver usuário logado, ele retorna null.
const user = loggedUser ? JSON.parse(loggedUser) : null;

// Identifica os ID's dos Formulários para novas aulas e edição das mesmas.
const tbody = document.querySelector("#classesBody");
const formAdd = document.querySelector("#addForm");
const formEdit = document.querySelector("#editForm")
const addModal = document.querySelector('#addModal');
const editModal = document.querySelector('#editModal');
const openBtn = document.querySelector('#btnOpen');
const closeBtn = document.querySelector('#btnClose');
const closeBtnEdit = document.querySelector('#btnCloseEdit');

// Variável global utilizada para identificar o alvo da edição da classe.
let currentEditId = null;

// Aulas padrão, feitas para teste e exemplificar.
let defaultClasses = [
    {
        id: 1,
        title: "Basics of Physics",
        lecture: "Physics",
        instructor: "Teacher Rouland"
    },
    {
        id: 2,
        title: "Perfoming Arts",
        lecture: "Art",
        instructor: "Teacher Robert"
    }
];

/*Se no localStorage não existir o array classes (classes adicionadas pelo usuário),
ele cria o item classes no storage e lê o defaultClasses */
if (!localStorage.getItem("classes")) {
    localStorage.setItem("classes", JSON.stringify(defaultClasses));
}

/* Cria o array de classes, pegando o item de classes no localStorage, necessário pra comunicação
entre as páginas, caso ele retorne um item vazio, ele cria um array vazio, pronto para ser populado */
let classes = JSON.parse(localStorage.getItem("classes")) || [];

// Função que atualiza e cria as linhas na tabela de aula. 
function updateTable(){

    // Limpa a tabela sempre que a função é chamada pra evitar duplicação.
    tbody.innerHTML = "";

    // Para cada classe, dentro do array de classes, ela faz certas ações.
    classes.forEach(classe => { 

    // Cria os elementos da tabela e botões de interação.
    const row = document.createElement("tr");
    const edit = document.createElement("button");
    const remove = document.createElement("button");
    const actions = document.createElement("td");

    // E insere na estrutura do HTML, as informações adquiridas do form.
    row.innerHTML = `
    <td>${classe.id}</td>
    <td>${classe.title}</td>
    <td>${classe.lecture}</td>
    <td>${classe.instructor}</td>`;

    edit.innerHTML = `edit`;
    remove.innerHTML = `remove`;
    
    // Conecta os elementos filhos aos seus respectivos pais.
    tbody.appendChild(row);
    actions.appendChild(edit);
    actions.appendChild(remove);
    row.appendChild(actions);

    // Escuta e espera a ação de clique no botão de remover.
    remove.addEventListener('click', () => {
        // Ao clicar, ele filtra no array de classes, até achar o id do item que seja igual ao id da classe.
    classes = classes.filter(item => item.id !== classe.id);

    // Salva o novo estado no localStorage, e no array.
    saveToLocalStorage();

    // Limpa a tabela visualmente.
    updateTable();
    })

    // Escuta e espera a ação de clique no botão de editar.
    edit.addEventListener('click', () => {

        // Seta a variável global para o ID específico da classe/aula que estamos editando.
        currentEditId = classe.id;

        // Responsividade, coloca nos campos do form, os valores atuais da classe para serem editados.
        formEdit.querySelector("#editNam").value = classe.title;
        formEdit.querySelector("#editLecture").value = classe.lecture;
        formEdit.querySelector("#editInstructor").value = classe.instructor;

        // Abre o modal.
        editModal.showModal();
        editModal.style.display = "flex";
    })  
    });
}

// Cria uma nova classe ao ser submitada.
formAdd.addEventListener('submit', (e) => {
    e.preventDefault();

    // Associa os campos dos input's à variáveis que serão usados no futuro.
    let name = formAdd.querySelector("#namClass").value;
    let lecture = formAdd.querySelector("#lecture").value;
    let instructor = formAdd.querySelector("#instructor").value;
    
    // Cria uma ID própria para a classe nova utilizando uma função estabelecida globalmente.
    const newID = generateId(classes);

    // Empurra para o array as informações pegas no form.
    classes.push(
        {
            id: newID,
            title: name,
            lecture: lecture,
            instructor: instructor,
        }
    )
    
    // Novamente, atualiza visualmente a tabela e salva no localStorage o novo estado.
    saveToLocalStorage();
    updateTable();
    

    // Responsividade, limpa o formulário quando a ação termina.
    formAdd.querySelector("#namClass").value = "";
    formAdd.querySelector("#lecture").value = "";
    formAdd.querySelector("#instructor").value = "";
    addModal.close();
    addModal.style.display = "none";
})

// Edita uma classe existente ao ser submitada.
formEdit.addEventListener('submit', (e) => {
    e.preventDefault();

    // Associa as informações do formulário de edição.
    let title = formEdit.querySelector("#editNam").value;
    let lecture = formEdit.querySelector("#editLecture").value;
    let instructor = formEdit.querySelector("#editInstructor").value;

    /* Identifica qual o item alvo à ser editado ao procurar no array de classes qual classe tem o
    mesmo id do id atual.*/
    const item = classes.find(c => c.id === currentEditId);
    
    // Se nenhum item for achado, retorna.
    if(!item) return;

    // Se for achado, ele edita as informações do item, que consequentemente se mudam no array também.
    item.title = title;
    item.lecture = lecture;
    item.instructor = instructor;

    // Atualiza a tabela visualmente e manda para o localStorage.
    saveToLocalStorage();
    updateTable();
    
    // Limpa a variável global de id alvo para não causar erro no fluxo de edição.
    currentEditId = null;
    editModal.close();
})

// Função responsável por salvar as novas informações do array de classes, no item classes.
function saveToLocalStorage(){
    localStorage.setItem("classes", JSON.stringify(classes));
}

// Função que recebe qualquer array, e cria uma ID único para cada item deste array.
function generateId(arr){
    if (arr.length === 0) return 1;

    const maxId = Math.max(...arr.map(item => item.id));
    return maxId + 1;
}

// Escuta a ação de clique e abre o modal.
openBtn.addEventListener('click', () =>{
    addModal.showModal();
    addModal.style.display = "flex";
})

// Escuta a ação de clique e fecha o modal.
closeBtn.addEventListener('click', () =>{
    addModal.close();
    addModal.style.display = "none";
})

// Escuta a ação de clique e fecha o modal.
closeBtnEdit.addEventListener('click', () => {
    editModal.close();
    editModal.style.display = "none";

    // Também limpa o id alvo, visto que o usuário pode cancelar a ação de editar.
    currentEditId = null;
});

/* Verificação de segurança, caso um usuário abra diretamente a página de dashboard sem ter logado
ou ter um nível menor que de ADM (2), ele retorna o usuário para a página de login.*/
if (!user || user.nivel !== 2) {
    window.location.href = "login.html";
}

// Comando para testar qual usuário está logado.
console.log(user);

// Chama a função para limpar a tabela.
updateTable();