const btnAdd2   = document.querySelector('#btnAdd2');
const dlg2      = document.getElementById('dlg2');
const form2     = document.getElementById('form2');
const lista2    = document.getElementById('lista2');
const descricao2 = document.getElementById('descricao2');
const categoria2 = document.getElementById('categoria2');
const tipo2     = document.getElementById('tipo2');
const data2     = document.getElementById('data2');
const valor2    = document.getElementById('valor2');
const btnDel2   = document.getElementById('del2');
const titulo2   = document.getElementById('dlgTitle2');

let transacoes = [];       // lista de transações
let editandoId2 = null;    // id da transação em edição

// ---------- datas ----------
// data de hoje no formato (AAAA-MM-DD)
function hoje() {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}

// "2026-11-12" -> "12/11/2026" 
function formataData(iso) {
  if (!iso) return '';
  const [a, m, d] = iso.split('-');
  return `${d}/${m}/${a}`;
}

// ---------- digitação de valor na transação ----------
valor2.addEventListener('input', () => {
  const digitos = valor2.value.replace(/\D/g, '');
  valor2.value = digitos ? fmt.format(parseInt(digitos, 10) / 100) : '';
});

// ---------- persistência----------
function salvarStorage2() {
  localStorage.setItem('transacoes', JSON.stringify(transacoes));
}
function carregarStorage2() {
  transacoes = JSON.parse(localStorage.getItem('transacoes') || '[]');
}

// ---------- mostrar na tela ----------
function mostra2() {
  lista2.innerHTML = '';

  if (transacoes.length === 0) {
    lista2.innerHTML = '<p class="vazio">Nenhuma transação cadastrada ainda.</p>';
    return;
  }

  const ordenadas = [...transacoes].sort((a, b) => b.data.localeCompare(a.data));

  ordenadas.forEach(t => {
    const card = document.createElement('article');
    card.className = 'card-conta ' + (t.tipo === 'Receita' ? 'receita' : 'despesa');
    card.innerHTML = `
      <h3></h3>
      <p class="tipo"></p>
      <p class="data"></p>
      <p class="saldo"></p>
      <button class="btn2 ghost2" data-id="${t.id}">Editar</button>
    `;

    card.querySelector('h3').textContent = t.descricao || t.categoria;
    card.querySelector('.tipo').textContent = `${t.tipo} · ${t.categoria}`;
    card.querySelector('.data').textContent = formataData(t.data);
    card.querySelector('.saldo').textContent =
      (t.tipo === 'Receita' ? '+ ' : '- ') + fmt.format(t.valor);

    card.querySelector('button').addEventListener('click', () => abrirEdicao2(t.id));
    lista2.appendChild(card);
  });
}

// ---------- dialog ----------
function abrirNovo2() {
  editandoId2 = null;
  titulo2.textContent = 'Nova transação';
  form2.reset();            // limpa os campos
  data2.value = hoje();     // data de hoje já preenchida
  btnDel2.hidden = true;
  dlg2.showModal();
}

function abrirEdicao2(id) {
  const t = transacoes.find(x => x.id === id);
  editandoId2 = id;
  titulo2.textContent = 'Editar transação';
  descricao2.value = t.descricao;
  categoria2.value = t.categoria;
  tipo2.value      = t.tipo;
  data2.value      = t.data;
  valor2.value     = fmt.format(t.valor);
  btnDel2.hidden = false;
  dlg2.showModal();
}

btnAdd2.addEventListener('click', abrirNovo2);
document.getElementById('cancel2').addEventListener('click', () => dlg2.close());

form2.addEventListener('submit', (e) => {
  e.preventDefault();

  if (!categoria2.value.trim()) {
    categoria2.focus();
    return;
  }
  if (!data2.value) {
    data2.focus();
    return;
  }

  const dados = {
    descricao: descricao2.value.trim(),
    categoria: categoria2.value.trim(),
    tipo:      tipo2.value,
    data:      data2.value,
    valor:     parseMoeda(valor2.value)
  };

  if (editandoId2) {
    const i = transacoes.findIndex(x => x.id === editandoId2);
    transacoes[i] = { ...transacoes[i], ...dados };
  } else {
    transacoes.push({ id: Date.now(), ...dados });
  }

  salvarStorage2();
  mostra2();
  dlg2.close();
});

btnDel2.addEventListener('click', () => {
  transacoes = transacoes.filter(x => x.id !== editandoId2);
  salvarStorage2();
  mostra2();
  dlg2.close();
});

// ---------- início ----------
carregarStorage2();
mostra2();