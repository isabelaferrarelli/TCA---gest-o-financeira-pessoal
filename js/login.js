const PAGINA_APOS_LOGIN = "logado.html";

const form = document.getElementById("login-form");
const messageEl = document.getElementById("message");
const submitBtn = document.getElementById("submit-btn");

// Garante que o usuário logado exista na tabela "usuario"
async function garantirUsuario(user) {
  //Nome do cadastro ou o email sem @ (se dá undefined, passa pro próximo)
  const nome =
    user.user_metadata?.nome ||
    user.email.split("@")[0];

//Grava na tabela que eu fiz (insert com update)
  const { error } = await sb
    .from("usuario")
    .upsert(
      { id: user.id, nome: nome, email: user.email },
      { onConflict: "id", ignoreDuplicates: true } //quando já existe, não faz nada
    );

  if (error) throw error; //vai pro catch
}

//Se o ser que está no site já fez o login
sb.auth.getSession().then(async ({ data }) => { //consulta se tem sessão salva
  if (data.session) {
    try {
      await garantirUsuario(data.session.user);
    } catch (e) {
      console.error(e);
    }
    window.location.href = PAGINA_APOS_LOGIN;
  }
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  //validação
  if (!email || !password) {
    messageEl.className = "message error";
    messageEl.textContent = "Preencha e-mail e senha.";
    return;
  }

  //zera a mensagem e a ativação do botão
  submitBtn.disabled = true;
  messageEl.textContent = "";

//envia o email e a senha para o supabase e vê se está certo
  try {
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw error; //joga o erro para o catch

    await garantirUsuario(data.user); //bota a linha em usuário e redireciona
    window.location.href = PAGINA_APOS_LOGIN;
  } catch (err) {
    console.error(err);
    messageEl.className = "message error";
    messageEl.textContent = translateError(err.message || "Erro ao conectar com o Supabase.");
    submitBtn.disabled = false;
  }
});