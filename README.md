# Vinicola-Front

[Prototipo](https://preview--shiny-front-stuff.lovable.app/)

Dashboard web do Projeto Integrador "Vinícola" (Inteligência de Dados no Vale do São Francisco). Consome a API REST do [Vinicola-Back](../Vinicola-Back) para autenticar usuários por perfil e exibir os dados climáticos (temperatura e umidade) coletados pelo dispositivo IoT.

> **Status:** projeto em fase inicial. Este README descreve a arquitetura planejada; itens marcados com `[ ]` ainda não foram implementados.

## Stack

- HTML5, CSS3 e JavaScript (sem framework, sem etapa de build)
- `fetch()` para comunicação com a API REST (JSON sobre HTTPS)
- Autenticação via JWT emitido pelo back-end
- Gráficos com uma biblioteca JS via CDN (sugestão: Chart.js)
- Hospedagem estática (a definir: Vercel, GitHub Pages ou similar)

## Arquitetura

```
Usuário → Navegador → Frontend (HTML/CSS/JS) → API FastAPI → ThingSpeak / PostgreSQL
```

| Camada | Tecnologia | Responsabilidade |
|---|---|---|
| Cliente | Navegador (Chrome, Edge, Safari) | Carrega as páginas estáticas e executa o JavaScript |
| Frontend | HTML · CSS · JavaScript | Telas de login, cadastro, dashboard e histórico |
| Backend | Python 3.11 + FastAPI | Autenticação, RBAC e exposição dos dados via REST |
| Dados | ThingSpeak (leituras IoT) e PostgreSQL (histórico e usuários, planejado) | Origem e persistência dos dados |

O diagrama completo (arquivo para o draw.io) fica em `docs/arquitetura-vinicola.drawio`.

## Como rodar localmente

Não há dependências para instalar. É preciso apenas de um servidor estático local e da API rodando.

1. Suba a API do [Vinicola-Back](../Vinicola-Back), que por padrão fica em `http://localhost:8000`.
2. Clone este repositório:
   ```bash
   git clone <url-do-repo>
   cd Vinicola-Front
   ```
3. Confira a URL da API em `js/config.js`:
   ```js
   export const API_BASE_URL = "http://localhost:8000";
   ```
4. Sirva a pasta na **porta 5500**, por exemplo com a extensão **Live Server** do VS Code (botão *Go Live*) ou:
   ```bash
   npx serve -l 5500
   ```
5. Acesse `http://localhost:5500`.

> **Importante:** o back-end só aceita chamadas das origens listadas em `CORS_ORIGINS`. O valor padrão é `http://localhost:5500,http://127.0.0.1:5500`. Se usar outra porta ou domínio, adicione a origem no `.env` da API, senão o navegador bloqueia as requisições.

## Estrutura de pastas (proposta)

```
Vinicola-Front/
├── index.html              # página inicial / redireciona conforme a sessão
├── login.html
├── cadastro.html
├── dashboard.html          # leitura atual de temperatura e umidade
├── historico.html          # série histórica (perfis restritos)
├── css/
│   ├── base.css            # reset, variáveis e tipografia
│   └── componentes.css     # cards, formulários, tabelas, botões
├── js/
│   ├── config.js           # API_BASE_URL
│   ├── api.js              # wrapper do fetch (base URL, JSON, header Authorization)
│   ├── auth.js             # login, logout, guarda do token e leitura do perfil
│   ├── dashboard.js        # busca /clima/atual e atualiza os cards
│   ├── historico.js        # busca /clima/historico e monta o gráfico
│   └── charts.js           # funções de gráfico
├── assets/                 # imagens e ícones
└── docs/
    └── arquitetura-vinicola.drawio
```

## Integração com a API

A URL base é definida em `js/config.js`. A documentação interativa da API fica em `{API_BASE_URL}/docs`.

| Rota | Método | Acesso | Uso no front |
|---|---|---|---|
| `/health` | GET | público | Verificar se a API está no ar |
| `/auth/register` | POST | público | Tela de cadastro |
| `/auth/login` | POST | público | Tela de login |
| `/clima/atual` | GET | público | Cards do dashboard |
| `/clima/historico?resultados=100` | GET | `analista_dados`, `administrador` | Tela de histórico |

### Exemplos de payload

**Cadastro** (`POST /auth/register`)
```json
{ "nome": "Maria", "email": "maria@exemplo.com", "senha": "********", "perfil": "produtor_exportador" }
```

**Login** (`POST /auth/login`) recebe `{ "email": "...", "senha": "..." }` em JSON e devolve:
```json
{ "access_token": "<jwt>", "token_type": "bearer" }
```

**Leitura climática** (`GET /clima/atual`)
```json
{ "temperatura": "27.5", "umidade": "61.0", "registrado_em": "2026-09-28T14:30:00Z" }
```
Os valores vêm do ThingSpeak e podem chegar como texto ou `null`. Converta com `Number()` e trate o caso vazio antes de exibir.

### Chamadas autenticadas

Rotas protegidas exigem o header `Authorization: Bearer <token>`:

```js
const resposta = await fetch(`${API_BASE_URL}/clima/historico?resultados=100`, {
  headers: { Authorization: `Bearer ${token}` },
});
```

Códigos de erro que o front deve tratar:

| Código | Significado | Ação sugerida |
|---|---|---|
| `400` | Dados inválidos (ex.: e-mail já cadastrado) | Exibir a mensagem do campo `detail` |
| `401` | Token ausente, inválido ou expirado | Limpar a sessão e redirecionar para o login |
| `403` | Perfil sem permissão para a rota | Exibir aviso de acesso negado |

## Autenticação e perfis

1. O usuário faz login e recebe um JWT (validade padrão de 60 minutos).
2. O front guarda o token no navegador e o envia em cada requisição protegida.
3. O JWT carrega o perfil do usuário (campo `role`), que o front lê para decidir o que mostrar no menu e nas telas.

| Perfil | Acesso previsto |
|---|---|
| `produtor_exportador` | Dashboard com a leitura atual |
| `analista_dados` | Dashboard e histórico |
| `administrador` | Acesso completo |

> **Atenção:** esconder um botão ou uma página no front é só conveniência de interface. Quem realmente bloqueia o acesso é a API, que valida o token e o perfil em cada rota. Nunca coloque segredos no código JavaScript, pois tudo o que está no front é visível para o usuário.

## Telas previstas

- **Login e cadastro:** formulários com validação básica e mensagens de erro vindas da API.
- **Dashboard:** cards com temperatura, umidade e horário da última leitura, com atualização periódica.
- **Histórico:** gráfico e tabela das últimas leituras, restrito a `analista_dados` e `administrador`.
- **Futuro:** janela ideal de colheita (RF06) e alertas (RF09), dependentes do back-end.

## Status atual

- [x] Arquitetura técnica definida
- [ ] Estrutura base do projeto e estilos globais
- [ ] Tela de login e cadastro
- [ ] Guarda de sessão e controle de acesso por perfil
- [ ] Dashboard com leitura atual (`/clima/atual`)
- [ ] Tela de histórico com gráfico (`/clima/historico`)
- [ ] Deploy do front-end
- [ ] Telas de previsão de colheita e alertas (dependem do back-end)

## Repositórios relacionados

- [Vinicola-Back](../Vinicola-Back): API FastAPI, autenticação, banco de dados e ingestão dos dados
- [Vinicola-IoT](../Vinicola-IoT): dispositivo ESP32 + sensor DHT publicando no ThingSpeak