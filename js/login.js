const PAGINA_APOS_LOGIN = "painel.html";

const form = document.getElementById("login-form");
const messageEl = document.getElementById("message");
const submitBtn = document.getElementById("submit-btn");

// Se já estiver logado 
db.auth.getSession().then(async ({ data }) => {
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

  if (!email || !password) {
    messageEl.className = "message error";
    messageEl.textContent = "Preencha e-mail e senha.";
    return;
  }

  submitBtn.disabled = true;
  messageEl.textContent = "";

  try {
    const { data, error } = await db.auth.signInWithPassword({ email, password });
    if (error) throw error;

    await garantirUsuario(data.user);
    window.location.href = PAGINA_APOS_LOGIN;
  } catch (err) {
    console.error(err);
    messageEl.className = "message error";
    messageEl.textContent = translateError(err.message || "Erro ao conectar com o Supabase.");
    submitBtn.disabled = false;
  }
});