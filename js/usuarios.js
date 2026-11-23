const $ = (id) => document.getElementById(id);
const UI = window.UI;

const PERFIS = [
  ["produtor_exportador", "Produtor / exportador"],
  ["analista_dados", "Analista de dados"],
  ["administrador", "Administrador"],
];

const sessao = getSessao();
let usuarios = [];

const opcoesPerfil = (atual) =>
  PERFIS.map(([valor, nome]) =>
    `<option value="${valor}" ${valor === atual ? "selected" : ""}>${nome}</option>`
  ).join("");

function desenhar() {
  if (!usuarios.length) {
    UI.vazio($("linhas"), "Nenhum usuário cadastrado.");
    return;
  }

  $("linhas").innerHTML = usuarios.map((u) => {
    const eu = sessao && u.email === sessao.email;
    return `
      <tr data-id="${u.id}">
        <td>${UI.esc(u.nome)} ${eu ? '<small class="rot">(você)</small>' : ""}</td>
        <td>${UI.esc(u.email)}</td>
        <td><select class="mini perfil-sel" ${eu ? "disabled" : ""}>${opcoesPerfil(u.perfil)}</select></td>
        <td>
          ${eu
            ? '<span class="rot">Não é possível alterar o próprio perfil</span>'
            : '<button type="button" class="mini-btn salvar">Salvar</button> <span class="rot status-linha"></span>'}
        </td>
      </tr>`;
  }).join("");

  document.querySelectorAll(".salvar").forEach((b) => {
    b.onclick = () => salvar(b.closest("tr"));
  });
}

async function salvar(tr) {
  const id = tr.dataset.id;
  const perfil = tr.querySelector(".perfil-sel").value;
  const status = tr.querySelector(".status-linha");
  status.textContent = "Salvando...";
  status.className = "rot status-linha";

  try {
    const atualizado = await apiFetch(`/admin/usuarios/${id}/perfil`, {
      method: "PATCH",
      body: JSON.stringify({ perfil }),
    });
    const i = usuarios.findIndex((u) => String(u.id) === String(id));
    if (i >= 0) usuarios[i] = atualizado;
    status.textContent = "Salvo";
    status.className = "tag ok status-linha";
  } catch (e) {
    status.textContent = e.message || "Não foi possível salvar.";
    status.className = "estado-erro status-linha";
  }
}

async function carregar() {
  UI.carregando($("linhas"), "Carregando usuários...");
  try {
    usuarios = await apiFetch("/admin/usuarios");
    $("origem").innerHTML = UI.selo("api");
    desenhar();
  } catch (e) {
    $("origem").innerHTML = UI.selo("indisp");
    UI.erro($("linhas"), "Não foi possível carregar os usuários.", carregar);
  }
}

// Cadastro de novo usuário pelo administrador
$("form-novo").addEventListener("submit", async (e) => {
  e.preventDefault();
  const msg = $("n-msg");
  const botao = e.target.querySelector("button[type=submit]");
  msg.textContent = "Criando...";
  msg.className = "rot";
  botao.disabled = true;

  try {
    await apiFetch("/admin/usuarios", {
      method: "POST",
      body: JSON.stringify({
        nome: $("n-nome").value.trim(),
        email: $("n-email").value.trim(),
        senha: $("n-senha").value,
        perfil: $("n-perfil").value,
      }),
    });
    msg.textContent = "Usuário criado.";
    msg.className = "tag ok";
    e.target.reset();
    carregar();
  } catch (err) {
    msg.textContent = err.message || "Não foi possível criar o usuário.";
    msg.className = "estado-erro";
  } finally {
    botao.disabled = false;
  }
});

carregar();