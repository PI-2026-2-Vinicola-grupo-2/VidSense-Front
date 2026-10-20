const CARGOS = {
  produtor_exportador: "Produtor/Exportador",
  analista_dados: "Analista de dados",
  administrador: "Administrador",
};

const form = document.getElementById("form");
const erroEl = document.getElementById("erro");

const nomeEl = document.getElementById("nome");
const campoNome = document.getElementById("campo-nome");

const emailEl = document.getElementById("email");
const senhaEl = document.getElementById("senha");

const submitEl = document.getElementById("submit-form");
const alternarCadastroEl = document.getElementById("alternar-cadastro");

const tituloEl = document.getElementById("titulo-form");
const subtituloEl = document.getElementById("subtitulo-form");
const rodapeEl = document.getElementById("rodape-login");

let modoCadastro = false;


// ======================================================
// MODO LOGIN
// ======================================================

function mostrarLogin() {
  modoCadastro = false;

  campoNome.classList.remove("mostrar");
  nomeEl.required = false;

  tituloEl.textContent = "Bem-vindo de volta";

  subtituloEl.textContent =
    "Entre com suas credenciais. O perfil é definido pela API.";

  submitEl.textContent = "Entrar";

  rodapeEl.innerHTML = `
    Ainda não tem conta?
    <button type="button" class="link" id="alternar-cadastro">
      Criar conta
    </button>
  `;

  erroEl.textContent = "";

  conectarBotaoAlternar();
}


// ======================================================
// MODO CADASTRO
// ======================================================

function mostrarCadastro() {
  modoCadastro = true;

  campoNome.classList.add("mostrar");
  nomeEl.required = true;

  tituloEl.textContent = "Criar conta";

  subtituloEl.textContent =
    "Crie sua conta de Produtor/Exportador.";

  submitEl.textContent = "Criar conta";

  rodapeEl.innerHTML = `
    Já tem conta?
    <button type="button" class="link" id="alternar-cadastro">
      Entrar aqui
    </button>
  `;

  erroEl.textContent = "";

  conectarBotaoAlternar();
}


// ======================================================
// BOTÃO ENTRE LOGIN / CADASTRO
// ======================================================

function conectarBotaoAlternar() {
  const botao = document.getElementById("alternar-cadastro");

  botao.addEventListener("click", () => {
    if (modoCadastro) {
      mostrarLogin();
    } else {
      mostrarCadastro();
    }
  });
}


// Inicialmente começa no login
mostrarLogin();


// ======================================================
// ENVIO DO FORMULÁRIO
// ======================================================

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = emailEl.value.trim();
  const senha = senhaEl.value;

  erroEl.className = "erro";
  erroEl.textContent = "";

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

                // IMPORTANTE:
                // cadastro público só cria Produtor/Exportador
                perfil: "produtor_exportador",
              }
            : {
                email,
                senha,
              }
        ),
      }
    );


    // ==================================================
    // CADASTRO CONCLUÍDO
    // ==================================================

    if (modoCadastro) {
      mostrarLogin();

      emailEl.value = email;
      senhaEl.value = "";

      erroEl.className = "sucesso";
      erroEl.textContent =
        "Conta criada com sucesso. Agora entre com seu e-mail e senha.";

      return;
    }


    // ==================================================
    // LOGIN CONCLUÍDO
    // ==================================================

    salvarSessao({
      access_token: dados.access_token,
      nome: dados.nome,
      email,
      perfil: dados.perfil,
      cargo: CARGOS[dados.perfil] || dados.perfil,
    });

    location.href = "index.html";

  } catch (err) {

    erroEl.className = "erro";

    if (modoCadastro) {
      erroEl.textContent =
        err.message || "Não foi possível criar a conta.";
    } else {
      erroEl.textContent =
        "E-mail ou senha inválidos.";
    }
  }
});


// Impede links com href="#"
document.querySelectorAll('a[href="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    e.preventDefault();
  });
});