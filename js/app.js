const $ = (id) => document.getElementById(id);
let grafico;

// Atualização automática: de quanto em quanto tempo buscar dados novos
const INTERVALO_MS = 30000; // 30 segundos

const sessao = getSessao();
const podeHistorico = sessao?.perfil !== "produtor_exportador";

// O ThingSpeak envia números como texto: converte com segurança
const num = (v) => (v === null || v === undefined || v === "" || isNaN(Number(v)) ? null : Number(v));
const normalizar = (l) => ({
  registrado_em: l.registrado_em,
  temperatura: num(l.temperatura),
  umidade: num(l.umidade),
  umidade_solo: num(l.umidade_solo),
});
let periodoAtual = 24; // período do gráfico (24 = 24 h, 7 = 7 dias)
let atualizando = false;
let timerAuto = null;
let falhouAtual = false;
let leituraDesatualizada = false; // usado pelos alertas para não mostrar "0" sem dado novo
const formatarHora = (iso) => new Date(iso).toLocaleString("pt-BR", { hour: "2-digit", minute: "2-digit" });

// Saudação com o nome de quem está logado
(function () {
  const h = new Date().getHours();
  const saudacao = h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
  const nome = (sessao?.nome || "").split(" ")[0];
  $("saudacao").textContent = `${saudacao}${nome ? ", " + nome : ""} 👋`;
})();

function formatarDataHora(iso) {
  if (!iso) return "--";
  const d = new Date(iso);
  const dia = String(d.getDate()).padStart(2, "0");
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const hora = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${dia}/${mes} ${hora}:${min}`;
}

function formatarTempoDecorrido(minutos) {
  if (minutos < 1) return "menos de 1 minuto";
  if (minutos === 1) return "1 minuto";
  if (minutos < 60) return `${minutos} minutos`;
  const horas = Math.floor(minutos / 60);
  if (horas === 1) return "1 hora";
  if (horas < 24) return `${horas} horas`;
  const dias = Math.floor(horas / 24);
  if (dias === 1) return "1 dia";
  return `${dias} dias`;
}

async function carregarAtual() {
  let dados;
  try {
    dados = await apiFetch("/clima/atual");
  } catch (e) {
    falhouAtual = true;
    throw e;
  }
  falhouAtual = false;
  const atual = normalizar(dados);
  $("k-temp").textContent = atual.temperatura != null ? `${atual.temperatura.toFixed(1)}°C` : "--";
  $("k-umi").textContent = atual.umidade != null ? `${Math.round(atual.umidade)}%` : "--";
  requestAnimationFrame(() => ($("k-barra").style.width = `${atual.umidade ?? 0}%`));

  // Umidade do solo
  const soloEl = $("k-solo");
  const legendaEl = $("k-solo-legenda");
  if (soloEl) {
    if (atual.umidade_solo != null) {
      soloEl.textContent = `${Math.round(atual.umidade_solo)}%`;
      if (legendaEl) legendaEl.textContent = "";
    } else {
      soloEl.textContent = "--";
      if (legendaEl) legendaEl.textContent = "sensor não instalado";
    }
  }

  // Dado desatualizado: calcula uma vez e usa em todos os lugares
  let defasagem = atual.defasagem_minutos;
  if (defasagem == null && atual.registrado_em) {
    defasagem = Math.floor((Date.now() - new Date(atual.registrado_em).getTime()) / 60000);
  }
  leituraDesatualizada = atual.desatualizado ?? (defasagem > 60);

  // Selo da temperatura: indica quando o dado é antigo
  const selo = $("k-temp-selo");
  if (selo) {
    selo.textContent = leituraDesatualizada ? "Dados antigos da API" : "Dados da API";
    selo.className = `tag ${leituraDesatualizada ? "warn" : "inf"}`;
  }

  // Última leitura
  const elLeitura = $("ultima-leitura");
  if (elLeitura && atual.registrado_em) {
    const dataHora = formatarDataHora(atual.registrado_em);
    if (leituraDesatualizada) {
      elLeitura.innerHTML = `
        <div class="aviso-stale">
          <span class="dot warn"></span>
          <span>Sem dados recentes — última leitura há ${escapeHTML(formatarTempoDecorrido(defasagem))} (${escapeHTML(dataHora)})</span>
        </div>`;
    } else {
      elLeitura.innerHTML = `<span class="rot">Última leitura: ${escapeHTML(dataHora)}</span>`;
    }
  }

  return atual;
}

async function carregarAlertas(desatualizado) {
  const lista = $("alertas-recentes");

  // Sem leitura recente não há o que avaliar: não mostra "0 alertas"
  if (desatualizado) {
    $("k-alertas").textContent = "--";
    $("k-alertas-status").textContent = "Sem dados para avaliar";
    $("k-alertas-status").className = "tag warn";
    lista.innerHTML = `<li><span class="rot">Sem leitura recente para gerar alertas.</span></li>`;
    return;
  }

  try {
    const alertas = await apiFetch("/alertas");
    const avisos = Array.isArray(alertas) ? alertas : [];
    const atencoes = avisos.filter((alerta) => alerta.tipo === "warn").length;
    $("k-alertas").textContent = String(atencoes);
    $("k-alertas-status").textContent = atencoes
      ? `${atencoes} requer atenção`
      : "Nenhum alerta de atenção";
    $("k-alertas-status").className = `tag ${atencoes ? "warn" : "ok"}`;
    lista.innerHTML = avisos.slice(0, 3).map((alerta) => `
      <li>
        <span class="dot ${escapeHTML(alerta.tipo)}"></span>
        <div><strong>${escapeHTML(alerta.titulo)}</strong>
        <small>${escapeHTML(alerta.desc)} · ${escapeHTML(alerta.quando)}</small></div>
      </li>`).join("") || `<li><span class="rot">Nenhum alerta retornado pela API.</span></li>`;
  } catch (e) {
    $("k-alertas").textContent = "--";
    $("k-alertas-status").textContent = "Indisponível";
    $("k-alertas-status").className = "tag inf";
    lista.innerHTML = `<li><span class="rot">Não foi possível carregar os alertas.</span></li>`;
  }
}

async function carregarPrevisaoResumo() {
  try {
    const previsao = await apiFetch("/previsao/janela-colheita");
    $("k-janela").textContent = previsao?.melhor_dia || "--";
    $("k-janela-status").textContent = previsao?.simulado ? "Estimativa simulada" : "Estimativa";
    $("k-janela-status").className = `tag ${previsao?.simulado ? "warn" : "ok"}`;
  } catch (e) {
    $("k-janela").textContent = "--";
    $("k-janela-status").textContent = "Indisponível";
    $("k-janela-status").className = "tag inf";
  }
}

function desenharGrafico(leituras) {
  const datasets = [
    {
      label: "Temperatura (°C)",
      data: leituras.map((l) => l.temperatura),
      borderColor: "#7c3aed",
      backgroundColor: "rgba(124,58,237,0.12)",
      fill: true,
      tension: 0.4,
      pointRadius: 0,
      borderWidth: 2.5,
    },
    {
      label: "Umidade (%)",
      data: leituras.map((l) => l.umidade),
      borderColor: "#fb923c",
      tension: 0.4,
      pointRadius: 0,
      borderWidth: 2.5,
    },
  ];

  // Série de solo só aparece se houver algum valor
  const temSolo = leituras.some((l) => l.umidade_solo != null);
  if (temSolo) {
    datasets.push({
      label: "Umidade do solo (%)",
      data: leituras.map((l) => l.umidade_solo),
      borderColor: "#16a34a",
      tension: 0.4,
      pointRadius: 0,
      borderWidth: 2.5,
    });
  }

  // Se o gráfico já existe com as mesmas séries, só troca os dados (sem piscar)
  if (grafico && grafico.data.datasets.length === datasets.length) {
    grafico.data.labels = leituras.map((l) => formatarHora(l.registrado_em));
    datasets.forEach((d, i) => { grafico.data.datasets[i].data = d.data; });
    grafico.update("none");
    return;
  }
  if (grafico) grafico.destroy();

  grafico = new Chart($("grafico"), {
    type: "line",
    data: {
      labels: leituras.map((l) => formatarHora(l.registrado_em)),
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

function desenharTabela(leituras) {
  const ultimas = leituras.slice(-6).reverse();
  $("linhas").innerHTML = ultimas.map((l) => {
    const alta = l.umidade > 75;
    return `<tr>
      <td>${escapeHTML(formatarHora(l.registrado_em))}</td>
      <td>${l.temperatura != null ? l.temperatura.toFixed(1) + "°C" : "--"}</td>
      <td>${l.umidade != null ? Math.round(l.umidade) + "%" : "--"}</td>
      <td><span class="tag ${alta ? "warn" : "ok"}">${alta ? "Atenção" : "Normal"}</span></td>
    </tr>`;
  }).join("") || `<tr><td colspan="4">Nenhuma leitura disponível ainda.</td></tr>`;
}

async function atualizarPeriodo(intervalo) {
  periodoAtual = intervalo;
  const horas = (intervalo === 7 || intervalo === 168) ? 168 : 24;
  const leituras = (await apiFetch(`/clima/historico?horas=${horas}`)).map(normalizar)
    .filter((l) => l.temperatura != null && l.umidade != null);
  desenharGrafico(leituras);
  desenharTabela(leituras);
}

const tabelaVazia = () => $("linhas").children.length === 0;

// Busca tudo de novo (leitura atual, alertas, previsão e gráfico)
async function atualizarTudo() {
  if (atualizando) return; // evita dois pedidos ao mesmo tempo
  atualizando = true;
  const botao = $("btn-atualizar");
  botao.disabled = true;
  botao.classList.add("girando");

  // Alertas esperam a leitura atual, para saber se ela está desatualizada
  const tarefaAtual = carregarAtual()
    .then((atual) => { if (!podeHistorico && atual.temperatura != null) desenharTabela([atual]); })
    .catch(() => {
      if (!podeHistorico && tabelaVazia()) {
        $("linhas").innerHTML = `<tr><td colspan="4">Não foi possível carregar os dados.</td></tr>`;
      }
    });

  const tarefas = [
    tarefaAtual,
    tarefaAtual.then(() => carregarAlertas(leituraDesatualizada)),
    carregarPrevisaoResumo(),
  ];
  if (podeHistorico) {
    tarefas.push(
      atualizarPeriodo(periodoAtual).catch(() => {
        if (tabelaVazia()) {
          $("linhas").innerHTML = `<tr><td colspan="4">Não foi possível carregar os dados.</td></tr>`;
        }
      })
    );
  }

  await Promise.all(tarefas);

  const hora = new Date().toLocaleTimeString("pt-BR");
  $("atualizado-em").textContent = falhouAtual
    ? `Falha ao atualizar às ${hora}. Tentando de novo em instantes.`
    : `Atualizado às ${hora}`;

  atualizando = false;
  botao.disabled = false;
  botao.classList.remove("girando");
}

function iniciarAuto() {
  pararAuto();
  timerAuto = setInterval(atualizarTudo, INTERVALO_MS);
}
function pararAuto() {
  if (timerAuto) clearInterval(timerAuto);
  timerAuto = null;
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
} else {
  // Produtor não tem acesso ao histórico na API: mostra só a leitura atual
  document.querySelector(".card-head .seg").hidden = true;
  $("grafico").parentElement.innerHTML =
    `<p class="rot">O gráfico de histórico está disponível para os perfis Analista de dados e Administrador.</p>`;
}

// Botão "Atualizar": busca agora e reinicia a contagem dos 30 s
$("btn-atualizar").addEventListener("click", () => {
  atualizarTudo();
  iniciarAuto();
});

// Aba em segundo plano: pausa. Ao voltar, atualiza na hora e retoma.
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    pararAuto();
  } else {
    atualizarTudo();
    iniciarAuto();
  }
});

atualizarTudo();
iniciarAuto();