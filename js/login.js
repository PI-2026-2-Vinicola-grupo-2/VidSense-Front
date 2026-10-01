// Apenas visual: nenhum dado é validado, o botão Entrar leva ao dashboard
const perfis = {
  produtor: { nome: "Maria Souza", cargo: "Produtora" },
  analista: { nome: "Carlos Lima", cargo: "Analista de dados" },
  admin: { nome: "Ana Costa", cargo: "Administradora" },
};
let escolhido = "produtor";

document.querySelectorAll("#perfis button").forEach((b) => {
  b.onclick = () => {
    document.querySelectorAll("#perfis button").forEach((x) => x.classList.remove("on"));
    b.classList.add("on");
    escolhido = b.dataset.p;
  };
});

document.getElementById("form").addEventListener("submit", (e) => {
  e.preventDefault();
  // Guarda o perfil escolhido só para o menu lateral exibir o nome
  sessionStorage.setItem("usuario", JSON.stringify(perfis[escolhido]));
  location.href = "index.html";
});

// Links de exemplo não fazem nada
document.querySelectorAll('a[href="#"]').forEach((a) => a.addEventListener("click", (e) => e.preventDefault()));