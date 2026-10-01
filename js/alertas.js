// Alertas fictícios
const alertas = [
  { tipo: "warn", titulo: "Umidade acima de 80%", desc: "Risco de fungos no talhão A.", quando: "há 2 h", lida: false },
  { tipo: "warn", titulo: "Temperatura acima de 32°C", desc: "Calor intenso previsto para a tarde.", quando: "há 4 h", lida: false },
  { tipo: "info", titulo: "Previsão atualizada", desc: "Colheita sugerida para 12/03.", quando: "ontem", lida: false },
  { tipo: "ok", titulo: "Temperatura estável", desc: "Voltou para a faixa ideal.", quando: "ontem", lida: true },
  { tipo: "info", titulo: "Sensor sincronizado", desc: "Leituras do ESP32 recebidas com sucesso.", quando: "2 dias", lida: true },
  { tipo: "ok", titulo: "Umidade normalizada", desc: "Abaixo do limite de 75%.", quando: "3 dias", lida: true },
];
const nomes = { warn: "Atenção", info: "Info", ok: "Resolvido" };
let filtro = "todos";
const $ = (id) => document.getElementById(id);

function desenhar() {
  const naoLidas = alertas.filter((a) => !a.lida).length;
  $("resumo").textContent = naoLidas ? `${naoLidas} alertas não lidos.` : "Tudo em dia, nenhum alerta pendente.";

  const itens = alertas
    .map((a, i) => ({ ...a, i }))
    .filter((a) => filtro === "todos" || a.tipo === filtro);

  $("lista").innerHTML = itens.map((a) => `
    <div class="alerta ${a.lida ? "lida" : ""}">
      <span class="dot ${a.tipo}"></span>
      <div class="grow"><strong>${a.titulo}</strong><small>${a.desc} · ${a.quando}</small></div>
      <span class="tag ${a.tipo === "info" ? "inf" : a.tipo}">${nomes[a.tipo]}</span>
      ${a.lida ? "" : `<button class="mini-btn" data-i="${a.i}">Marcar como lido</button>`}
    </div>`).join("") || `<p class="rot">Nenhum alerta nessa categoria.</p>`;

  document.querySelectorAll(".mini-btn").forEach((b) => {
    b.onclick = () => { alertas[b.dataset.i].lida = true; desenhar(); };
  });
}

document.querySelectorAll("#filtros button").forEach((b) => {
  b.onclick = () => {
    document.querySelectorAll("#filtros button").forEach((x) => x.classList.remove("on"));
    b.classList.add("on");
    filtro = b.dataset.f;
    desenhar();
  };
});
$("todas").onclick = () => { alertas.forEach((a) => (a.lida = true)); desenhar(); };

desenhar();