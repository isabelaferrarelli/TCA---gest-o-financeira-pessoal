const PAGINA_APOS_LOGIN = "painel.html"; // troque pela página que quiser abrir após entrar

const form = document.getElementById("login-form");
const messageEl = document.getElementById("message");
const submitBtn = document.getElementById("submit-btn");

// Se já estiver logado, vai direto para a página interna
db.auth.getSession().then(({ data }) => {
  if (data.session) window.location.href = PAGINA_APOS_LOGIN;
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!email || !password) {
    messageEl.className = "message error";
    messageEl.textContent = "Preencha e-mail e senha.";
    return;
  }

  submitBtn.disabled = true;
  messageEl.textContent = "";

  try {
    const { error } = await db.auth.signInWithPassword({ email, password });
    if (error) throw error;
    window.location.href = PAGINA_APOS_LOGIN;
  } catch (err) {
    console.error(err);
    messageEl.className = "message error";
    messageEl.textContent = translateError(err.message || "Erro ao conectar com o Supabase.");
    submitBtn.disabled = false;
  }
});