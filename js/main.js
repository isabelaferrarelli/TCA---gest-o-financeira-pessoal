const btnAdd = document.querySelector('#btnAdd');
const dlg    = document.getElementById('dlg');
const form   = document.getElementById('form');
const lista  = document.getElementById('lista');
const nome   = document.getElementById('nome');
const tipo   = document.getElementById('tipo');
const saldo  = document.getElementById('saldo');
const btnDel = document.getElementById('del');
const titulo = document.getElementById('dlgTitle');

let contas = [];          // lista de contas
let editandoId = null;    // id da conta em edição (null = nova)

// ---------- formatação e digitação de valor na conta----------
const fmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

// converte "R$ 1.234,56" em 1234.56
function parseMoeda(txt) {
  const n = txt.replace(/[^\d,-]/g, '').replace(',', '.');
  return parseFloat(n) || 0;
}

// esconde enquanto digita
saldo.addEventListener('input', () => {
  const digitos = saldo.value.replace(/\D/g, '');
  saldo.value = digitos ? fmt.format(parseInt(digitos, 10) / 100) : '';
});

// ---------- persistência (localStorage por enquanto) ----------
function salvarStorage() {
  localStorage.setItem('contas', JSON.stringify(contas));
}
function carregarStorage() {
  contas = JSON.parse(localStorage.getItem('contas') || '[]');
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
    card.querySelector('.tipo').textContent = conta.tipo;
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
} //limpa os campos

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

form.addEventListener('submit', (e) => {
  e.preventDefault();

  if (!nome.value.trim()) {
    nome.focus();
    return;
  }

  const dados = {
    nome:  nome.value.trim(),
    tipo:  tipo.value,
    saldo: parseMoeda(saldo.value)
  };

  if (editandoId) {
    const i = contas.findIndex(x => x.id === editandoId);
    contas[i] = { ...contas[i], ...dados };
  } else {
    contas.push({ id: Date.now(), ...dados });
  }

  salvarStorage();
  mostra();
  dlg.close();
});

btnDel.addEventListener('click', () => {
  contas = contas.filter(x => x.id !== editandoId);
  salvarStorage();
  mostra();
  dlg.close();
});

// ---------- início ----------
carregarStorage();
mostra();