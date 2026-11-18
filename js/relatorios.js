const $ = (id) => document.getElementById(id);

// Dados de exemplo: o back ainda não expõe logs de acesso nem resultados de testes.
// Quando essas rotas existirem, troque as constantes abaixo pelas respostas da API.
const eventos = [
  { quando: "17/11 16:42", usuario: "suporte.produtor@teste.com", evento: "GET /clima/historico", resultado: "Negado (403)", status: "warn" },
  { quando: "17/11 16:40", usuario: "suporte.produtor@teste.com", evento: "Login", resultado: "Sucesso", status: "ok" },
  { quando: "17/11 16:35", usuario: "desconhecido", evento: "Login", resultado: "Falha (senha inválida)", status: "bad" },
  { quando: "17/11 16:20", usuario: "suporte.admin@teste.com", evento: "Login", resultado: "Sucesso", status: "ok" },
  { quando: "17/11 15:58", usuario: "suporte.produtor@teste.com", evento: "POST /auth/register (perfil administrador)", resultado: "Negado (403)", status: "warn" },
];

const areas = [
  { area: "API e autenticação", casos: 12, aprovados: 0, falhos: 0 },
  { area: "Controle de acesso (RBAC)", casos: 3, aprovados: 0, falhos: 0 },
  { area: "Interface", casos: 18, aprovados: 0, falhos: 0 },
  { area: "Compatibilidade", casos: 3, aprovados: 0, falhos: 0 },
];

// Segurança
const negados = eventos.filter((e) => e.resultado.includes("403")).length;
const falhas = eventos.filter((e) => e.resultado.startsWith("Falha")).length;
const incidentes = eventos.filter((e) => e.status === "bad").length;

$("s-eventos").textContent = String(eventos.length);
$("s-falhas").textContent = String(falhas);
$("s-negados").textContent = String(negados);
$("s-incidentes").textContent = String(incidentes);

$("s-linhas").innerHTML = eventos.map((e) => `
  <tr>
    <td>${escapeHTML(e.quando)}</td>
    <td>${escapeHTML(e.usuario)}</td>
    <td>${escapeHTML(e.evento)}</td>
    <td><span class="tag ${e.status}">${escapeHTML(e.resultado)}</span></td>
  </tr>`).join("") || `<tr><td colspan="4">Nenhum evento registrado.</td></tr>`;

// Qualidade
const planejados = areas.reduce((s, a) => s + a.casos, 0);
const executados = areas.reduce((s, a) => s + a.aprovados + a.falhos, 0);
const aprovados = areas.reduce((s, a) => s + a.aprovados, 0);
const falhosTotal = areas.reduce((s, a) => s + a.falhos, 0);
const aprovacao = executados ? Math.round((aprovados / executados) * 100) : null;

$("q-planejados").textContent = String(planejados);
$("q-executados").textContent = String(executados);
$("q-executados-t").textContent = executados ? `de ${planejados} planejados` : "execução pendente";
$("q-falhos").textContent = String(falhosTotal);
$("q-aprovacao").textContent = aprovacao != null ? `${aprovacao}%` : "--";
requestAnimationFrame(() => ($("q-barra").style.width = `${aprovacao ?? 0}%`));

$("q-linhas").innerHTML = areas.map((a) => {
  const situacao = a.aprovados + a.falhos === 0 ? "Pendente" : a.falhos ? "Com falhas" : "Aprovado";
  const classe = situacao === "Pendente" ? "inf" : situacao === "Com falhas" ? "bad" : "ok";
  return `
    <tr>
      <td>${escapeHTML(a.area)}</td>
      <td>${a.casos}</td>
      <td>${a.aprovados}</td>
      <td>${a.falhos}</td>
      <td><span class="tag ${classe}">${situacao}</span></td>
    </tr>`;
}).join("");