const btnAdd2   = document.querySelector('#btnAdd2');
const dlg2      = document.getElementById('dlg2');
const form2     = document.getElementById('form2');
const lista2    = document.getElementById('lista2');
const descricao2 = document.getElementById('descricao2');
const conta2    = document.getElementById('conta2');
const categoria2 = document.getElementById('categoria2');
const listaCategorias2 = document.getElementById('categorias2'); 
const tipo2     = document.getElementById('tipo2');
const data2     = document.getElementById('data2');
const valor2    = document.getElementById('valor2');
const btnDel2   = document.getElementById('del2');
const titulo2   = document.getElementById('dlgTitle2');

let transacoes = [];//lista de transações do supabase
let categoriasTrans = [];
let tiposTrans = [];
let contasTrans = [];//contas para o select
let editandoId2 = null;//id da transação em edição
let usuarioTrans = null;//usuario logado

// compara textos sem acento e sem maiúsculas
function normalizar2(s) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
}

// ---------- datas ----------
// data de hoje no formato (AAAA-MM-DD)
function hoje() {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, '0'); //janeiro é 0 e bota 0 antes de números sem dois dígitos
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}

// data volta ao formato digitado
function formataData(iso) {
  if (!iso) return '';
  const [a, m, d] = iso.split('-');
  return `${d}/${m}/${a}`;
}

// digita em formato de dinheiro (R$00,00)
valor2.addEventListener('input', () => {
  const digitos = valor2.value.replace(/\D/g, '');
  valor2.value = digitos ? fmt.format(parseInt(digitos, 10) / 100) : '';
});

// selects
async function carregarCategorias2() {
  const { data, error } = await sb.from('categorias').select('id, nome').order('nome');
  if (error) {
    console.error(error);
    alert('Erro ao carregar categorias.');
    return;
  }
  categoriasTrans = data;

  if (categoriasTrans.length === 0) {
    console.warn('Tabela categorias vazia ou sem permissão de leitura.');
    return; // se deu problema de carregar deixa as sugestões
  }

  listaCategorias2.innerHTML = ''; // esvazia a datalist e cria as options para cada vez que percorre
  categoriasTrans.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.nome;
    listaCategorias2.appendChild(opt);
  });
}

async function carregarTipos2() {
  const { data, error } = await sb.from('tipo_transacoes').select('id, nome').order('id');
  if (error) {
    console.error(error);
    alert('Erro ao carregar tipos de transação.');
    return;
  }
  tiposTrans = data;

  tipo2.innerHTML = ''; // opções do tipo_transação
  tiposTrans.forEach(t => {
    const opt = document.createElement('option');
    opt.value = t.id;
    opt.textContent = t.nome;
    tipo2.appendChild(opt);
  });
}

async function carregarContas2() {
  const { data, error } = await sb
    .from('contas_carteira')
    .select('id, nome')
    .eq('id_usuario', usuarioTrans.id)
    .order('nome');
  if (error) {
    console.error(error);
    alert('Erro ao carregar contas.');
    return;
  }
  contasTrans = data;

  const atual = conta2.value; // mantém a seleção ao recarregar
  conta2.innerHTML = '';
  contasTrans.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = c.nome;
    conta2.appendChild(opt);
  });
  if (atual) conta2.value = atual;
}

async function carregarTransacoes() {
  const { data, error } = await sb
    .from('transacoes')
    .select(`
      id, descricao, valor, tipo, data_transacao, id_categoria, id_conta,
      categorias(nome),
      tipo_transacoes(nome),
      contas_carteira(nome)
    `)
    .eq('id_usuario', usuarioTrans.id)
    .order('data_transacao', { ascending: false })
    .order('id', { ascending: false });

  if (error) {
    console.error(error);
    alert('Erro ao carregar transações.');
    return;
  }

  transacoes = data.map(t => ({ // lista nova no formato que meu código usa
    id: t.id,
    descricao: t.descricao || '',
    categoria: t.categorias?.nome || '',
    tipo: t.tipo,       
    tipoNome: t.tipo_transacoes?.nome || '',
    idConta: t.id_conta,
    contaNome: t.contas_carteira?.nome || '',
    data: t.data_transacao,                        
    valor: Number(t.valor)
  }));
  mostra2(); // desenha a lista
}

async function inserirTransacao(dados) { //select
  const { error } = await sb
    .from('transacoes')
    .insert({ ...dados, id_usuario: usuarioTrans.id });
  if (error) throw error; // cai no catch
}

async function atualizarTransacao(id, dados) { //update
  const { error } = await sb
    .from('transacoes')
    .update(dados)
    .eq('id', id)
    .eq('id_usuario', usuarioTrans.id);
  if (error) throw error;
}

async function excluirTransacao(id) { //delete
  const { error } = await sb
    .from('transacoes')
    .delete()
    .eq('id', id)
    .eq('id_usuario', usuarioTrans.id);
  if (error) throw error;
}

// ---------- mostrar na tela ----------
function mostra2() {
  lista2.innerHTML = '';

  if (transacoes.length === 0) {
    lista2.innerHTML = '<p class="vazio">Nenhuma transação cadastrada ainda.</p>';
    return;
  }

  transacoes.forEach(t => {
    const receita = t.tipoNome === 'Receita';
    const card = document.createElement('article');
    card.className = 'card-conta ' + (receita ? 'receita' : 'despesa');
    card.innerHTML = `
      <h3></h3>
      <p class="tipo"></p>
      <p class="data"></p>
      <p class="saldo"></p>
      <button class="btn2 ghost2" data-id="${t.id}">Editar</button>
    `;

    card.querySelector('h3').textContent = t.descricao || t.categoria;
    card.querySelector('.tipo').textContent = `${t.tipoNome} · ${t.categoria} · ${t.contaNome}`;
    card.querySelector('.data').textContent = formataData(t.data);
    card.querySelector('.saldo').textContent =
      (receita ? '+ ' : '- ') + fmt.format(t.valor); // se é receita ou despesa

    card.querySelector('button').addEventListener('click', () => abrirEdicao2(t.id));
    lista2.appendChild(card);
  });
}

// ---------- dialog ----------
async function abrirNovo2() { // limpa os campos, preenche a data de hoje
  await carregarContas2(); // pega contas criadas depois do carregamento da página
  editandoId2 = null;
  titulo2.textContent = 'Nova transação';
  form2.reset();
  data2.value = hoje();
  btnDel2.hidden = true;
  dlg2.showModal();
}

async function abrirEdicao2(id) {
  await carregarContas2();
  const t = transacoes.find(x => x.id === id); //procura o id
  editandoId2 = id;
  titulo2.textContent = 'Editar transação';
  descricao2.value = t.descricao;
  conta2.value     = t.idConta;
  categoria2.value = t.categoria;
  tipo2.value      = t.tipo;
  data2.value      = t.data;
  valor2.value     = fmt.format(t.valor);
  btnDel2.hidden = false;
  dlg2.showModal();
}

btnAdd2.addEventListener('click', abrirNovo2);
document.getElementById('cancel2').addEventListener('click', () => dlg2.close());

form2.addEventListener('submit', async (e) => { //no momento de envio do form
  e.preventDefault();

  if (!usuarioTrans) {
    alert('Sessão não encontrada. Faça login novamente.');
    location.href = 'login.html';
    return;
  }

  if (contasTrans.length === 0) {
    alert('Cadastre uma conta antes de adicionar transações.');
    return;
  }
  if (!categoria2.value.trim()) { // se não tem categoria nem data
    categoria2.focus();
    return;
  }
  if (!data2.value) {
    data2.focus();
    return;
  }

  // nome normalizado é igual ao editado para pegar o id
  const cat = categoriasTrans.find(c => normalizar2(c.nome) === normalizar2(categoria2.value));
  if (!cat) {
    alert('Categoria não encontrada. Escolha uma das opções sugeridas.');
    categoria2.focus();
    return;
  }

  const dados = { //montagem de dados da página
    descricao:      descricao2.value.trim(),
    id_conta:       parseInt(conta2.value, 10),
    id_categoria:   cat.id,
    tipo:           parseInt(tipo2.value, 10),
    data_transacao: data2.value,
    valor:          parseMoeda(valor2.value)
  };

  if (Number.isNaN(dados.id_conta)) { // se id da conta está vazio,volta NaN e não quebra 
    alert('Escolha uma conta.');
    conta2.focus();
    return;
  }

  try { // tenta editar, depois inserir e por fim recarrega a lista do bd
    if (editandoId2) {
      await atualizarTransacao(editandoId2, dados);
    } else {
      await inserirTransacao(dados);
    }
    await carregarTransacoes();
    dlg2.close();
  } catch (err) {
    console.error(err);
    alert('Erro ao salvar: ' + err.message);
  }
});

btnDel2.addEventListener('click', async () => { //exclui, sim ou não, se cancelar não apaga
  if (!confirm('Excluir esta transação?')) return;
  try {
    await excluirTransacao(editandoId2);
    await carregarTransacoes();
    dlg2.close();
  } catch (err) {
    console.error(err);
    alert('Erro ao excluir: ' + err.message);
  }
});

// ---------- início ----------
(async () => { // pegar coisas na hora de carregar a página
  const { data: { session } } = await sb.auth.getSession(); // vê se alguém está logado
  if (!session) {
    location.href = 'login.html'; //volta para o login
    return;
  }
  usuarioTrans = session.user;
  await carregarCategorias2();
  await carregarTipos2();
  await carregarContas2();
  await carregarTransacoes(); //carrega todas as coisas que precisa do banco na página 
})();