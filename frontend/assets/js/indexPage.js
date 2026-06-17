// ============================================================
// portal (index.html) — JavaScript dinâmico COESIVO
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
  if (el) {
    el.textContent  = msg;
    el.style.display = 'block';
    setTimeout(() => { el.style.display = 'none'; }, 3000);
  } else {
    alert(msg);
  }
}

// -- Recursos específicos do professor -- 
function inicializarRecursosProfessor() {
  if (usuarioLogado.id_nivel === 2) {
    // Botão de Criar Aula
    const containerAulas = document.querySelector('#aulas');
    if (containerAulas && !document.getElementById('btnCriarAulaTrigger')) {
      const btnAula = `<button id="btnCriarAulaTrigger" style="margin-bottom:20px; margin-right:10px; padding:10px 18px; background:#532B88; color:#fff; border:none; border-radius:8px; cursor:pointer; font-weight:bold;" onclick="abrirModalCriarAula()">➕ Publicar Nova Aula</button>`;
      containerAulas.insertBefore(document.createRange().createContextualFragment(btnAula), containerAulas.firstChild);
    }

    // Botão de Criar Atividade
    const containerAtividades = document.querySelector('#atividades');
    if (containerAtividades && !document.getElementById('btnCriarAtividadeTrigger')) {
      const btnAtiv = `<button id="btnCriarAtividadeTrigger" style="margin-bottom:20px; padding:10px 18px; background:#2E7D32; color:#fff; border:none; border-radius:8px; cursor:pointer; font-weight:bold;" onclick="abrirModalCriarAtividade()">📝 Criar Nova Atividade</button>`;
      containerAtividades.insertBefore(document.createRange().createContextualFragment(btnAtiv), containerAtividades.firstChild);
    }

    const btnInscricao = document.getElementById('btnIngresso');
    if (btnInscricao) btnInscricao.style.display = 'none'; // Professor não se inscreve em turmas
  }
}

// ── Verificar sessão ──────────────────────────────────────────
let usuarioLogado = null;

async function init() {
  try {
    const resp = await fetch('/api/sessao', { credentials: 'include' });
    if (!resp.ok) { window.location.href = '/frontend/views/login.html'; return; }
    const data = await resp.json();
    if (!data.user) { window.location.href = '/frontend/views/login.html'; return; }
    
    if (data.user.id_nivel === 3) { window.location.href = '/frontend/views/dashboard.html'; return; }
    usuarioLogado = data.user;
    document.getElementById('username-info').textContent = data.user.nome;
    
    inicializarRecursosProfessor();
    carregarTurmas();
    carregarAulas();
    carregarAtividades();
    iniciarCalendario();
    carregarTarefas();
    
    // Regras estritas de exibição baseadas no nível
    const btnIngresso = document.getElementById('btnIngresso');
    if (usuarioLogado.id_nivel === 1) {
      if (btnIngresso) btnIngresso.style.display = 'block'; 
    }
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
        <p>Prof: ${t.nome_professor || 'A definir'}</p>
        <button class="card-class-button">Ver mais informações</button>
      </div>`
    ).join('');
  } catch { toast('Erro ao carregar turmas.'); }

  const allCardClass = document.querySelectorAll('.card-class');
  allCardClass.forEach(card => {
    card.addEventListener('click', (event) => {
        if (event.target.tagName === 'BUTTON') { return; }
        card.classList.toggle('expanded');
    });
  });
}

// ── Modal ingresso  ──────
document.getElementById('btnIngresso').addEventListener('click', async () => {
  try {
    const resp   = await fetch('/api/turmas/disponiveis', { credentials: 'include' });
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
  
  const btn = document.getElementById('btnConfirmarIngresso');
  const txtOriginal = btn.innerText;
  btn.disabled = true;
  btn.innerText = "⌛ Processando...";

  try {
    const resp = await fetch('/api/turmas/ingressar', {
      method: 'POST', 
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ id_turma: id }) 
    });
    
    const data = await resp.json();
    if (resp.ok) {
      alert(data.message || '🎉 Confirmado! Inscrição realizada com sucesso.');
      fecharModalIngresso();
      window.location.reload(); // Recarrega para mostrar novas lições e aulas da classe ingressada
    } else {
      alert(data.erro || 'Erro ao ingressar.');
    }
  } catch { 
    alert('Erro de comunicação.'); 
  } finally {
    btn.disabled = false;
    btn.innerText = txtOriginal;
  }
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
        </div>`;
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
      
      let acaoHtml = '';

      if (usuarioLogado.id_nivel === 1) { 
        if (at.entregue === 1) {
          acaoHtml = '<span style="color:#2E7D32; font-weight:700;">✅ Concluída</span>';
        } else if (vencida) {
          acaoHtml = '<span style="color:#E53935; font-weight:700;">❌ Pendente (Encerrado)</span>';
        } else {
          
          acaoHtml = `<button style="background-color: #2b5788; color: white; padding: 6px 12px; border: none; border-radius: 4px; cursor: pointer;" onclick="marcarComoConcluida(${at.id_atividade}, this)">Marcar como Concluída</button>`;
        }
      } else if (usuarioLogado.id_nivel === 2) {
        acaoHtml = `<button style="background-color:#532B88; color:#fff;" onclick="verRelatorioEntregas(${at.id_atividade}, '${at.titulo}')">Ver Entregas</button>`;
      } else {
        acaoHtml = '<span style="color:#666; font-size:0.85rem;">Modo Visualização</span>';
      }

      return `
        <div class="atividade-card" style="border: 1px solid ${vencida ? '#E53935' : 'var(--bg-block)'}">
          <h3>${at.titulo}</h3>
          <div class="meta">
            <div class="meta-info">
              <span>Prazo: ${prazo}</span>
              <span>Matéria: ${at.nome_materia || '—'}</span>
              <span>Turma: ${at.nome_turma || '—'}</span>
            </div>
            ${acaoHtml}
          </div>
          ${at.descricao ? `<p class="conteudo">${at.descricao}</p>` : ''}
          ${(vencida && usuarioLogado.id_nivel === 1 && at.entregue !== 1) ? '<span style="font-size:.75rem;color:#E53935;font-weight:700;">PRAZO ENCERRADO</span>' : ''}
        </div>`;
    }).join('');
  } catch { toast('Erro ao carregar atividades.'); }
}


async function marcarComoConcluida(id_atividade, botaoElemento) {
  if (!confirm("Deseja marcar esta atividade como concluída?")) return;


  const textoOriginal = botaoElemento.innerText;
  botaoElemento.disabled = true;
  botaoElemento.innerText = "⌛ Salvando...";
  botaoElemento.style.backgroundColor = "#777";

  try {
    const resp = await fetch(`/api/atividades/${id_atividade}/entregar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include' 
    });

    const d = await resp.json();

    if (resp.ok || d.success) {
      alert("✅ CONFIRMAÇÃO: Atividade marcada como concluída com sucesso!");
      carregarAtividades(); // Atualiza a tela na hora
    } else {
      alert(d.erro || "Erro ao computar conclusão.");
      botaoElemento.disabled = false;
      botaoElemento.innerText = textoOriginal;
      botaoElemento.style.backgroundColor = "#2b5788";
    }
  } catch (err) {
    console.error(err);
    alert("Erro de conexão ao salvar.");
    // Destrava o botão em caso de erro de rede/servidor fora do ar
    botaoElemento.disabled = false;
    botaoElemento.innerText = textoOriginal;
    botaoElemento.style.backgroundColor = "#2b5788";
  }
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
  let col = primeiro;

  for (let i = 0; i < primeiro; i++) html += '<td class="prev-month"></td>';

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

document.getElementById('buttonSidebar').addEventListener('click', () => {
  const sidebar = document.querySelector('.gurupos-sidebar');
  sidebar.classList.toggle('open-sidebar');
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
        </button>`;
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
    </div>`;
}

// ── OPERAÇÕES DE AULA DO PROFESSOR ───────────────────────────
async function abrirModalCriarAula() {
  try {
    const resp = await fetch('/api/turmas', { credentials: 'include' });
    const turmas = await resp.json();
    
    const select = document.getElementById('regAulaTurma');
    select.innerHTML = '<option value="">Selecione uma de suas turmas...</option>' + 
      turmas.map(t => `<option value="${t.id_turma}">${t.nome_turma}</option>`).join('');
    
    document.getElementById('modalCriarAula').style.display = 'block';
  } catch {
    toast('Erro ao preparar formulário de criação.');
  }
}

async function salvarNovaAula() {
  const btnSalvar = document.querySelector("#modalCriarAula button[onclick='salvarNovaAula()']");
  const body = {
    id_turma:  document.getElementById('regAulaTurma').value,
    titulo:    document.getElementById('regAulaTitulo').value.trim(),
    conteudo:  document.getElementById('regAulaConteudo').value.trim(),
    data_aula: document.getElementById('regAulaData').value
  };

  if (!body.id_turma || !body.titulo || !body.data_aula) {
    alert('Por favor, preencha todos os campos obrigatórios.');
    return;
  }

  const textoOriginal = btnSalvar.innerText;
  btnSalvar.disabled = true;
  btnSalvar.innerText = "⌛ Publicando aula...";

  try {
    const resp = await fetch('/api/aulas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await resp.json();
    
    if (resp.ok) {
      alert('✅ CONFIRMAÇÃO: Aula publicada com sucesso!');
      document.getElementById('modalCriarAula').style.display = 'none';
      document.getElementById('regAulaTitulo').value = "";
      document.getElementById('regAulaConteudo').value = "";
      document.getElementById('regAulaData').value = "";
      carregarAulas();
    } else {
      alert(data.erro || 'Erro ao publicar aula.');
    }
  } catch {
    alert('Erro de comunicação.');
  } finally {
    btnSalvar.disabled = false;
    btnSalvar.innerText = textoOriginal;
  }
}

// ── OPERAÇÕES DE ATIVIDADE DO PROFESSOR ─────────────────
async function abrirModalCriarAtividade() {
  try {
    const resp = await fetch('/api/turmas', { credentials: 'include' });
    const turmas = await resp.json();
    
    const select = document.getElementById('regAtivTurma');
    select.innerHTML = '<option value="">Selecione uma turma...</option>' + 
      turmas.map(t => `<option value="${t.id_turma}">${t.nome_turma}</option>`).join('');
    
    document.getElementById('modalCriarAtividade').style.display = 'block';
  } catch {
    toast('Erro ao preparar formulário.');
  }
}

async function salvarNovaAtividade() {
  const btnSalvar = document.querySelector("#modalCriarAtividade button[onclick='salvarNovaAtividade()']");
  const body = {
    id_turma:   document.getElementById('regAtivTurma').value,
    titulo:     document.getElementById('regAtivTitulo').value.trim(),
    descricao:  document.getElementById('regAtivDesc').value.trim(),
    prazo:      document.getElementById('regAtivPrazo').value,
    id_materia: 1 
  };

  if (!body.id_turma || !body.titulo || !body.prazo) {
    alert('Por favor, preencha todos os campos obrigatórios.');
    return;
  }

  const textoOriginal = btnSalvar.innerText;
  btnSalvar.disabled = true;
  btnSalvar.innerText = "⌛ Criando Atividade...";

  try {
    const resp = await fetch('/api/atividades', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await resp.json();
    
    if (resp.ok) {
      alert('✅ CONFIRMAÇÃO: Atividade criada e anexada à turma!');
      document.getElementById('modalCriarAtividade').style.display = 'none';
      document.getElementById('regAtivTitulo').value = "";
      document.getElementById('regAtivDesc').value = "";
      document.getElementById('regAtivPrazo').value = "";
      carregarAtividades();
    } else {
      alert(data.erro || 'Erro ao criar atividade.');
    }
  } catch {
    alert('Erro ao se conectar com o servidor.');
  } finally {
    btnSalvar.disabled = false;
    btnSalvar.innerText = textoOriginal;
  }
}

async function verRelatorioEntregas(idAtividade, tituloAtividade) {
  try {
    const resp = await fetch(`/api/atividades/${idAtividade}/entregas`, { credentials: 'include' });
    const entregas = await resp.json();

    document.getElementById('tituloModalRelatorio').innerText = `Entregas de: ${tituloAtividade}`;
    const tabela = document.getElementById('corpoTabelaRelatorio');

    if (!entregas.length) {
      tabela.innerHTML = '<tr><td colspan="3" style="text-align:center; padding:15px; color:#999;">Nenhum aluno vinculado ou com entregas.</td></tr>';
    } else {
      tabela.innerHTML = entregas.map(e => {
        const badgeStatus = e.entregue === 1 
          ? `<span style="color:#2E7D32; font-weight:bold;">🟢 Concluído</span>` 
          : `<span style="color:#E53935; font-weight:bold;">🔴 Pendente</span>`;
        const dataStatus = e.entregue_em ? new Date(e.entregue_em).toLocaleString('pt-BR') : '—';
        
        return `
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px;"><strong>${e.nome_aluno}</strong><br><small style="color:#777;">${e.email_aluno}</small></td>
            <td style="padding: 10px;">${badgeStatus}</td>
            <td style="padding: 10px;">${dataStatus}</td>
          </tr>`;
      }).join('');
    }

    document.getElementById('modalRelatorioEntregas').style.display = 'block';
  } catch {
    toast('Erro ao buscar o relatório consolidado.');
  }
}

// ── Iniciar ───────────────────────────────────────────────────
init();