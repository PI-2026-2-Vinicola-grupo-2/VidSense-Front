const $ = (id) => document.getElementById(id);
const UI = window.UI;

function dataLabel(iso) {
  if (!iso) return "--";
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit" }).replace(".", "");
}

function desenharOrigem(dados) {
  const el = $("origem");
  if (dados.simulado) {
    el.innerHTML = `
      <div class="selo-simulado">
        ${UI.selo("simulado")}
        <small class="aviso-texto">${UI.esc(dados.aviso || "Histórico insuficiente.")}</small>
        <small class="aviso-texto">Dias de histórico utilizados: ${Number.isInteger(dados.dias_de_historico) ? dados.dias_de_historico : 0}</small>
      </div>`;
  } else {
    el.innerHTML = UI.selo("api");
  }
}

function desenharDias(dados) {
  const melhorDia = dados.melhor_dia;
  const dias = dados.dias || [];
  if (!dias.length) {
    UI.vazio($("dias"), "Nenhuma previsão disponível.");
    return;
  }
  $("dias").innerHTML = dias.map((d) => `
    <div class="dia ${d.data === melhorDia ? "best" : ""}">
      <small>${UI.esc(dataLabel(d.data))}</small>
      <div class="ic">${UI.esc(d.icone)}</div>
      <strong>${Number(d.temperatura)}°C</strong>
      <small>${Math.round(d.umidade)}% umid.</small>
      <span class="tag ok">${Number(d.pontuacao)} pts</span>
    </div>`).join("");
}

async function carregar() {
  UI.carregando($("dias"), "Carregando previsão...");
  try {
    const dados = await apiFetch("/previsao/janela-colheita");
    const melhorDia = dados.melhor_dia || "--";
    $("janela").textContent = melhorDia;
    $("melhor").textContent = dataLabel(melhorDia);
    $("confianca").textContent = dados.confianca != null ? `${dados.confianca}%` : "--";
    desenharOrigem(dados);
    desenharDias(dados);
  } catch (e) {
    $("janela").textContent = "--";
    $("melhor").textContent = "--";
    $("confianca").textContent = "--";
    $("origem").innerHTML = UI.selo("indisp");
    UI.erro($("dias"), "Não foi possível carregar a previsão de colheita no momento.", carregar);
  }
}

carregar();