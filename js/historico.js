// Dados fictícios: apenas para visualização do layout
const $ = (id) => document.getElementById(id);
let grafico;

function gerar(qtd, passoHoras) {
  const agora = Date.now();
  const lista = [];
  for (let i = qtd - 1; i >= 0; i--) {
    const t = new Date(agora - i * passoHoras * 3600 * 1000);
    const hora = t.getHours() + t.getMinutes() / 60;
    const temp = 24 + 6 * Math.sin(((hora - 9) / 24) * 2 * Math.PI) + Math.sin(i * 1.7) * 1.5;
    const umi = 62 - 14 * Math.sin(((hora - 9) / 24) * 2 * Math.PI) + Math.cos(i * 1.3) * 5;
    lista.push({ t, temp: +temp.toFixed(1), umi: Math.round(umi) });
  }
  return lista;
}
const status = (d) => (d.umi > 75 || d.temp > 30 ? "atencao" : "normal");
const media = (v) => v.reduce((a, b) => a + b, 0) / v.length;

function desenhar(dias) {
  const dados = dias === 7 ? gerar(28, 6) : gerar(30, 24);
  const temps = dados.map((d) => d.temp);
  $("h-med").textContent = media(temps).toFixed(1) + "°C";
  $("h-max").textContent = Math.max(...temps).toFixed(1) + "°C";
  $("h-min").textContent = Math.min(...temps).toFixed(1) + "°C";
  $("h-umi").textContent = Math.round(media(dados.map((d) => d.umi))) + "%";

  const fmt = dias === 7
    ? { day: "2-digit", month: "2-digit", hour: "2-digit" }
    : { day: "2-digit", month: "2-digit" };
  if (grafico) grafico.destroy();
  grafico = new Chart($("grafico"), {
    type: "line",
    data: {
      labels: dados.map((d) => d.t.toLocaleString("pt-BR", fmt)),
      datasets: [
        { label: "Temperatura (°C)", data: temps, borderColor: "#7c3aed", backgroundColor: "rgba(124,58,237,0.12)", fill: true, tension: 0.4, pointRadius: 0, borderWidth: 2.5 },
        { label: "Umidade (%)", data: dados.map((d) => d.umi), borderColor: "#fb923c", tension: 0.4, pointRadius: 0, borderWidth: 2.5 },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: { legend: { position: "bottom", labels: { usePointStyle: true, boxWidth: 8 } } },
      scales: {
        x: { grid: { display: false }, ticks: { maxTicksLimit: 8 } },
        y: { grid: { color: "rgba(0,0,0,0.05)" }, border: { display: false } },
      },
    },
  });
}

const leituras = gerar(60, 1).reverse();
function tabela() {
  const f = $("filtro").value;
  const itens = leituras.filter((d) => f === "todos" || status(d) === f).slice(0, 12);
  $("linhas").innerHTML = itens.map((d) => {
    const s = status(d);
    return `<tr>
      <td>${d.t.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</td>
      <td>${d.temp.toFixed(1)}°C</td>
      <td>${d.umi}%</td>
      <td><span class="tag ${s === "atencao" ? "warn" : "ok"}">${s === "atencao" ? "Atenção" : "Normal"}</span></td>
    </tr>`;
  }).join("") || `<tr><td colspan="4">Nenhuma leitura nesse filtro.</td></tr>`;
}

document.querySelectorAll(".seg button").forEach((b) => {
  b.onclick = () => {
    document.querySelectorAll(".seg button").forEach((x) => x.classList.remove("on"));
    b.classList.add("on");
    desenhar(Number(b.dataset.r));
  };
});
$("filtro").onchange = tabela;

desenhar(7);
tabela();