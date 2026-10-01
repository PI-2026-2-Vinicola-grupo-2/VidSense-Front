// Dados fictícios: apenas para visualização do layout

const $ = (id) => document.getElementById(id);
let grafico;

// Gera leituras simuladas com uma curva suave de temperatura e umidade
function gerarDados(qtd, passoHoras) {
  const agora = Date.now();
  const lista = [];
  for (let i = qtd - 1; i >= 0; i--) {
    const t = new Date(agora - i * passoHoras * 3600 * 1000);
    const hora = t.getHours() + t.getMinutes() / 60;
    const temp = 24 + 6 * Math.sin(((hora - 9) / 24) * 2 * Math.PI) + Math.sin(i * 1.7) * 0.8;
    const umi = 62 - 14 * Math.sin(((hora - 9) / 24) * 2 * Math.PI) + Math.cos(i * 1.3) * 3;
    lista.push({ t, temp: +temp.toFixed(1), umi: Math.round(umi) });
  }
  return lista;
}

function desenhar(intervalo) {
  const dados = intervalo === 7 ? gerarDados(28, 6) : gerarDados(24, 1);
  const fmt = intervalo === 7
    ? { day: "2-digit", month: "2-digit", hour: "2-digit" }
    : { hour: "2-digit", minute: "2-digit" };
  const rotulos = dados.map((d) => d.t.toLocaleString("pt-BR", fmt));

  if (grafico) grafico.destroy();
  grafico = new Chart($("grafico"), {
    type: "line",
    data: {
      labels: rotulos,
      datasets: [
        { label: "Temperatura (°C)", data: dados.map((d) => d.temp), borderColor: "#7c3aed", backgroundColor: "rgba(124,58,237,0.12)", fill: true, tension: 0.4, pointRadius: 0, borderWidth: 2.5 },
        { label: "Umidade (%)", data: dados.map((d) => d.umi), borderColor: "#fb923c", backgroundColor: "rgba(251,146,60,0.0)", tension: 0.4, pointRadius: 0, borderWidth: 2.5 },
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

// Cabeçalho e indicadores
$("data").textContent = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
const atual = gerarDados(1, 1)[0];
$("k-temp").textContent = `${atual.temp.toFixed(1)}°C`;
$("k-umi").textContent = `${atual.umi}%`;
requestAnimationFrame(() => ($("k-barra").style.width = `${atual.umi}%`));

// Tabela
const leituras = gerarDados(6, 1).reverse();
$("linhas").innerHTML = leituras.map((d) => {
  const alta = d.umi > 75;
  return `<tr>
    <td>${d.t.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</td>
    <td>${d.temp.toFixed(1)}°C</td>
    <td>${d.umi}%</td>
    <td><span class="tag ${alta ? "warn" : "ok"}">${alta ? "Atenção" : "Normal"}</span></td>
  </tr>`;
}).join("");

// Alternância 24 h / 7 dias
document.querySelectorAll(".seg button").forEach((b) => {
  b.onclick = () => {
    document.querySelectorAll(".seg button").forEach((x) => x.classList.remove("on"));
    b.classList.add("on");
    desenhar(Number(b.dataset.r));
  };
});

desenhar(24);