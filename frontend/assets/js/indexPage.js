// ============================================================
// portal (index.html) — JavaScript dinâmico
// ============================================================

// ── Navegação entre seções ────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const links    = document.querySelectorAll('nav a.icon:not(#btnLogout)');
  const sections = document.querySelectorAll('main section.content-section');

  links.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const id = link.getAttribute('href').replace('#','');
      sections.forEach(s => s.classList.add('disable-section'));
      const target = document.getElementById(id);
      if (target) target.classList.remove('disable-section');
    });
  });
});

// ── Toast ─────────────────────────────────────────────────────
function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent  = msg;
  el.style.display = 'block';
  setTimeout(() => { el.style.display = 'none'; }, 3000);
}

// ── Verificar sessão ──────────────────────────────────────────
let usuarioLogado = null;

async function init() {
  try {
    const resp = await fetch('/api/sessao', { credentials: 'include' });
    if (!resp.ok) { window.location.href = '/frontend/views/login.html'; return; }
    const data = await resp.json();
    if (!data.user) { window.location.href = '/frontend/views/login.html'; return; }
    // Gestão vai pro dashboard
    if (data.user.id_nivel === 3) { window.location.href = '/frontend/views/dashboard.html'; return; }
    usuarioLogado = data.user;
    document.getElementById('username-info').textContent = data.user.nome;
    carregarTurmas();
    carregarAulas();
    carregarAtividades();
    iniciarCalendario();
    carregarTarefas();
  } catch { window.location.href = '/frontend/views/login.html'; }
}

// ── Logout ────────────────────────────────────────────────────
document.getElementById('btnLogout').addEventListener('click', async (e) => {
  e.preventDefault();
  await fetch('/api/logout', { method: 'POST', credentials: 'include' });
  window.location.href = '/login';
});

// ── TURMAS ────────────────────────────────────────────────────
async function carregarTurmas() {
  try {
    const resp   = await fetch('/api/turmas', { credentials: 'include' });
    const turmas = await resp.json();
    const grid   = document.getElementById('gridTurmas');

    if (!turmas.length) {
      grid.innerHTML = '<p style="color:#888;">Você não está matriculado em nenhuma turma.</p>';
      return;
    }

    grid.innerHTML = turmas.map(t => `
      <div class="card card-class">
        <h3>${t.nome_turma}</h3>
        <p>${t.descricao || 'Sem descrição'}</p>
        <p> ${t.nome_professor || 'A definir'}</p>

        <button class="card-class-button">Ver mais informações</button>
      </div>`
    ).join('');
  } catch { toast('Erro ao carregar turmas.'); }

  const allCardClass = document.querySelectorAll('.card-class');
  allCardClass.forEach(card => {
    card.addEventListener('click', () => {
        if (event.target.tagName === 'BUTTON') {
            return; 
        }
      card.classList.toggle('expanded');
    });
  });
}

// ── Modal ingresso ────────────────────────────────────────────
document.getElementById('btnIngresso').addEventListener('click', async () => {
  try {
    const resp   = await fetch('/api/turmas', { credentials: 'include' });
    const turmas = await resp.json();
    const select = document.getElementById('selectTurmaIngresso');
    select.innerHTML = '<option value="">Selecione...</option>' +
      turmas.map(t => `<option value="${t.id_turma}">${t.nome_turma}</option>`).join('');
    document.getElementById('modalIngresso').classList.add('open');
  } catch { toast('Erro ao carregar turmas.'); }
});

function fecharModalIngresso() {
  document.getElementById('modalIngresso').classList.remove('open');
}

document.getElementById('btnConfirmarIngresso').addEventListener('click', async () => {
  const id = document.getElementById('selectTurmaIngresso').value;
  if (!id) { toast('Selecione uma turma.'); return; }
  try {
    const resp = await fetch(`/api/turmas/${id}/matricular`, {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' }, body: '{}'
    });
    const data = await resp.json();
    toast(data.mensagem || data.erro);
    fecharModalIngresso();
    carregarTurmas();
  } catch { toast('Erro ao ingressar.'); }
});

// ── AULAS ─────────────────────────────────────────────────────
async function carregarAulas() {
  try {
    const resp  = await fetch('/api/aulas', { credentials: 'include' });
    const lessons = await resp.json();
    const lista = document.getElementById('listaAulas');

    if (!lessons.length) {
      lista.innerHTML = '<p style="color:#888;">Nenhuma aula disponível.</p>';
      return;
    }

    lista.innerHTML = lessons.map(a => {
      const data = new Date(a.data_aula).toLocaleString('pt-BR');
      return `
        <div class="card aula-card">
          <h3>${a.titulo}</h3>
          <div class="meta">
            <span>${data}</span>
            <span>${a.nome_turma || '—'}</span>
          </div>
          <p class="conteudo">${a.conteudo}</p>
          <div class="buttons">
              <button>Ingressar</button>
              <button>Adicionar ao calendário</button>
          </div>    
        </div>
        `;
    }).join('');
  } catch { toast('Erro ao carregar aulas.'); }
}

// ── ATIVIDADES ────────────────────────────────────────────────
async function carregarAtividades() {
  try {
    const resp       = await fetch('/api/atividades', { credentials: 'include' });
    const atividades = await resp.json();
    const lista      = document.getElementById('listaAtividades');

    if (!atividades.length) {
      lista.innerHTML = '<p style="color:#888;">Nenhuma atividade disponível.</p>';
      return;
    }

    lista.innerHTML = atividades.map(at => {
      const prazo = new Date(at.prazo).toLocaleDateString('pt-BR');
      const vencida = new Date(at.prazo) < new Date();
      return `
        <div class="atividade-card" style="border: 1px solid ${vencida ? '#E53935' : 'var(--bg-block)'}">
          <h3>${at.titulo}</h3>
          <div class="meta">
            <div class="meta-info">
              <span>Prazo: ${prazo}</span>
              <span>${at.nome_materia || '—'}</span>
              <span>${at.nome_turma || '—'}</span>
            </div>
            <button>Entregar</button>
          </div>
          ${at.descricao ? `<p class="conteudo">${at.descricao}</p>` : ''}
          ${vencida ? '<span style="font-size:.75rem;color:#E53935;font-weight:700;">PRAZO ENCERRADO</span>' : ''}
        </div>`;
    }).join('');
  } catch { toast('Erro ao carregar atividades.'); }
}

// ── TAREFAS NA SIDEBAR DO CALENDÁRIO ─────────────────────────
async function carregarTarefas() {
  try {
    const resp       = await fetch('/api/atividades', { credentials: 'include' });
    const atividades = await resp.json();
    const lista      = document.getElementById('listaTarefas');

    if (!atividades.length) { lista.innerHTML = '<li style="opacity:.6;">Nenhuma tarefa.</li>'; return; }

    lista.innerHTML = atividades.slice(0, 6).map(at => {
      const prazo = new Date(at.prazo).toLocaleDateString('pt-BR');
      return `<li>${at.titulo} | ${prazo}</li>`;
    }).join('');
  } catch { /* silencioso */ }
}

// ── CALENDÁRIO DINÂMICO ───────────────────────────────────────
let calMes, calAno;

function iniciarCalendario() {
  const hoje = new Date();
  calMes = hoje.getMonth();
  calAno = hoje.getFullYear();
  renderizarCalendario();
}

function renderizarCalendario() {
  const meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                 'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  document.getElementById('labelMes').textContent = `${meses[calMes]} ${calAno}`;

  const corpo = document.getElementById('corpoCalendario');
  const hoje  = new Date();
  const primeiro = new Date(calAno, calMes, 1).getDay();
  const diasNoMes = new Date(calAno, calMes + 1, 0).getDate();

  let html = '<tr>';
  let dia  = 1;
  let semana = 0;

  // Células vazias antes do dia 1
  for (let i = 0; i < primeiro; i++) html += '<td class="prev-month"></td>';
  let col = primeiro;

  while (dia <= diasNoMes) {
    const isHoje = dia === hoje.getDate() && calMes === hoje.getMonth() && calAno === hoje.getFullYear();
    html += `<td class="${isHoje ? 'today' : ''}">${dia}</td>`;
    col++;
    if (col === 7 && dia < diasNoMes) { html += '</tr><tr>'; col = 0; }
    dia++;
  }
  while (col < 7 && col > 0) { html += '<td class="prev-month"></td>'; col++; }
  html += '</tr>';

  corpo.innerHTML = html;
}

document.getElementById('btnPrevMes').addEventListener('click', () => {
  calMes--; if (calMes < 0) { calMes = 11; calAno--; }
  renderizarCalendario();
});
document.getElementById('btnProxMes').addEventListener('click', () => {
  calMes++; if (calMes > 11) { calMes = 0; calAno++; }
  renderizarCalendario();
});

// ── CHAT ─────────────────────────────────────────────────────
document.getElementById('btnEnviarMsg').addEventListener('click', enviarMensagem);
document.getElementById('chatInput').addEventListener('keypress', e => {
  if (e.key === 'Enter') enviarMensagem();
});

function enviarMensagem() {
  const input = document.getElementById('chatInput');
  const texto = input.value.trim();
  if (!texto) return;

  const content = document.getElementById('chatContent');
  const div = document.createElement('div');
  div.className = 'message outgoing';
  div.innerHTML = `
    <div class="bubble-group">
      <div class="bubble">${texto}</div>
    </div>
    <img src="/assets/img/profile-pic-card.jpg" alt="Avatar" class="avatar">`;
  content.appendChild(div);
  content.scrollTop = content.scrollHeight;
  input.value = '';
}

async function carregarMeusGurupos() {
  try {
    const resp = await fetch('/api/gurupos');
    const gurupos = await resp.json();
    const container = document.getElementById('listaDeGurupos');
    if (!container) return;
    container.innerHTML = '';

    if (!gurupos || gurupos.length === 0) {
      container.innerHTML = '<p class="text-muted small text-center p-3">Você não faz parte de nenhum Gurupo.</p>';
      return;
    }

    gurupos.forEach(g => {
      container.innerHTML += `
        <button class="btn btn-sm btn-light text-start p-2 border-bottom d-flex justify-content-between align-items-center" 
                onclick="selecionarGurupo(${g.id_gurupo}, '${g.nome}', '${g.codigo_acesso}')"
                style="width: 100%; text-align: left; margin-bottom: 2px; border: 1px solid #eee; border-radius:4px;">
          <div>
            <span style="display:block; font-weight:600; font-size:13px;"># ${g.nome}</span>
            <small style="font-size:10px; color:#999;">Cód: ${g.codigo_acesso}</small>
          </div>
          <i class="bi bi-chevron-right small text-muted"></i>
        </button>
      `;
    });
  } catch (err) {
    console.error('Erro ao buscar Gurupos:', err);
  }
}

function selecionarGurupo(id, nome, codigo) {
  idGurupoSelecionado = id;
  document.getElementById('nomeGurupoAtivo').innerText = `# ${nome} (Código: ${codigo})`;
  
  const inputChat = document.getElementById('chatInput');
  const btnEnviar = document.getElementById('btnEnviarMsg');
  
  inputChat.disabled = false;
  inputChat.placeholder = `Conversar em # ${nome}...`;
  btnEnviar.disabled = false;

  const chatContent = document.getElementById('chatContent');
  chatContent.innerHTML = `
    <div class="text-center text-muted small my-3">🔮 Você entrou no canal de conversa histórico de ${nome}</div>
    <div class="message incoming">
      <img src="/assets/img/profile-pic-card.jpg" alt="Avatar" class="avatar">
      <div class="bubble-group">
        <span class="username">Sistema Gurus</span>
        <div class="bubble">Bem-vindo ao canal privado! Use o código <strong>${codigo}</strong> para convidar seus amigos da turma.</div>
      </div>
    </div>
  `;
}

async function criarNovoGurupo() {
  const nomeInput = document.getElementById('inputNomeGurupo');
  const nome = nomeInput.value.trim();
  if (!nome) return alert('Por favor, defina um nome para o Gurupo.');

  try {
    const resp = await fetch('/api/gurupos/criar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome })
    });
    const data = await resp.json();
    
    if (resp.status === 201 || data.codigo) {
      alert(`🎉 Gurupo "${nome}" criado! Compartilhe o token de acesso: ${data.codigo}`);
      nomeInput.value = '';
      carregarMeusGurupos();
    } else {
      alert(data.erro || 'Não foi possível criar o Gurupo.');
    }
  } catch { alert('Erro de conexão ao tentar criar grupo.'); }
}

async function entrarEmGurupo() {
  const codigoInput = document.getElementById('inputCodigoGurupo');
  const codigo = codigoInput.value.trim().toUpperCase();
  if (!codigo) return alert('Por favor, digite o código de 5 caracteres.');

  try {
    const resp = await fetch('/api/gurupos/entrar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codigo })
    });
    const data = await resp.json();
    
    if (resp.ok) {
      alert(data.mensagem || 'Você ingressou com sucesso!');
      codigoInput.value = '';
      carregarMeusGurupos();
    } else {
      alert(data.erro || 'Código de acesso inválido ou expirado.');
    }
  } catch { alert('Erro de conexão com o servidor.'); }
}

// ── Iniciar ───────────────────────────────────────────────────
init();