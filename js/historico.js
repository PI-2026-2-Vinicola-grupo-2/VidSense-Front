const $ = (id) => document.getElementById(id);
const UI = window.UI;
let grafico;
let leiturasAtuais = [];
let diasAtuais = 7;

const formatarData = (iso, dias) =>
  new Date(iso).toLocaleString(
    "pt-BR",
    dias === 7
      ? { day: "2-digit", month: "2-digit", hour: "2-digit" }
      : { day: "2-digit", month: "2-digit" }
  );
const status = (l) => (l.umidade > 75 || l.temperatura > 30 ? "atencao" : "normal");
const media = (v) => v.reduce((a, b) => a + b, 0) / v.length;

function desenharResumo(dados) {
  const temps = dados.map((d) => d.temperatura).filter((t) => t != null);
  $("h-med").textContent = temps.length ? media(temps).toFixed(1) + "°C" : "--";
  $("h-max").textContent = temps.length ? Math.max(...temps).toFixed(1) + "°C" : "--";
  $("h-min").textContent = temps.length ? Math.min(...temps).toFixed(1) + "°C" : "--";
  const umids = dados.map((d) => d.umidade).filter((u) => u != null);
  $("h-umi").textContent = umids.length ? Math.round(media(umids)) + "%" : "--";
}

function desenharGrafico(dados, dias) {
  if (grafico) grafico.destroy();

  const datasets = [
    {
      label: "Temperatura (°C)",
      data: dados.map((d) => d.temperatura),
      borderColor: "#7c3aed",
      backgroundColor: "rgba(124,58,237,0.12)",
      fill: true,
      tension: 0.4,
      pointRadius: 0,
      borderWidth: 2.5,
    },
    {
      label: "Umidade (%)",
      data: dados.map((d) => d.umidade),
      borderColor: "#fb923c",
      tension: 0.4,
      pointRadius: 0,
      borderWidth: 2.5,
    },
  ];

  // Série de solo só aparece se houver algum valor
  const temSolo = dados.some((d) => d.umidade_solo != null);
  if (temSolo) {
    datasets.push({
      label: "Umidade do solo (%)",
      data: dados.map((d) => d.umidade_solo),
      borderColor: "#16a34a",
      tension: 0.4,
      pointRadius: 0,
      borderWidth: 2.5,
    });
  }

  grafico = new Chart($("grafico"), {
    type: "line",
    data: {
      labels: dados.map((d) => formatarData(d.registrado_em, dias)),
      datasets,
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

  if (!itens.length) {
    UI.vazio($("linhas"), leiturasAtuais.length ? "Nenhuma leitura nesse filtro." : "Nenhuma leitura no período.");
    return;
  }

  $("linhas").innerHTML = itens.map((d) => {
    const s = status(d);
    return `<tr>
      <td>${UI.esc(formatarData(d.registrado_em, 7))}</td>
      <td>${d.temperatura != null ? d.temperatura.toFixed(1) + "°C" : "--"}</td>
      <td>${d.umidade != null ? Math.round(d.umidade) + "%" : "--"}</td>
      <td><span class="tag ${s === "atencao" ? "warn" : "ok"}">${s === "atencao" ? "Atenção" : "Normal"}</span></td>
    </tr>`;
  }).join("");
}

async function carregar(dias) {
  diasAtuais = dias;
  // Horas reais: 7 dias = 168 h, 30 dias = 720 h
  const horas = dias === 30 ? 720 : dias === 7 ? 168 : dias * 24;

  UI.carregando($("linhas"), "Carregando leituras...");
  try {
    const dados = await apiFetch(`/clima/historico?horas=${horas}`);
    leiturasAtuais = dados
      .map((d) => ({
        registrado_em: d.registrado_em,
        temperatura: d.temperatura == null || d.temperatura === "" ? null : Number(d.temperatura),
        umidade: d.umidade == null || d.umidade === "" ? null : Number(d.umidade),
        umidade_solo: d.umidade_solo == null || d.umidade_solo === "" ? null : Number(d.umidade_solo),
      }))
      .filter((d) => d.temperatura != null && d.umidade != null && !isNaN(d.temperatura) && !isNaN(d.umidade));

    $("origem").innerHTML = UI.selo("api");
    desenharResumo(leiturasAtuais);
    desenharGrafico(leiturasAtuais, dias);
    tabela();
  } catch (err) {
    const semPermissao = /permiss|403/i.test(err?.message || "");
    if (semPermissao) {
      $("origem").innerHTML = UI.selo("indisp");
      UI.erro(
        $("linhas"),
        "Seu perfil não tem permissão para ver o histórico. Entre com uma conta de Analista de dados ou Administrador."
      );
    } else {
      $("origem").innerHTML = UI.selo("indisp");
      UI.erro($("linhas"), "Não foi possível carregar os dados.", () => carregar(diasAtuais));
    }
  }
}

document.querySelectorAll(".seg button").forEach((b) => {
  b.onclick = () => {
    document.querySelectorAll(".seg button").forEach((x) => x.classList.remove("on"));
    b.classList.add("on");
    carregar(Number(b.dataset.r));
  };
});
$("filtro").onchange = tabela;

carregar(7);