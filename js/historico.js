const $ = (id) => document.getElementById(id);
let grafico;
let leiturasAtuais = [];

const formatarData = (iso, dias) => new Date(iso).toLocaleString("pt-BR",
  dias === 7 ? { day: "2-digit", month: "2-digit", hour: "2-digit" } : { day: "2-digit", month: "2-digit" });
const status = (l) => (l.umidade > 75 || l.temperatura > 30 ? "atencao" : "normal");
const media = (v) => v.reduce((a, b) => a + b, 0) / v.length;

function desenharResumo(dados) {
  const temps = dados.map((d) => d.temperatura);
  $("h-med").textContent = temps.length ? media(temps).toFixed(1) + "°C" : "--";
  $("h-max").textContent = temps.length ? Math.max(...temps).toFixed(1) + "°C" : "--";
  $("h-min").textContent = temps.length ? Math.min(...temps).toFixed(1) + "°C" : "--";
  $("h-umi").textContent = dados.length ? Math.round(media(dados.map((d) => d.umidade))) + "%" : "--";
}

function desenharGrafico(dados, dias) {
  if (grafico) grafico.destroy();
  grafico = new Chart($("grafico"), {
    type: "line",
    data: {
      labels: dados.map((d) => formatarData(d.registrado_em, dias)),
      datasets: [
        { label: "Temperatura (°C)", data: dados.map((d) => d.temperatura), borderColor: "#7c3aed", backgroundColor: "rgba(124,58,237,0.12)", fill: true, tension: 0.4, pointRadius: 0, borderWidth: 2.5 },
        { label: "Umidade (%)", data: dados.map((d) => d.umidade), borderColor: "#fb923c", tension: 0.4, pointRadius: 0, borderWidth: 2.5 },
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

function tabela() {
  const f = $("filtro").value;
  const itens = [...leiturasAtuais].reverse().filter((d) => f === "todos" || status(d) === f).slice(0, 12);
  $("linhas").innerHTML = itens.map((d) => {
    const s = status(d);
    return `<tr>
      <td>${formatarData(d.registrado_em, 7)}</td>
      <td>${d.temperatura.toFixed(1)}°C</td>
      <td>${Math.round(d.umidade)}%</td>
      <td><span class="tag ${s === "atencao" ? "warn" : "ok"}">${s === "atencao" ? "Atenção" : "Normal"}</span></td>
    </tr>`;
  }).join("") || `<tr><td colspan="4">Nenhuma leitura nesse filtro.</td></tr>`;
}

async function carregar(dias) {
  const resultados = dias === 7 ? 200 : 50;
  const dados = await apiFetch(`/clima/historico?resultados=${resultados}`);
  leiturasAtuais = dados.filter((d) => d.temperatura != null && d.umidade != null);
  desenharResumo(leiturasAtuais);
  desenharGrafico(leiturasAtuais, dias);
  tabela();
}

document.querySelectorAll(".seg button").forEach((b) => {
  b.onclick = () => {
    document.querySelectorAll(".seg button").forEach((x) => x.classList.remove("on"));
    b.classList.add("on");
    carregar(Number(b.dataset.r));
  };
});
$("filtro").onchange = tabela;

carregar(7).catch(() => { $("linhas").innerHTML = `<tr><td colspan="4">Não foi possível carregar os dados.</td></tr>`; });