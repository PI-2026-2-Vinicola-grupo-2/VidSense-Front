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

  // Perfil escolhido na tela de login (se não houver, usa o padrão)
  let usuario = { nome: "Maria Souza", cargo: "Produtora" };
  try {
    usuario = JSON.parse(sessionStorage.getItem("usuario")) || usuario;
  } catch (e) {}

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
      <span class="avatar">${usuario.nome[0]}</span>
      <div class="grow"><strong>${usuario.nome}</strong><small>${usuario.cargo}</small></div>
      <a href="login.html" class="sair" title="Sair" aria-label="Sair">Sair</a>
    </div>`;
})();