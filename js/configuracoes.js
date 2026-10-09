// Preenche o perfil com os dados de quem está logado
const sessao = getSessao();
if (sessao) {
  document.getElementById("nome").value = sessao.nome || "";
  document.getElementById("email").value = sessao.email || "";
  document.getElementById("perfil").value = sessao.perfil || "produtor_exportador";
}

// Aviso ao salvar (a API ainda não tem rota para editar o perfil, então não grava)
const toast = document.getElementById("toast");
document.getElementById("salvar").onclick = () => {
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2200);
};