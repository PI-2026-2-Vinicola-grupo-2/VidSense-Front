// Apenas visual: o backend atual não possui endpoint de configurações.
const toast = document.getElementById("toast");
const sessao = getSessao();
if (sessao && typeof sessao === "object") {
  const nome = document.getElementById("nome");
  if (nome && sessao.nome) nome.value = sessao.nome;
  const email = document.getElementById("email");
  if (email && sessao.email) email.value = sessao.email;
}

// Aviso ao salvar (a API ainda não tem rota para editar o perfil, então não grava)
document.getElementById("salvar").onclick = () => {
  toast.textContent = "Configurações ainda não possuem persistência na API.";
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2200);
};