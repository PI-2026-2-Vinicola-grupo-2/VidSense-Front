# Vinícola — Frontend

Interface web do **Projeto Integrador — Inteligência de Dados no Vale do São Francisco**.

O frontend apresenta o dashboard climático e as funcionalidades de acompanhamento das condições do vinhedo, consumindo a API REST do backend hospedado em produção no Render.

## Visão geral

O frontend foi desenvolvido sem framework, utilizando HTML, CSS e JavaScript puro. A aplicação se comunica com o backend por HTTP/HTTPS e utiliza autenticação baseada em JWT.

### Arquitetura

```text
Usuário
   │
   ▼
Navegador
   │
   ▼
Frontend — HTML/CSS/JavaScript
   │
   │ HTTPS + JWT
   ▼
Backend FastAPI — Render
   │
   ▼
Supabase PostgreSQL
   │
   └──────────────► ThingSpeak / dados climáticos
```

## Stack

- **HTML5** — estrutura das páginas
- **CSS3** — estilos e layout responsivo
- **JavaScript** — lógica da aplicação e integração com a API
- **Chart.js** — gráficos
- **Google Fonts / Inter** — tipografia
- **FastAPI** — backend consumido pela aplicação
- **JWT** — autenticação

## Funcionalidades

| Tela | Arquivo | Descrição |
|---|---|---|
| Login | `login.html` | Autenticação do usuário através da API |
| Dashboard | `index.html` | Visualização de temperatura, umidade, alertas e indicadores |
| Histórico | `historico.html` | Consulta e visualização do histórico climático |
| Previsão de colheita | `previsao.html` | Visualização da previsão/janela de colheita |
| Alertas | `alertas.html` | Visualização e gerenciamento dos alertas da interface |
| Configurações | `configuracoes.html` | Configurações e preferências apresentadas pela interface |

## Integração com a API

A URL de produção utilizada atualmente pelo frontend é:

```text
https://vinicola-back.onrender.com
```

A configuração encontra-se em:

```text
js/api.js
```

O helper `apiFetch()` centraliza as requisições e adiciona automaticamente o token JWT quando existe uma sessão válida.

### Principais endpoints utilizados/disponíveis

| Endpoint | Método | Acesso | Finalidade |
|---|---|---|---|
| `/health` | GET | Público | Verificar disponibilidade da API |
| `/auth/login` | POST | Público | Autenticar usuário |
| `/auth/register` | POST | Público | Cadastrar usuário |
| `/clima/atual` | GET | Público | Consultar última leitura climática |
| `/clima/historico` | GET | Autenticado | Consultar histórico climático |

> As permissões das rotas são controladas pelo backend. O frontend apenas envia o token JWT recebido durante o login.

## Autenticação

O fluxo de autenticação funciona da seguinte forma:

1. O usuário informa e-mail e senha na tela de login.
2. O frontend envia as credenciais para `/auth/login`.
3. O backend valida o usuário.
4. O backend retorna um JWT e informações básicas do usuário.
5. O frontend mantém a sessão no `sessionStorage`.
6. As requisições autenticadas recebem o header:

```http
Authorization: Bearer <token>
```

Se a API retornar `401 Unauthorized`, a sessão é removida e o usuário é direcionado novamente para a tela de login.

## Estrutura do projeto

```text
Vinicola-Front/
├── index.html
├── login.html
├── historico.html
├── previsao.html
├── alertas.html
├── configuracoes.html
├── css/
│   └── style.css
├── imagens/
│   ├── logo-completo.svg
│   └── logo-icone.svg
├── js/
│   ├── api.js
│   ├── app.js
│   ├── alertas.js
│   ├── configuracoes.js
│   ├── historico.js
│   ├── layout.js
│   ├── login.js
│   └── previsao.js
└── README.md
```

## Como executar localmente

O projeto não possui etapa de build nem dependências Node.js.

### Opção 1 — VS Code + Live Server

1. Abra o projeto no VS Code.
2. Instale a extensão **Live Server**.
3. Abra `index.html` ou `login.html` com **Open with Live Server**.
4. Acesse a URL disponibilizada pelo Live Server.

Exemplo:

```text
http://127.0.0.1:5500
```

### Opção 2 — servidor HTTP local

Também é possível utilizar qualquer servidor HTTP estático.

## Configuração de CORS

Como o frontend realiza requisições para a API, a origem utilizada localmente precisa estar permitida no backend através da variável `CORS_ORIGINS`.

Exemplo:

```text
http://localhost:5500,http://127.0.0.1:5500
```

Em produção, a origem do domínio onde o frontend estiver hospedado deverá ser adicionada à configuração de CORS da API.

## Status atual

- [x] Interface principal
- [x] Dashboard
- [x] Histórico
- [x] Previsão de colheita
- [x] Alertas
- [x] Configurações
- [x] Tela de login
- [x] Integração com a API FastAPI
- [x] Autenticação JWT no frontend
- [x] Tratamento de sessão expirada
- [ ] Deploy próprio do frontend
- [ ] Evolução das funcionalidades de previsão e alertas integradas ao backend

## Segurança

O frontend não deve armazenar secrets da infraestrutura, chaves do ThingSpeak, senha do banco ou `JWT_SECRET_KEY`.

O token de autenticação recebido do backend é mantido na sessão do navegador para permitir as requisições autenticadas.

## Repositórios relacionados

- **Backend:** `Vinicola-Back` — API FastAPI, autenticação, RBAC e acesso ao banco.
- **IoT:** `Vinicola-IoT` — ESP32 + DHT11 e envio das leituras ao ThingSpeak.
- **Banco:** Supabase PostgreSQL — banco utilizado pelo backend em produção.
