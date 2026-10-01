// Apenas visual: mostra uma mensagem, não salva nada
const toast = document.getElementById("toast");

document.getElementById("salvar").onclick = () => {
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2200);
};