(function () {
  const itens = [
    ["index.html", "Dashboard"],
    ["historico.html", "Histórico"],
    ["previsao.html", "Previsão de colheita"],
    ["mercado.html", "Mercado e logística"],
    ["alertas.html", "Alertas"],
    ["relatorios.html", "Relatórios"],
    ["configuracoes.html", "Configurações"],
  ];
  const atual = location.pathname.split("/").pop() || "index.html";

  const sessao = getSessao();
  if (!sessao) {
    location.href = "login.html";
    return;
  }

  // Regras de acesso por perfil
  const restritas = {
    "historico.html": ["analista_dados", "administrador"],
    "relatorios.html": ["administrador"],
  };
  const podeVer = (href) => !restritas[href] || restritas[href].includes(sessao.perfil);

  // Página restrita aberta por quem não tem permissão: volta ao dashboard
  if (restritas[atual] && !podeVer(atual)) {
    location.href = "index.html";
    return;
  }

  const visiveis = itens.filter(([href]) => podeVer(href));

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