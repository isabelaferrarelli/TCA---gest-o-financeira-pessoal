const form = document.getElementById("signup-form");
const messageEl = document.getElementById("message");
const submitBtn = document.getElementById("submit-btn");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nome = document.getElementById("nome").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!nome || !email || password.length < 6) {
    messageEl.className = "message error";
    messageEl.textContent = "Informe nome, e-mail e uma senha com pelo menos 6 caracteres.";
    return;
  }

  submitBtn.disabled = true;
  messageEl.textContent = "";

  try {
    const { data, error } = await db.auth.signUp({
      email,
      password,
      options: {
        data: { nome },
        emailRedirectTo: new URL("login.html", window.location.href).href,
      },
    });

    console.log("data:", data, "error:", error);

    if (error) throw error;

    messageEl.className = "message ok";
    messageEl.textContent = data.session
      ? "Conta criada! Redirecionando..."
      : "Conta criada! Confirme pelo link enviado ao seu e-mail.";

    if (data.session) setTimeout(() => (window.location.href = "painel.html"), 800);
  } catch (err) {
    console.error(err);
    messageEl.className = "message error";
    messageEl.textContent = translateError(err.message || "Erro ao conectar com o Supabase.");
  } finally {
    submitBtn.disabled = false;
  }
});