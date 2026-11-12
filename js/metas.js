const btnAdd1 = document.querySelector('#btnAdd1');
const dlg1    = document.getElementById('dlg1');
const form1   = document.getElementById('form1');
const lista1  = document.getElementById('lista1');
const nome1   = document.getElementById('nome1');
const valor1  = document.getElementById('valor1');
const btnDel1 = document.getElementById('del1');
const titulo1 = document.getElementById('dlgTitle1');

let metas = [];            // lista de metas
let editandoId1 = null;    // id da meta em edição 

// ---------- digitação de valor na meta ----------
valor1.addEventListener('input', () => {
  const digitos = valor1.value.replace(/\D/g, '');
  valor1.value = digitos ? fmt.format(parseInt(digitos, 10) / 100) : '';
});

// ---------- persistência ----------
function salvarStorage1() {
  localStorage.setItem('metas', JSON.stringify(metas));
}
function carregarStorage1() {
  metas = JSON.parse(localStorage.getItem('metas') || '[]');
}

// ---------- mostrar na tela ----------
function mostra1() {
  lista1.innerHTML = '';

  if (metas.length === 0) {
    lista1.innerHTML = '<p class="vazio">Nenhuma meta cadastrada ainda.</p>';
    return;
  }

  metas.forEach(meta => {
    const card = document.createElement('article');
    card.className = 'card-conta';
    card.innerHTML = `
      <h3></h3>
      <p class="saldo"></p>
      <button class="btn ghost" data-id="${meta.id}">Editar</button>
    `;

    card.querySelector('h3').textContent = meta.nome;
    card.querySelector('.saldo').textContent = fmt.format(meta.valor);

    card.querySelector('button').addEventListener('click', () => abrirEdicao1(meta.id));
    lista1.appendChild(card);
  });
}

// ---------- dialog ----------
function abrirNovo1() {
  editandoId1 = null;
  titulo1.textContent = 'Nova meta';
  form1.reset();            // limpa os campos
  btnDel1.hidden = true;
  dlg1.showModal();
}

function abrirEdicao1(id) {
  const m = metas.find(x => x.id === id);
  editandoId1 = id;
  titulo1.textContent = 'Editar meta';
  nome1.value  = m.nome;
  valor1.value = fmt.format(m.valor);
  btnDel1.hidden = false;
  dlg1.showModal();
}

btnAdd1.addEventListener('click', abrirNovo1);
document.getElementById('cancel1').addEventListener('click', () => dlg1.close());

form1.addEventListener('submit', (e) => {
  e.preventDefault();

  if (!nome1.value.trim()) {
    nome1.focus();
    return;
  }

  const dados = {
    nome:  nome1.value.trim(),
    valor: parseMoeda(valor1.value)
  };

  if (editandoId1) {
    const i = metas.findIndex(x => x.id === editandoId1);
    metas[i] = { ...metas[i], ...dados };
  } else {
    metas.push({ id: Date.now(), ...dados });
  }

  salvarStorage1();
  mostra1();
  dlg1.close();
});

btnDel1.addEventListener('click', () => {
  metas = metas.filter(x => x.id !== editandoId1);
  salvarStorage1();
  mostra1();
  dlg1.close();
});

// ---------- início ----------
carregarStorage1();
mostra1();