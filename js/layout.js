// Desenha o menu lateral e marca a página atual
(function () {
  const itens = [
    ["index.html", "Dashboard"],
    ["historico.html", "Histórico"],
    ["previsao.html", "Previsão de colheita"],
    ["alertas.html", "Alertas"],
    ["configuracoes.html", "Configurações"],
  ];
  const atual = location.pathname.split("/").pop() || "index.html";

  document.getElementById("menu").innerHTML = `
    <div class="logo"><span class="logo-dot"></span>Vinícola</div>
    <nav>
      ${itens.map(([href, nome]) =>
        `<a href="${href}" ${href === atual ? 'class="on" aria-current="page"' : ""}>${nome}</a>`
      ).join("")}
    </nav>
    <div class="perfil">
      <span class="avatar">M</span>
      <div><strong>Maria Souza</strong><small>Produtora</small></div>
    </div>`;
})();