# Vinícola-Front

Interface web do Projeto Integrador "Vinícola" (Inteligência de Dados no Vale do São Francisco). O dashboard mostra o clima do vinhedo (temperatura e umidade), o histórico de leituras, a previsão de colheita e os alertas.

> **Status:** protótipo visual. As telas usam **dados fictícios** gerados no próprio JavaScript e ainda **não estão conectadas à API** do [Vinicola-Back](../Vinicola-Back). Não há login nesta versão.

## Stack

- HTML5, CSS3 e JavaScript puro (sem framework e sem etapa de build)
- [Chart.js](https://www.chartjs.org/) via CDN para os gráficos
- Fonte Inter via Google Fonts
- Layout responsivo, com visual de cards translúcidos e cantos arredondados

## Estrutura do projeto

```
Vinicola-Front/
├── index.html            # Dashboard
├── historico.html        # Histórico de leituras
├── previsao.html         # Previsão de colheita
├── alertas.html          # Central de alertas
├── configuracoes.html    # Perfil, limites e notificações
├── css/
│   └── style.css         # Estilos de todas as telas
├── js/
│   ├── layout.js         # Desenha o menu lateral e marca a página atual
│   ├── app.js            # Dashboard: indicadores, gráfico e tabela
│   ├── historico.js      # Resumo, gráfico 7/30 dias e filtro de status
│   ├── previsao.js       # Cards dos dias da janela de colheita
│   ├── alertas.js        # Lista, filtros e "marcar como lido"
│   └── configuracoes.js  # Aviso ao salvar (demonstração)
└── README.md
```

## Como rodar

Não há dependências para instalar.

1. Abra a pasta `Vinicola-Front` no VS Code.
2. Instale a extensão **Live Server** (Ritwick Dey).
3. Clique com o botão direito em `index.html` e escolha **Open with Live Server**.
4. Acesse o endereço que o navegador abrir (normalmente `http://127.0.0.1:5500`).

> Abra pelo Live Server e não com duplo clique no arquivo. É preciso conexão com a internet para carregar o Chart.js e a fonte.

## Telas

| Tela | Arquivo | O que mostra | O que já funciona |
|---|---|---|---|
| Dashboard | `index.html` | Temperatura, umidade, janela de colheita, alertas ativos, gráfico e últimas leituras | Alternância entre 24 h e 7 dias no gráfico |
| Histórico | `historico.html` | Médias, máxima e mínima, gráfico e tabela de leituras | Seletor de 7 ou 30 dias e filtro por status |
| Previsão de colheita | `previsao.html` | Janela ideal, condições dia a dia e maturação das uvas | Destaque automático do melhor dia |
| Alertas | `alertas.html` | Lista de alertas por categoria | Filtros e "Marcar como lido" |
| Configurações | `configuracoes.html` | Perfil, limites de alerta, notificações e fonte de dados | Interruptores e aviso ao salvar (não grava nada) |

## Como o menu funciona

O menu lateral não é escrito em cada HTML. Cada página tem apenas `<aside class="side card" id="menu"></aside>` e o `js/layout.js` preenche o conteúdo e destaca a página atual pelo nome do arquivo. Por isso:

- Mantenha o `layout.js` carregado **antes** do script da própria página.
- Para criar uma nova tela, adicione uma linha na lista `itens` do `layout.js`.
- Os nomes dos arquivos HTML precisam ser iguais aos que estão em `layout.js`.

## Arquitetura prevista

```
Usuário → Navegador → Frontend (HTML/CSS/JS) → API FastAPI → ThingSpeak / PostgreSQL
```

| Camada | Tecnologia | Situação |
|---|---|---|
| Frontend | HTML · CSS · JavaScript | Protótipo visual pronto |
| Backend | Python 3.11 + FastAPI | Em desenvolvimento no Vinicola-Back |
| Dados | ThingSpeak (leituras do ESP32) e PostgreSQL | ThingSpeak ativo, PostgreSQL planejado |

## Integração com a API (próximos passos)

Hoje os dados vêm de funções que simulam leituras (por exemplo, `gerarDados` em `app.js` e `gerar` em `historico.js`). Para ligar à API, troque essas funções por chamadas `fetch` às rotas do back-end:

| Rota | Método | Acesso | Tela que vai usar |
|---|---|---|---|
| `/clima/atual` | GET | público | Dashboard |
| `/clima/historico?resultados=100` | GET | `analista_dados`, `administrador` | Histórico e gráfico do dashboard |
| `/auth/register` | POST | público | Cadastro (a criar) |
| `/auth/login` | POST | público | Login (a criar) |

Pontos de atenção na integração:

- A URL base da API deve ficar em um único lugar (por exemplo, um `js/config.js`).
- O back só aceita as origens listadas em `CORS_ORIGINS`. O padrão é `http://localhost:5500` e `http://127.0.0.1:5500`.
- Rotas protegidas exigem o header `Authorization: Bearer <token>`.
- Temperatura e umidade podem chegar como texto ou `null`, então converta com `Number()` antes de exibir.
- Previsão de colheita e alertas dependem de funcionalidades que ainda serão criadas no back-end.

## Status

- [x] Arquitetura técnica definida
- [x] Layout e estilos globais
- [x] Dashboard
- [x] Histórico
- [x] Previsão de colheita
- [x] Alertas
- [x] Configurações
- [ ] Login e cadastro
- [ ] Integração com a API (`/clima/atual` e `/clima/historico`)
- [ ] Controle de acesso por perfil
- [ ] Deploy do front-end

## Repositórios relacionados

- [Vinicola-Back](../Vinicola-Back): API FastAPI, autenticação e ingestão dos dados
- [Vinicola-IoT](../Vinicola-IoT): ESP32 com sensor DHT publicando no ThingSpeak