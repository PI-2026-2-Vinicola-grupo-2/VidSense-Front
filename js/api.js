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

function escapeHTML(s) {
  if (s == null) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function mostrarAvisoAcordando() {
  let el = document.getElementById("aviso-servidor");
  if (!el) {
    el = document.createElement("div");
    el.id = "aviso-servidor";
    el.className = "toast";
    el.style.zIndex = "9999";
    document.body.appendChild(el);
  }
  el.textContent = "Acordando o servidor, pode levar até 1 minuto…";
  el.classList.add("show");
}

function esconderAvisoAcordando() {
  const el = document.getElementById("aviso-servidor");
  if (el) el.classList.remove("show");
}

async function apiFetch(caminho, opcoes = {}) {
  const sessao = getSessao();
  const redirecionarSemAutorizacao = opcoes.redirectOnUnauthorized !== false;
  const fetchOpcoes = { ...opcoes };
  delete fetchOpcoes.redirectOnUnauthorized;
  const headers = { "Content-Type": "application/json", ...(opcoes.headers || {}) };
  if (sessao?.access_token) headers["Authorization"] = `Bearer ${sessao.access_token}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 70000);
  const avisoTimer = setTimeout(() => mostrarAvisoAcordando(), 3500);

  try {
    const resposta = await fetch(`${API_BASE}${caminho}`, {
      ...fetchOpcoes,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    clearTimeout(avisoTimer);
    esconderAvisoAcordando();

    if (resposta.status === 401 && redirecionarSemAutorizacao) {
      limparSessao();
      location.href = "login.html";
      return null;
    }

    if (!resposta.ok) {
      const erro = await resposta.json().catch(() => ({}));
      throw new Error(erro.detail || `Erro ${resposta.status}`);
    }

    return resposta.json();
  } catch (err) {
    clearTimeout(timeoutId);
    clearTimeout(avisoTimer);
    esconderAvisoAcordando();

    if (err.name === "AbortError") {
      throw new Error("O servidor demorou muito para responder (tempo limite de 70s excedido). Tente novamente.");
    }
    if (err instanceof TypeError && err.message.toLowerCase().includes("fetch")) {
      throw new Error("Não foi possível conectar ao servidor. Verifique sua conexão com a internet.");
    }
    throw err;
  }
}