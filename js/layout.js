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
  if (!sessao || typeof sessao !== "object" || !sessao.access_token) {
    location.href = "login.html";
    return;
  }

  const nome = typeof sessao.nome === "string" && sessao.nome.trim() ? sessao.nome : "Usuário";
  const cargo = typeof sessao.cargo === "string" && sessao.cargo.trim() ? sessao.cargo : sessao.perfil || "Perfil";
  document.getElementById("menu").innerHTML = `
    <div class="logo">
      <img src="imagens/logo-icone.svg" alt="" width="34" height="34">Vinícola
    </div>
    <nav>
      ${itens.map(([href, nome]) =>
        `<a href="${href}" ${href === atual ? 'class="on" aria-current="page"' : ""}>${nome}</a>`
      ).join("")}
    </nav>
    <div class="perfil">
      <span class="avatar">${escapeHTML(nome[0])}</span>
      <div class="grow"><strong>${escapeHTML(nome)}</strong><small>${escapeHTML(cargo)}</small></div>
      <a href="#" class="sair" title="Sair" aria-label="Sair" id="sair">Sair</a>
    </div>`;

  document.getElementById("sair").addEventListener("click", (e) => {
    e.preventDefault();
    limparSessao();
    location.href = "login.html";
  });
})();