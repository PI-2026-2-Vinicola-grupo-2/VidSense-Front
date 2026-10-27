(function () {
  const itens = [
    ["index.html", "Dashboard"],
    ["historico.html", "Histórico"],
    ["previsao.html", "Previsão de colheita"],
    ["alertas.html", "Alertas"],
    ["configuracoes.html", "Configurações"],
  ];
  const atual = location.pathname.split("/").pop() || "index.html";

  const sessao = getSessao();
  if (!sessao) {
    location.href = "login.html";
    return;
  }

  // Produtor não tem acesso ao histórico na API, então o link não aparece
  const visiveis = itens.filter(
    ([href]) => !(href === "historico.html" && sessao.perfil === "produtor_exportador")
  );

  document.getElementById("menu").innerHTML = `
    <div class="logo">
      <img src="imagens/logo-icone.png" alt="" width="34" height="34">VidSense
    </div>
    <nav>
      ${visiveis.map(([href, nome]) =>
        `<a href="${href}" ${href === atual ? 'class="on" aria-current="page"' : ""}>${nome}</a>`
      ).join("")}
    </nav>
    <div class="perfil">
      <span class="avatar">${sessao.nome[0]}</span>
      <div class="grow"><strong>${sessao.nome}</strong><small>${sessao.cargo}</small></div>
      <a href="#" class="sair" title="Sair" aria-label="Sair" id="sair">Sair</a>
    </div>`;

  document.getElementById("sair").addEventListener("click", (e) => {
    e.preventDefault();
    limparSessao();
    location.href = "login.html";
  });
})();