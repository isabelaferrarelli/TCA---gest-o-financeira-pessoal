const btnAdd1 = document.querySelector('#btnAdd1');
const dlg1    = document.getElementById('dlg1');
const form1   = document.getElementById('form1');
const lista1  = document.getElementById('lista1');
const nomeMeta   = document.getElementById('nomem');   // nome da meta
const categoria1 = document.getElementById('nome1');   // categoria (texto)
const listaCategorias = document.getElementById('metas'); // datalist
const valor1  = document.getElementById('valor1');
const btnDel1 = document.getElementById('del1');
const titulo1 = document.getElementById('dlgTitle1');

let metas = [];             // lista de metas (vinda do Supabase)
let categorias = [];        // lista de categorias
let editandoId1 = null;     // id da meta em edição (null = nova)
let usuarioMetas = null;    // usuário logado

// fmt e parseMoeda vêm do contas.js (que precisa ser carregado antes)

// compara textos sem acento e sem diferenciar maiúsculas
function norm(s) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
}

// ---------- digitação de valor na meta ----------
valor1.addEventListener('input', () => {
  const digitos = valor1.value.replace(/\D/g, '');
  valor1.value = digitos ? fmt.format(parseInt(digitos, 10) / 100) : '';
});

// ---------- Supabase ----------
async function carregarCategorias() {
  const { data, error } = await sb.from('categorias').select('id, nome').order('nome');
  if (error) {
    console.error(error);
    alert('Erro ao carregar categorias.');
    return;
  }
  categorias = data;

  // preenche as sugestões do campo de categoria
  listaCategorias.innerHTML = '';
  categorias.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.nome;
    listaCategorias.appendChild(opt);
  });
}

async function carregarMetas() {
  const { data, error } = await sb
    .from('metas')
    .select('id, nome, id_categoria, valor_limite, categorias(nome)')
    .eq('id_usuario', usuarioMetas.id)
    .order('id');

  if (error) {
    console.error(error);
    alert('Erro ao carregar metas.');
    return;
  }

  metas = data.map(m => ({
    id: m.id,
    nome: m.nome,
    categoriaNome: m.categorias?.nome || '',
    valor: Number(m.valor_limite)
  }));
  mostra1();
}

async function inserirMeta(dados) {
  const { error } = await sb
    .from('metas')
    .insert({ ...dados, id_usuario: usuarioMetas.id });
  if (error) throw error;
}

async function atualizarMeta(id, dados) {
  const { error } = await sb
    .from('metas')
    .update(dados)
    .eq('id', id)
    .eq('id_usuario', usuarioMetas.id);
  if (error) throw error;
}

async function excluirMeta(id) {
  const { error } = await sb
    .from('metas')
    .delete()
    .eq('id', id)
    .eq('id_usuario', usuarioMetas.id);
  if (error) throw error;
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
      <p class="tipo"></p>
      <p class="saldo"></p>
      <button class="btn ghost" data-id="${meta.id}">Editar</button>
    `;

    card.querySelector('h3').textContent = meta.nome || meta.categoriaNome;
    card.querySelector('.tipo').textContent = meta.categoriaNome;
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
  nomeMeta.value   = m.nome;
  categoria1.value = m.categoriaNome;
  valor1.value     = fmt.format(m.valor);
  btnDel1.hidden = false;
  dlg1.showModal();
}

btnAdd1.addEventListener('click', abrirNovo1);
document.getElementById('cancel1').addEventListener('click', () => dlg1.close());

form1.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!usuarioMetas) {
    alert('Sessão não encontrada. Faça login novamente.');
    location.href = 'login.html';
    return;
  }

  if (!nomeMeta.value.trim()) {
    nomeMeta.focus();
    return;
  }

  // converte o texto da categoria no id da tabela categorias
  const cat = categorias.find(c => norm(c.nome) === norm(categoria1.value));
  if (!cat) {
    alert('Categoria não encontrada. Escolha uma das opções sugeridas.');
    categoria1.focus();
    return;
  }

  const dados = {
    nome: nomeMeta.value.trim(),
    id_categoria: cat.id,
    valor_limite: parseMoeda(valor1.value)
  };

  if (dados.valor_limite <= 0) {
    alert('O valor precisa ser maior que zero.');
    valor1.focus();
    return;
  }

  try {
    if (editandoId1) {
      await atualizarMeta(editandoId1, dados);
    } else {
      await inserirMeta(dados);
    }
    await carregarMetas();
    dlg1.close();
  } catch (err) {
    console.error(err);
    if (err.code === '23505') {
      alert('Você já tem uma meta para essa categoria. Edite a existente.');
    } else {
      alert('Erro ao salvar: ' + err.message);
    }
  }
});

btnDel1.addEventListener('click', async () => {
  if (!confirm('Excluir esta meta?')) return;
  try {
    await excluirMeta(editandoId1);
    await carregarMetas();
    dlg1.close();
  } catch (err) {
    console.error(err);
    alert('Erro ao excluir: ' + err.message);
  }
});

// ---------- início ----------
(async () => {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) {
    location.href = 'login.html';
    return;
  }
  usuarioMetas = session.user;
  await carregarCategorias();
  await carregarMetas();
})();