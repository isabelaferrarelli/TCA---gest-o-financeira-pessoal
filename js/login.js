const PAGINA_APOS_LOGIN = "index.html"; // troque pela página que quiser abrir após entrar
 
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
 
  const { error } = await db.auth.signInWithPassword({ email, password });
 
  if (error) {
    messageEl.className = "message error";
    messageEl.textContent = translateError(error.message);
    submitBtn.disabled = false;
    return;
  }
  window.location.href = PAGINA_APOS_LOGIN;
});
 
