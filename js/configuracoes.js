const UI = window.UI;
const toast = document.getElementById("toast");

// Perfil: vem da sessão
const sessao = getSessao();
if (sessao && typeof sessao === "object") {
  const nome = document.getElementById("nome");
  if (nome && sessao.nome) nome.value = sessao.nome;
  const email = document.getElementById("email");
  if (email && sessao.email) email.value = sessao.email;
}

// Notificações são só visuais: a tela deixa isso claro
document.getElementById("origem-notif").innerHTML = UI.selo("exemplo");

// Status da fonte de dados: consulta a leitura atual e mostra se está recente
async function atualizarStatusFonte() {
  const el = document.getElementById("status-fonte");
  try {
    const d = await apiFetch("/clima/atual");
    const desatualizado = d.desatualizado ?? false;
    if (desatualizado) {
      el.textContent = "Sem dados recentes";
      el.className = "tag warn";
    } else {
      el.textContent = "Dados recentes";
      el.className = "tag ok";
    }
  } catch (e) {
    el.textContent = "Indisponível";
    el.className = "tag inf";
  }
}

// Aviso ao salvar: a API ainda não grava configurações
document.getElementById("salvar").onclick = () => {
  toast.textContent = "Configurações ainda não possuem persistência na API.";
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2200);
};

atualizarStatusFonte();