let alertas = [];
let erroCarregamento = false;
const nomes = { warn: "Atenção", info: "Info", ok: "Resolvido" };
let filtro = "todos";
const $ = (id) => document.getElementById(id);

function chaveLida(id) { return `alerta-lido-${id}`; }

function desenhar() {
  if (erroCarregamento) {
    $("resumo").textContent = "Não foi possível carregar os alertas.";
    $("lista").innerHTML = `<p class="rot">Verifique a conexão com a API e tente novamente.</p>`;
    return;
  }
  const itens = alertas
    .map((a, i) => ({ ...a, i, lida: sessionStorage.getItem(chaveLida(a.id)) === "1" }))
    .filter((a) => filtro === "todos" || a.tipo === filtro);
  const naoLidas = alertas.filter((a) => sessionStorage.getItem(chaveLida(a.id)) !== "1").length;
  $("resumo").textContent = naoLidas ? `${naoLidas} alertas não lidos.` : "Tudo em dia, nenhum alerta pendente.";
  $("lista").innerHTML = itens.map((a) => `
    <div class="alerta ${a.lida ? "lida" : ""}">
      <span class="dot ${escapeHTML(a.tipo)}"></span>
      <div class="grow"><strong>${escapeHTML(a.titulo)}</strong><small>${escapeHTML(a.desc)} · ${escapeHTML(a.quando)}</small></div>
      <span class="tag ${a.tipo === "info" ? "inf" : escapeHTML(a.tipo)}">${nomes[a.tipo] || escapeHTML(a.tipo)}</span>
      ${a.lida ? "" : `<button class="mini-btn" data-i="${a.i}">Marcar como lido</button>`}
    </div>`).join("") || `<p class="rot">Nenhum alerta nessa categoria.</p>`;

  document.querySelectorAll(".mini-btn").forEach((b) => {
    b.onclick = () => {
      const alerta = alertas[b.dataset.i];
      sessionStorage.setItem(chaveLida(alerta.id), "1");
      desenhar();
    };
  });
}

async function carregar() {
  try {
    alertas = await apiFetch("/alertas");
    desenhar();
  } catch (e) {
    erroCarregamento = true;
    desenhar();
  }
}

document.querySelectorAll("#filtros button").forEach((b) => {
  b.onclick = () => {
    document.querySelectorAll("#filtros button").forEach((x) => x.classList.remove("on"));
    b.classList.add("on");
    filtro = b.dataset.f;
    desenhar();
  };
});

$("todas").onclick = () => {
  alertas.forEach((a) => sessionStorage.setItem(chaveLida(a.id), "1"));
  desenhar();
};

carregar();
