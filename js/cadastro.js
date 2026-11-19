//pega o formulário, a mensagem se deu certo ou não e o botão
const form = document.getElementById("signup-form");
const messageEl = document.getElementById("message");
const submitBtn = document.getElementById("submit-btn");

//roda quando o form for enviado (esperando a resposta)
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nome = document.getElementById("nome").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

//verifica se tudo está certinho
  if (!nome || !email || password.length < 6) {
    messageEl.className = "message error";
    messageEl.textContent = "Informe nome, e-mail e uma senha com pelo menos 6 caracteres.";
    return;
  }

//não deixa fazer muitas tentativas seguidas (não vai bloquear)
  submitBtn.disabled = true;
  messageEl.textContent = "";

//cria o usuário, os triggers do login e da tabela usuário puxam do data{}, redireciona para o login para não dar aquele erro chato de não salvar
  try {
    const { data, error } = await sb.auth.signUp({
      email,
      password,
      options: {
        data: { nome },
        emailRedirectTo: new URL("login.html", window.location.href).href,
      },
    });

    if (error) throw error; //pega a mensagem do error quando não é nula

//tudo certo (mensagem) e vai para página de login
  messageEl.className = "message ok";
  messageEl.textContent = "Conta criada! Redirecionando...";
  setTimeout(() => (window.location.href = "login.html"), 800);

  } catch (err) {
    console.error(err);
    messageEl.className = "message error"; //mensagem se deu erro
    messageEl.textContent = translateError(err.message || "Erro ao conectar com o Supabase.");
  } finally {
    submitBtn.disabled = false; //reativa o botão
  }
}); 