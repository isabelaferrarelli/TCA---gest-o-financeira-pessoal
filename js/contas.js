const btnAdd = document.querySelector('#btnAdd');
const dlg    = document.getElementById('dlg');
const form   = document.getElementById('form');
const lista  = document.getElementById('lista');
const nome   = document.getElementById('nome');
const tipo   = document.getElementById('tipo');
const saldo  = document.getElementById('saldo');
const btnDel = document.getElementById('del');
const titulo = document.getElementById('dlgTitle');
const saldoTotal = document.getElementById('saldoTotal');

let contas = [];          // lista de contas (vinda do Supabase)
let tipos = [];           // lista de tipo_conta
let editandoId = null;    // id da conta em edição (null = nova)
let usuarioAtual = null;  // usuário logado

// ---------- formatação e digitação de valor ----------
const fmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

// converte "R$ 1.234,56" em 1234.56
function parseMoeda(txt) {
  const n = txt.replace(/[^\d,-]/g, '').replace(',', '.');
  return parseFloat(n) || 0;
}

// formata enquanto digita
saldo.addEventListener('input', () => {
  const digitos = saldo.value.replace(/\D/g, '');
  saldo.value = digitos ? fmt.format(parseInt(digitos, 10) / 100) : '';
});

// ---------- Supabase ----------
async function carregarTipos() {
  const { data, error } = await sb.from('tipo_conta').select('id, nome').order('id');
  if (error) {
    console.error(error);
    alert('Erro ao carregar tipos de conta.');
    return;
  }
  tipos = data;

  // preenche o <select> com value = id do tipo
  tipo.innerHTML = '';
  tipos.forEach(t => {
    const opt = document.createElement('option');
    opt.value = t.id;
    opt.textContent = t.nome;
    tipo.appendChild(opt);
  });
}

// soma dos saldos feita no banco (SUM), pela função saldo_total()
async function carregarSaldoTotal() {
  const { data, error } = await sb.rpc('saldo_total');
  if (error) {
    console.error(error);
    alert('Erro ao calcular o saldo total.');
    return;
  }

  const total = Number(data) || 0;
  saldoTotal.textContent = fmt.format(total);
  saldoTotal.classList.toggle('negativo', total < 0);
}

async function carregarContas() {
  const { data, error } = await sb
    .from('contas_carteira')
    .select('id, nome, saldo, tipo, tipo_conta(nome)')
    .eq('id_usuario', usuarioAtual.id)
    .order('id');

  if (error) {
    console.error(error);
    alert('Erro ao carregar contas.');
    return;
  }

  contas = data.map(c => ({
    id: c.id,
    nome: c.nome,
    saldo: Number(c.saldo),
    tipo: c.tipo,                      // id (smallint)
    tipoNome: c.tipo_conta?.nome || '' // nome para exibir
  }));
  mostra();
  await carregarSaldoTotal();
}

async function inserirConta(dados) {
  const { error } = await sb
    .from('contas_carteira')
    .insert({ ...dados, id_usuario: usuarioAtual.id });
  if (error) throw error;
}

async function atualizarConta(id, dados) {
  const { error } = await sb
    .from('contas_carteira')
    .update(dados)
    .eq('id', id)
    .eq('id_usuario', usuarioAtual.id);
  if (error) throw error;
}

async function excluirConta(id) {
  const { error } = await sb
    .from('contas_carteira')
    .delete()
    .eq('id', id)
    .eq('id_usuario', usuarioAtual.id);
  if (error) throw error;
}

// ---------- mostrar na tela ----------
function mostra() {
  lista.innerHTML = '';

  if (contas.length === 0) {
    lista.innerHTML = '<p class="vazio">Nenhuma conta cadastrada ainda.</p>';
    return;
  }

  contas.forEach(conta => {
    const card = document.createElement('article');
    card.className = 'card-conta';
    card.innerHTML = `
      <h3></h3>
      <p class="tipo"></p>
      <p class="saldo"></p>
      <button class="btn ghost" data-id="${conta.id}">Editar</button>
    `;
    // textContent evita injeção de HTML
    card.querySelector('h3').textContent = conta.nome;
    card.querySelector('.tipo').textContent = conta.tipoNome;
    card.querySelector('.saldo').textContent = fmt.format(conta.saldo);

    card.querySelector('button').addEventListener('click', () => abrirEdicao(conta.id));
    lista.appendChild(card);
  });
}

// ---------- dialog ----------
function abrirNovo() {
  editandoId = null;
  titulo.textContent = 'Nova conta';
  form.reset();
  btnDel.hidden = true;
  dlg.showModal();
}

function abrirEdicao(id) {
  const c = contas.find(x => x.id === id);
  editandoId = id;
  titulo.textContent = 'Editar conta';
  nome.value  = c.nome;
  tipo.value  = c.tipo;
  saldo.value = fmt.format(c.saldo);
  btnDel.hidden = false;
  dlg.showModal();
}

document.getElementById('btnAdd').addEventListener('click', abrirNovo);
document.getElementById('cancel').addEventListener('click', () => dlg.close());

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!usuarioAtual) {
    alert('Sessão não encontrada. Faça login novamente.');
    location.href = 'login.html';
    return;
  }

  if (!nome.value.trim()) {
    nome.focus();
    return;
  }

  const dados = {
    nome:  nome.value.trim(),
    tipo:  parseInt(tipo.value, 10),
    saldo: parseMoeda(saldo.value)
  };

  if (Number.isNaN(dados.tipo)) {
    alert('Tipo de conta inválido. Recarregue a página e tente de novo.');
    return;
  }

  try {
    if (editandoId) {
      await atualizarConta(editandoId, dados);
    } else {
      await inserirConta(dados);
    }
    await carregarContas(); // recarrega a lista e o saldo total
    dlg.close();
  } catch (err) {
    console.error(err);
    alert('Erro ao salvar: ' + err.message);
  }
});

btnDel.addEventListener('click', async () => {
  if (!confirm('Excluir esta conta?')) return;
  try {
    await excluirConta(editandoId);
    await carregarContas(); // recarrega a lista e o saldo total
    dlg.close();
  } catch (err) {
    console.error(err);
    if (err.code === '23503') {
      alert('Esta conta tem transações. Exclua as transações dela primeiro.');
    } else {
      alert('Erro ao excluir: ' + err.message);
    }
  }
});

// ---------- sair ----------
document.getElementById('btnSair')?.addEventListener('click', async (e) => {
  e.preventDefault();
  await sb.auth.signOut();
  location.href = 'login.html';
});

// ---------- início ----------
(async () => {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) {
    location.href = 'login.html';
    return;
  }
  usuarioAtual = session.user;

  // mostra o nome do usuário do lado do BolsoLeve
  const { data: perfil } = await sb
    .from('usuario')
    .select('nome')
    .eq('id', usuarioAtual.id)
    .maybeSingle();
  if (perfil?.nome) {
    document.querySelector('header h1').textContent = `BolsoLeve · ${perfil.nome}`;
  }

  await carregarTipos();
  await carregarContas();
})();