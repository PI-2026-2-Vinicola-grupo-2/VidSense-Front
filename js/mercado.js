const $ = (id) => document.getElementById(id);

/* =====================================================================
   FONTE DOS DADOS
   Enquanto a API de mercado/logística não existe, a página usa dados de
   exemplo. Quando os endpoints estiverem prontos:
     1) ajuste os caminhos abaixo;
     2) troque USAR_DADOS_EXEMPLO para false.
   Se a API falhar, a página volta sozinha para os dados de exemplo.

   Formato esperado de cada resposta:
   ENDPOINT_MERCADO  -> {
     preco_atual: 11.8,            // R$/kg
     variacao_pct: 2.4,            // variação frente ao dia anterior
     demanda_indice: 78,           // 0 a 100
     serie_precos: [{ data: "2026-10-01", preco: 11.5 }, ...],
     demanda_por_destino: [{ destino: "Europa", toneladas: 420 }, ...]
   }
   ENDPOINT_LOGISTICA -> {
     tempo_medio_dias: 14,
     frete_medio_kg: 1.35,         // R$/kg
     carga_transito_t: 96,         // toneladas
     entregas_no_prazo_pct: 92,
     frete_por_modal: [{ modal: "Marítimo", custo_kg: 0.9 }, ...],
     embarques: [{ destino, modal, carga_t, previsao: "2026-11-05", status }]
       // status: "Em trânsito" | "Entregue" | "Atrasado"
   }
   ===================================================================== */
const USAR_DADOS_EXEMPLO = true;
const ENDPOINT_MERCADO = "/mercado/resumo";
const ENDPOINT_LOGISTICA = "/logistica/resumo";

// ---------- Dados de exemplo (valores fictícios, só para o layout) ----------
function isoDia(deslocamento) {
  const d = new Date();
  d.setDate(d.getDate() + deslocamento);
  return d.toISOString().slice(0, 10);
}

function gerarExemplo() {
  const serie = [];
  for (let i = 89; i >= 0; i--) {
    const preco = 11 + 1.3 * Math.sin((90 - i) / 11) + 0.4 * Math.sin((90 - i) / 3.1);
    serie.push({ data: isoDia(-i), preco: +preco.toFixed(2) });
  }
  const atual = serie[serie.length - 1].preco;
  const anterior = serie[serie.length - 2].preco;

  return {
    mercado: {
      preco_atual: atual,
      variacao_pct: +(((atual - anterior) / anterior) * 100).toFixed(1),
      demanda_indice: 78,
      serie_precos: serie,
      demanda_por_destino: [
        { destino: "Europa", toneladas: 420 },
        { destino: "Estados Unidos", toneladas: 310 },
        { destino: "Reino Unido", toneladas: 180 },
        { destino: "Mercado interno", toneladas: 260 },
      ],
    },
    logistica: {
      tempo_medio_dias: 14,
      frete_medio_kg: 1.35,
      carga_transito_t: 96,
      entregas_no_prazo_pct: 92,
      frete_por_modal: [
        { modal: "Rodoviário", custo_kg: 0.45 },
        { modal: "Marítimo", custo_kg: 0.9 },
        { modal: "Aéreo", custo_kg: 3.8 },
      ],
      embarques: [
        { destino: "Roterdã (Europa)", modal: "Marítimo", carga_t: 28, previsao: isoDia(6), status: "Em trânsito" },
        { destino: "Filadélfia (EUA)", modal: "Marítimo", carga_t: 24, previsao: isoDia(3), status: "Atrasado" },
        { destino: "Londres (Reino Unido)", modal: "Aéreo", carga_t: 6, previsao: isoDia(1), status: "Em trânsito" },
        { destino: "São Paulo (Brasil)", modal: "Rodoviário", carga_t: 38, previsao: isoDia(-2), status: "Entregue" },
        { destino: "Roterdã (Europa)", modal: "Marítimo", carga_t: 30, previsao: isoDia(-9), status: "Entregue" },
      ],
    },
  };
}

async function carregarDados() {
  if (!USAR_DADOS_EXEMPLO) {
    try {
      const [mercado, logistica] = await Promise.all([
        apiFetch(ENDPOINT_MERCADO),
        apiFetch(ENDPOINT_LOGISTICA),
      ]);
      if (mercado && logistica) return { mercado, logistica, exemplo: false };
    } catch (e) {
      console.warn("API de mercado/logística indisponível, usando dados de exemplo:", e.message);
    }
  }
  return { ...gerarExemplo(), exemplo: true };
}

// ---------- Formatação ----------
const moeda = (n) => Number(n).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const inteiro = (n) => Math.round(Number(n)).toLocaleString("pt-BR");
const dataCurta = (iso) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });

const CORES = { roxo: "#7c3aed", laranja: "#fb923c", verde: "#16a34a", rosa: "#ec4899" };
const graficos = {};

function criarGrafico(id, config) {
  if (graficos[id]) graficos[id].destroy();
  graficos[id] = new Chart($(id), config);
}

const eixos = (horizontal) => ({
  x: { grid: { display: horizontal }, border: { display: false } },
  y: { grid: { display: !horizontal, color: "rgba(0,0,0,0.05)" }, border: { display: false } },
});

// ---------- Mercado ----------
function desenharMercado(m) {
  const serie = m.serie_precos || [];
  const precos = serie.map((p) => Number(p.preco));
  const medio = precos.length ? precos.reduce((a, b) => a + b, 0) / precos.length : null;

  $("m-preco").textContent = m.preco_atual != null ? moeda(m.preco_atual) : "--";

  const v = Number(m.variacao_pct);
  const varEl = $("m-var");
  if (Number.isFinite(v)) {
    varEl.textContent = `${v >= 0 ? "▲" : "▼"} ${Math.abs(v).toLocaleString("pt-BR")}% no dia`;
    varEl.className = `tag ${v >= 0 ? "ok" : "warn"}`;
  } else {
    varEl.textContent = "--";
  }

  $("m-medio").textContent = medio != null ? moeda(medio) : "--";
  $("m-faixa").textContent = precos.length
    ? `mín. ${moeda(Math.min(...precos))} · máx. ${moeda(Math.max(...precos))}`
    : "--";

  const demanda = Number(m.demanda_indice);
  $("m-demanda").textContent = Number.isFinite(demanda) ? `${inteiro(demanda)} / 100` : "--";
  requestAnimationFrame(() => ($("m-barra").style.width = `${Number.isFinite(demanda) ? demanda : 0}%`));

  const destinos = [...(m.demanda_por_destino || [])].sort((a, b) => b.toneladas - a.toneladas);
  const total = destinos.reduce((s, d) => s + Number(d.toneladas), 0);
  if (destinos.length) {
    $("m-destino").textContent = destinos[0].destino;
    $("m-destino-t").textContent = `${inteiro(destinos[0].toneladas)} t (${Math.round((destinos[0].toneladas / total) * 100)}% da demanda)`;
  }

  desenharPreco(serie, 30);
  document.querySelectorAll("#periodo button").forEach((b) => {
    b.onclick = () => {
      document.querySelectorAll("#periodo button").forEach((x) => x.classList.remove("on"));
      b.classList.add("on");
      desenharPreco(serie, Number(b.dataset.d));
    };
  });

  criarGrafico("g-demanda", {
    type: "bar",
    data: {
      labels: destinos.map((d) => d.destino),
      datasets: [{ data: destinos.map((d) => d.toneladas), backgroundColor: [CORES.roxo, CORES.rosa, CORES.laranja, CORES.verde], borderRadius: 8 }],
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => `${inteiro(c.parsed.x)} t` } } },
      scales: eixos(true),
    },
  });
}

function desenharPreco(serie, dias) {
  const recorte = serie.slice(-dias);
  criarGrafico("g-preco", {
    type: "line",
    data: {
      labels: recorte.map((p) => dataCurta(p.data)),
      datasets: [{
        label: "Preço (R$/kg)",
        data: recorte.map((p) => Number(p.preco)),
        borderColor: CORES.roxo,
        backgroundColor: "rgba(124,58,237,0.12)",
        fill: true, tension: 0.4, pointRadius: 0, borderWidth: 2.5,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => moeda(c.parsed.y) } } },
      scales: { x: { ...eixos(false).x, ticks: { maxTicksLimit: 8 } }, y: eixos(false).y },
    },
  });
}

// ---------- Logística ----------
const CLASSE_STATUS = { "Entregue": "ok", "Em trânsito": "inf", "Atrasado": "bad" };

function desenharLogistica(l) {
  $("l-tempo").textContent = l.tempo_medio_dias != null ? `${inteiro(l.tempo_medio_dias)} dias` : "--";
  $("l-frete").textContent = l.frete_medio_kg != null ? moeda(l.frete_medio_kg) : "--";
  $("l-transito").textContent = l.carga_transito_t != null ? `${inteiro(l.carga_transito_t)} t` : "--";

  const embarques = l.embarques || [];
  const emTransito = embarques.filter((e) => e.status === "Em trânsito").length;
  $("l-embarques").textContent = `${emTransito} embarque${emTransito === 1 ? "" : "s"} a caminho`;

  const prazo = Number(l.entregas_no_prazo_pct);
  $("l-prazo").textContent = Number.isFinite(prazo) ? `${inteiro(prazo)}%` : "--";
  requestAnimationFrame(() => ($("l-barra").style.width = `${Number.isFinite(prazo) ? prazo : 0}%`));

  $("l-linhas").innerHTML = embarques.map((e) => `
    <tr>
      <td>${escapeHTML(e.destino)}</td>
      <td>${escapeHTML(e.modal)}</td>
      <td>${inteiro(e.carga_t)} t</td>
      <td>${dataCurta(e.previsao)}</td>
      <td><span class="tag ${CLASSE_STATUS[e.status] || "inf"}">${escapeHTML(e.status)}</span></td>
    </tr>`).join("") || `<tr><td colspan="5">Nenhum embarque registrado.</td></tr>`;

  const modais = l.frete_por_modal || [];
  criarGrafico("g-frete", {
    type: "bar",
    data: {
      labels: modais.map((m) => m.modal),
      datasets: [{ data: modais.map((m) => m.custo_kg), backgroundColor: [CORES.verde, CORES.roxo, CORES.laranja], borderRadius: 8 }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => `${moeda(c.parsed.y)}/kg` } } },
      scales: eixos(false),
    },
  });
}

// ---------- Início ----------
carregarDados().then(({ mercado, logistica, exemplo }) => {
  $("selo-fonte").hidden = !exemplo;
  desenharMercado(mercado);
  desenharLogistica(logistica);
});