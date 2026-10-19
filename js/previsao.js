const $ = (id) => document.getElementById(id);

function dataLabel(iso) {
  if (!iso) return "--";
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit" }).replace(".", "");
}

async function carregar() {
  try {
    const dados = await apiFetch("/previsao/janela-colheita");
    const melhorDia = dados.melhor_dia || "--";
    $("janela").textContent = melhorDia;
    $("melhor").textContent = dataLabel(melhorDia);
    $("confianca").textContent = dados.confianca != null ? `${dados.confianca}%` : "--";

    const avisoEl = $("aviso-simulado");
    if (avisoEl) {
      avisoEl.innerHTML = dados.simulado
        ? `<div class="selo-simulado">
            <span class="tag warn">Estimativa simulada</span>
            <small class="aviso-texto">${escapeHTML(dados.aviso || "Histórico insuficiente.")}</small>
            <small class="aviso-texto">Dias de histórico utilizados: ${Number.isInteger(dados.dias_de_historico) ? dados.dias_de_historico : 0}</small>
          </div>`
        : "";
    }

    $("dias").innerHTML = (dados.dias || []).map((d) => `
      <div class="dia ${d.data === melhorDia ? "best" : ""}">
        <small>${escapeHTML(dataLabel(d.data))}</small>
        <div class="ic">${escapeHTML(d.icone)}</div>
        <strong>${d.temperatura}°C</strong>
        <small>${Math.round(d.umidade)}% umid.</small>
        <span class="tag ok">${d.pontuacao} pts</span>
      </div>`).join("") || `<p class="rot">Nenhuma previsão disponível.</p>`;
  } catch (e) {
    $("janela").textContent = "--";
    $("melhor").textContent = "--";
    $("confianca").textContent = "--";
    $("dias").innerHTML = `<p class="rot">Não foi possível carregar a previsão de colheita no momento.</p>`;
  }
}

carregar();
