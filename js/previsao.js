const $ = (id) => document.getElementById(id);

function dataLabel(iso) {
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit" }).replace(".", "");
}

async function carregar() {
  try {
    const dados = await apiFetch("/previsao/janela-colheita");
    $("melhor").textContent = dataLabel(dados.melhor_dia);
    const confianca = document.querySelector("#melhor")?.parentElement;
    if (confianca) confianca.innerHTML = `Confiança da estimativa: <strong>${dados.confianca}%</strong> · Melhor dia: <strong id="melhor">${dataLabel(dados.melhor_dia)}</strong>`;

    $("dias").innerHTML = dados.dias.map((d) => `
      <div class="dia ${d.data === dados.melhor_dia ? "best" : ""}">
        <small>${dataLabel(d.data)}</small>
        <div class="ic">${d.icone}</div>
        <strong>${d.temperatura}°C</strong>
        <small>${Math.round(d.umidade)}% umid.</small>
        <span class="tag ok">${d.pontuacao} pts</span>
      </div>`).join("");
  } catch (e) {
    $("melhor").textContent = "--";
    $("dias").innerHTML = `<p class="rot">Não foi possível carregar a estimativa.</p>`;
  }
}

carregar();
