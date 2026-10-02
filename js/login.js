const CARGOS = {
  produtor_exportador: "Produtor/Exportador",
  analista_dados: "Analista de dados",
  administrador: "Administrador",
};

const form = document.getElementById("form");
const erroEl = document.getElementById("erro");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value;
  if (erroEl) erroEl.textContent = "";

  try {
    const dados = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, senha }),
    });
    salvarSessao({
      access_token: dados.access_token,
      nome: dados.nome,
      perfil: dados.perfil,
      cargo: CARGOS[dados.perfil] || dados.perfil,
    });
    location.href = "index.html";
  } catch (err) {
    if (erroEl) erroEl.textContent = "E-mail ou senha inválidos.";
  }
});

document.querySelectorAll('a[href="#"]').forEach((a) => a.addEventListener("click", (e) => e.preventDefault()));