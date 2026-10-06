const API_BASE = "https://vinicola-back.onrender.com";

function getSessao() {
  try {
    return JSON.parse(sessionStorage.getItem("sessao"));
  } catch (e) {
    return null;
  }
}

function salvarSessao(sessao) {
  sessionStorage.setItem("sessao", JSON.stringify(sessao));
}

function limparSessao() {
  sessionStorage.removeItem("sessao");
}

async function apiFetch(caminho, opcoes = {}) {
  const sessao = getSessao();
  const headers = { "Content-Type": "application/json", ...(opcoes.headers || {}) };
  if (sessao?.access_token) headers["Authorization"] = `Bearer ${sessao.access_token}`;

  const resposta = await fetch(`${API_BASE}${caminho}`, { ...opcoes, headers });

  if (resposta.status === 401) {
    limparSessao();
    location.href = "login.html";
    return null;
  }
  if (!resposta.ok) {
    const erro = await resposta.json().catch(() => ({}));
    throw new Error(erro.detail || `Erro ${resposta.status}`);
  }
  return resposta.json();
}