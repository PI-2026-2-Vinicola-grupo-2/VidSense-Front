const $ = (id) => document.getElementById(id);
let grafico;

const sessao = getSessao();
const podeHistorico = sessao?.perfil !== "produtor_exportador";

// O ThingSpeak envia números como texto: converte com segurança
const num = (v) => (v === null || v === undefined || v === "" || isNaN(Number(v)) ? null : Number(v));
const normalizar = (l) => ({ registrado_em: l.registrado_em, temperatura: num(l.temperatura), umidade: num(l.umidade) });
const formatarHora = (iso) => new Date(iso).toLocaleString("pt-BR", { hour: "2-digit", minute: "2-digit" });

// Saudação com o nome de quem está logado
(function () {
  const h = new Date().getHours();
  const saudacao = h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
  const nome = (sessao?.nome || "").split(" ")[0];
  $("saudacao").textContent = `${saudacao}${nome ? ", " + nome : ""} 👋`;
})();

async function carregarAtual() {
  const atual = normalizar(await apiFetch("/clima/atual"));
  $("k-temp").textContent = atual.temperatura != null ? `${atual.temperatura.toFixed(1)}°C` : "--";
  $("k-umi").textContent = atual.umidade != null ? `${Math.round(atual.umidade)}%` : "--";
  requestAnimationFrame(() => ($("k-barra").style.width = `${atual.umidade ?? 0}%`));
  return atual;
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
    .map(normalizar)
    .filter((l) => l.temperatura != null && l.umidade != null);
  desenharGrafico(leituras);
  desenharTabela(leituras);
}

$("data").textContent = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });

if (podeHistorico) {
  document.querySelectorAll(".seg button").forEach((b) => {
    b.onclick = () => {
      document.querySelectorAll(".seg button").forEach((x) => x.classList.remove("on"));
      b.classList.add("on");
      atualizarPeriodo(Number(b.dataset.r)).catch(() => {});
    };
  });
  atualizarPeriodo(24).catch(() => {
    $("linhas").innerHTML = `<tr><td colspan="4">Não foi possível carregar os dados.</td></tr>`;
  });
} else {
  // Produtor não tem acesso ao histórico na API: mostra só a leitura atual
  document.querySelector(".card-head .seg").hidden = true;
  $("grafico").parentElement.innerHTML =
    `<p class="rot">O gráfico de histórico está disponível para os perfis Analista de dados e Administrador.</p>`;
}

carregarAtual()
  .then((atual) => { if (!podeHistorico && atual.temperatura != null) desenharTabela([atual]); })
  .catch(() => {
    if (!podeHistorico) $("linhas").innerHTML = `<tr><td colspan="4">Não foi possível carregar os dados.</td></tr>`;
  });