const $ = (id) => document.getElementById(id);
let grafico;

const formatarHora = (iso) => new Date(iso).toLocaleString("pt-BR", { hour: "2-digit", minute: "2-digit" });

async function carregarAtual() {
  const atual = await apiFetch("/clima/atual");
  $("k-temp").textContent = atual.temperatura != null ? `${atual.temperatura.toFixed(1)}°C` : "--";
  $("k-umi").textContent = atual.umidade != null ? `${Math.round(atual.umidade)}%` : "--";
  requestAnimationFrame(() => ($("k-barra").style.width = `${atual.umidade ?? 0}%`));
}

function desenharGrafico(leituras) {
  if (grafico) grafico.destroy();
  grafico = new Chart($("grafico"), {
    type: "line",
    data: {
      labels: leituras.map((l) => formatarHora(l.registrado_em)),
      datasets: [
        { label: "Temperatura (°C)", data: leituras.map((l) => l.temperatura), borderColor: "#7c3aed", backgroundColor: "rgba(124,58,237,0.12)", fill: true, tension: 0.4, pointRadius: 0, borderWidth: 2.5 },
        { label: "Umidade (%)", data: leituras.map((l) => l.umidade), borderColor: "#fb923c", tension: 0.4, pointRadius: 0, borderWidth: 2.5 },
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

function desenharTabela(leituras) {
  const ultimas = leituras.slice(-6).reverse();
  $("linhas").innerHTML = ultimas.map((l) => {
    const alta = l.umidade > 75;
    return `<tr>
      <td>${formatarHora(l.registrado_em)}</td>
      <td>${l.temperatura.toFixed(1)}°C</td>
      <td>${Math.round(l.umidade)}%</td>
      <td><span class="tag ${alta ? "warn" : "ok"}">${alta ? "Atenção" : "Normal"}</span></td>
    </tr>`;
  }).join("") || `<tr><td colspan="4">Nenhuma leitura disponível ainda.</td></tr>`;
}

async function atualizarPeriodo(intervalo) {
  const resultados = intervalo === 7 ? 200 : 50;
  const leituras = (await apiFetch(`/clima/historico?resultados=${resultados}`))
    .filter((l) => l.temperatura != null && l.umidade != null);
  desenharGrafico(leituras);
  desenharTabela(leituras);
}

$("data").textContent = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });

document.querySelectorAll(".seg button").forEach((b) => {
  b.onclick = () => {
    document.querySelectorAll(".seg button").forEach((x) => x.classList.remove("on"));
    b.classList.add("on");
    atualizarPeriodo(Number(b.dataset.r));
  };
});

carregarAtual().catch(() => {});
atualizarPeriodo(24).catch(() => { $("linhas").innerHTML = `<tr><td colspan="4">Não foi possível carregar os dados.</td></tr>`; });