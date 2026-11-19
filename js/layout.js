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
  const nomesTela = Object.fromEntries(itens);
  const atual = location.pathname.split("/").pop() || "index.html";

  const sessao = getSessao();
  if (!sessao) {
    location.href = "login.html";
    return;
  }

  // Regras de acesso por perfil (fonte única)
  const restritas = {
    "historico.html": ["analista_dados", "administrador"],
    "relatorios.html": ["administrador"],
  };
  const podeVer = (href) => !restritas[href] || restritas[href].includes(sessao.perfil);

  // Tela restrita aberta sem permissão: avisa e volta ao dashboard
  if (restritas[atual] && !podeVer(atual)) {
    sessionStorage.setItem("aviso-acesso", nomesTela[atual] || atual);
    location.href = "index.html";
    return;
  }

  // Mostra o aviso uma única vez, depois de voltar ao dashboard
  const avisoPendente = sessionStorage.getItem("aviso-acesso");
  if (avisoPendente && atual === "index.html") {
    sessionStorage.removeItem("aviso-acesso");
    const main = document.querySelector("main");
    if (main) {
      const aviso = document.createElement("div");
      aviso.setAttribute("role", "alert");
      aviso.style.cssText =
        "background:#ffedd5;color:#9a3412;border-radius:12px;padding:0.8rem 1rem;font-size:0.9rem;font-weight:500;";
      aviso.textContent =
        `Seu perfil não tem acesso à tela "${avisoPendente}". ` +
        "Mostramos o dashboard, que é o que está liberado para você.";
      main.prepend(aviso);
    }
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