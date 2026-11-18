// Padrões visuais compartilhados por todas as telas.
// Uso: depois de js/api.js e antes do script da própria página.
(function () {
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // Selo que indica de onde vêm os dados de uma tela ou card
  const ORIGENS = {
    api:      { texto: "Dados da API",         classe: "ok" },
    exemplo:  { texto: "Dados de exemplo",     classe: "warn" },
    simulado: { texto: "Estimativa simulada",  classe: "warn" },
    indisp:   { texto: "Indisponível",         classe: "inf" },
  };
  function selo(origem) {
    const o = ORIGENS[origem] || ORIGENS.indisp;
    return `<span class="tag ${o.classe} selo-origem">${esc(o.texto)}</span>`;
  }

  // Quantidade de colunas da tabela a que o tbody pertence
  function colunas(tbody) {
    const tabela = tbody.closest("table");
    const th = tabela ? tabela.querySelectorAll("thead th").length : 1;
    return th || 1;
  }

  // Mensagem de carregamento dentro de um elemento (tabela, lista ou card)
  function carregando(el, texto = "Carregando...") {
    if (!el) return;
    el.innerHTML = el.tagName === "TBODY"
      ? `<tr><td colspan="${colunas(el)}" class="estado rot">${esc(texto)}</td></tr>`
      : `<p class="estado rot">${esc(texto)}</p>`;
  }

  // Mensagem de erro, com botão opcional para tentar de novo
  function erro(el, mensagem, aoTentar) {
    if (!el) return;
    const botao = aoTentar
      ? ` <button type="button" class="mini-btn estado-acao">Tentar de novo</button>`
      : "";
    const html = `<span class="estado estado-erro">${esc(mensagem)}${botao}</span>`;
    el.innerHTML = el.tagName === "TBODY"
      ? `<tr><td colspan="${colunas(el)}">${html}</td></tr>`
      : `<p>${html}</p>`;
    if (aoTentar) {
      const b = el.querySelector(".estado-acao");
      if (b) b.addEventListener("click", aoTentar);
    }
  }

  // Lista vazia (sem dados para mostrar, mas sem erro)
  function vazio(el, texto = "Nenhum dado disponível ainda.") {
    if (!el) return;
    el.innerHTML = el.tagName === "TBODY"
      ? `<tr><td colspan="${colunas(el)}" class="estado rot">${esc(texto)}</td></tr>`
      : `<p class="estado rot">${esc(texto)}</p>`;
  }

  // Data e hora no formato brasileiro, sem segundos
  function dataHora(iso) {
    if (!iso) return "--";
    return new Date(iso).toLocaleString("pt-BR", {
      day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
    });
  }

  window.UI = { esc, selo, carregando, erro, vazio, dataHora };
})();