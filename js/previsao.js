// Previsão fictícia: [dia, temperatura, umidade, ícone, pontuação]
const dias = [
  ["Qui 12", 25, 60, "☀️", 90],
  ["Sex 13", 25, 57, "☀️", 94],
  ["Sáb 14", 24, 58, "⛅", 96],
  ["Dom 15", 24, 61, "☀️", 95],
  ["Seg 16", 26, 59, "☀️", 92],
  ["Ter 17", 27, 63, "⛅", 89],
  ["Qua 18", 27, 66, "🌤️", 85],
];

// Destaca o dia com a maior pontuação
const melhor = dias.reduce((a, b) => (b[4] > a[4] ? b : a));
document.getElementById("melhor").textContent = melhor[0];

document.getElementById("dias").innerHTML = dias.map(([nome, t, u, ic, p]) => `
  <div class="dia ${nome === melhor[0] ? "best" : ""}">
    <small>${nome}</small>
    <div class="ic">${ic}</div>
    <strong>${t}°C</strong>
    <small>${u}% umid.</small>
    <span class="tag ok">${p} pts</span>
  </div>`).join("");