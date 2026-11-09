const SUPABASE_URL = "https://phrartcpvbbqmooygsic.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_x8S9_1rf6UEQ7K11Aoyrrg_wXonqKD0";

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function translateError(msg) {
  if (msg.includes("Invalid login credentials")) return "E-mail ou senha incorretos.";
  if (msg.includes("Email not confirmed")) return "Confirme seu e-mail antes de entrar.";
  if (msg.includes("User already registered")) return "Este e-mail já tem uma conta.";
  if (msg.includes("Password should be at least")) return "A senha precisa ter pelo menos 6 caracteres.";
  if (msg.includes("rate limit")) return "Muitas tentativas. Aguarde um pouco e tente de novo.";
  return msg;
}
