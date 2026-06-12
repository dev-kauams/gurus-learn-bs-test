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
  window.location.href = '/frontend/views/login.html';
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

// ── Iniciar ───────────────────────────────────────────────────
init();