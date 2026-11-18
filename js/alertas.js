const $ = (id) => document.getElementById(id);
const UI = window.UI;

// Atualização automática, igual ao dashboard
const INTERVALO_MS = 30000; // 30 segundos
const LIMITE_HISTORICO = 50;

let alertas = [];
let historico = [];
let filtro = "todos";
let atualizando = false;
let timerAuto = null;
let ultimaAtualizacao = null;
let falhaHistorico = false;
const nomes = { warn: "Atenção", info: "Info", ok: "Resolvido" };

const chaveLida = (id) => `alerta-lido-${id}`;
const estaLido = (a) => sessionStorage.getItem(chaveLida(a.id)) === "1";

// ----- Histórico (vem do servidor) -----
function desenharHistorico() {
  $("hist-nota").textContent = falhaHistorico
    ? "Não foi possível atualizar o histórico agora. Mostrando os últimos dados recebidos."
    : "Alertas emitidos pelo sistema. A marcação de lido é guardada neste navegador.";

  if (!historico.length) {
    UI.vazio($("hist-linhas"), "Nenhum alerta emitido ainda.");
    return;
  }

  $("hist-linhas").innerHTML = historico.map((h) => {
    const lido = sessionStorage.getItem(chaveLida(h.id)) === "1";
    const tipo = h.tipo || "info";
    return `
      <tr>
        <td>${UI.dataHora(h.emitido_em)}</td>
        <td><span class="tag ${tipo === "info" ? "inf" : UI.esc(tipo)}">${nomes[tipo] || UI.esc(tipo)}</span></td>
        <td>${UI.esc(h.titulo)}</td>
        <td>${lido ? "Lido" : "Não lido"}</td>
      </tr>`;
  }).join("");
}

// ----- Lista de alertas atuais -----
function desenhar() {
  const naoLidas = alertas.filter((a) => !estaLido(a)).length;
  const base = naoLidas
    ? `${naoLidas} alertas não lidos.`
    : "Tudo em dia, nenhum alerta pendente.";
  const hora = ultimaAtualizacao ? ` Atualizado às ${ultimaAtualizacao}.` : "";
  $("resumo").textContent = base + hora;

  const itens = alertas
    .map((a, i) => ({ ...a, i, lida: estaLido(a) }))
    .filter((a) => filtro === "todos" || a.tipo === filtro);

  if (!itens.length) {
    UI.vazio($("lista"), "Nenhum alerta nessa categoria.");
  } else {
    $("lista").innerHTML = itens.map((a) => `
      <div class="alerta ${a.lida ? "lida" : ""}">
        <span class="dot ${UI.esc(a.tipo)}"></span>
        <div class="grow"><strong>${UI.esc(a.titulo)}</strong><small>${UI.esc(a.desc)} · ${UI.esc(a.quando)}</small></div>
        <span class="tag ${a.tipo === "info" ? "inf" : UI.esc(a.tipo)}">${nomes[a.tipo] || UI.esc(a.tipo)}</span>
        ${a.lida ? "" : `<button class="mini-btn" data-i="${a.i}">Marcar como lido</button>`}
      </div>`).join("");

    document.querySelectorAll(".mini-btn").forEach((b) => {
      b.onclick = () => {
        sessionStorage.setItem(chaveLida(alertas[b.dataset.i].id), "1");
        desenhar();
      };
    });
  }

  desenharHistorico();
}

// Aviso de falha no resumo, sem apagar a lista que já está na tela
function mostrarFalha() {
  $("resumo").innerHTML = `
    <span class="estado estado-erro">Não foi possível atualizar agora. Mostrando os últimos alertas recebidos.</span>
    <button type="button" class="mini-btn estado-acao">Tentar de novo</button>`;
  $("resumo").querySelector(".estado-acao").addEventListener("click", () => {
    carregar();
    iniciarAuto();
  });
}

async function carregar() {
  if (atualizando) return; // evita dois pedidos ao mesmo tempo
  atualizando = true;
  const temDados = alertas.length > 0;

  // Na primeira carga, mostra "Carregando" na lista
  if (!temDados) UI.carregando($("lista"), "Carregando alertas...");

  // As duas buscas são independentes: falhar uma não apaga a outra
  const [resAtuais, resHist] = await Promise.allSettled([
    apiFetch("/alertas"),
    apiFetch(`/alertas/historico?limite=${LIMITE_HISTORICO}`),
  ]);

  if (resHist.status === "fulfilled") {
    historico = Array.isArray(resHist.value) ? resHist.value : [];
    falhaHistorico = false;
  } else {
    falhaHistorico = true;
  }

  if (resAtuais.status === "fulfilled") {
    alertas = Array.isArray(resAtuais.value) ? resAtuais.value : [];
    ultimaAtualizacao = new Date().toLocaleTimeString("pt-BR");
    desenhar();
  } else if (temDados) {
    mostrarFalha();
    desenharHistorico();
  } else {
    $("resumo").textContent = "Não foi possível carregar os alertas.";
    UI.erro($("lista"), "Verifique a conexão com a API e tente novamente.", () => {
      carregar();
      iniciarAuto();
    });
    desenharHistorico();
  }

  atualizando = false;
}

function iniciarAuto() {
  pararAuto();
  timerAuto = setInterval(carregar, INTERVALO_MS);
}
function pararAuto() {
  if (timerAuto) clearInterval(timerAuto);
  timerAuto = null;
}

document.querySelectorAll("#filtros button").forEach((b) => {
  b.onclick = () => {
    document.querySelectorAll("#filtros button").forEach((x) => x.classList.remove("on"));
    b.classList.add("on");
    filtro = b.dataset.f;
    if (alertas.length) desenhar();
  };
});

$("todas").onclick = () => {
  alertas.forEach((a) => sessionStorage.setItem(chaveLida(a.id), "1"));
  desenhar();
};

// Aba em segundo plano: pausa. Ao voltar, atualiza na hora e retoma.
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    pararAuto();
  } else {
    carregar();
    iniciarAuto();
  }
});

carregar();
iniciarAuto();