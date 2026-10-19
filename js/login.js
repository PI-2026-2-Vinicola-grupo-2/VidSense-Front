const CARGOS = {
  produtor_exportador: "Produtor/Exportador",
  analista_dados: "Analista de dados",
  administrador: "Administrador",
};

const form = document.getElementById("form");
const erroEl = document.getElementById("erro");
const nomeEl = document.getElementById("nome");
const campoNome = document.getElementById("campo-nome");
const submitEl = document.getElementById("submit-form");
const alternarCadastroEl = document.getElementById("alternar-cadastro");
let modoCadastro = false;

alternarCadastroEl.addEventListener("click", () => {
  modoCadastro = !modoCadastro;
  campoNome.hidden = !modoCadastro;
  nomeEl.required = modoCadastro;
  submitEl.textContent = modoCadastro ? "Criar conta" : "Entrar";
  alternarCadastroEl.textContent = modoCadastro ? "Voltar ao login" : "Criar conta";
  erroEl.textContent = "";
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value;
  if (erroEl) erroEl.textContent = "";

  try {
    const dados = await apiFetch(
      modoCadastro ? "/auth/register" : "/auth/login",
      {
        method: "POST",
        redirectOnUnauthorized: false,
        body: JSON.stringify(
          modoCadastro
            ? {
                nome: nomeEl.value.trim(),
                email,
                senha,
                perfil: "produtor_exportador",
              }
            : { email, senha }
        ),
      }
    );
    if (modoCadastro) {
      modoCadastro = false;
      campoNome.hidden = true;
      nomeEl.required = false;
      submitEl.textContent = "Entrar";
      alternarCadastroEl.textContent = "Criar conta";
      erroEl.className = "sucesso";
      erroEl.textContent = "Conta criada. Agora entre com sua senha.";
      return;
    }
    salvarSessao({
      access_token: dados.access_token,
      nome: dados.nome,
      email,
      perfil: dados.perfil,
      cargo: CARGOS[dados.perfil] || dados.perfil,
    });
    location.href = "index.html";
  } catch (err) {
    if (erroEl) {
      erroEl.className = "erro";
      erroEl.textContent = modoCadastro
        ? (err.message || "Não foi possível criar a conta.")
        : "E-mail ou senha inválidos.";
    }
  }
});

document.querySelectorAll('a[href="#"]').forEach((a) => a.addEventListener("click", (e) => e.preventDefault()));