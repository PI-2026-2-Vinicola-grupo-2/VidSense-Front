# Vinícola — Frontend

Interface web do Projeto Integrador — Inteligência de Dados no Vale do São Francisco. O dashboard acompanha temperatura, umidade do ar e do solo, histórico de leituras, alertas e a janela estimada de colheita.

## Visão geral

O frontend é uma aplicação estática em HTML, CSS e JavaScript puro. Ele se comunica por HTTPS com a API FastAPI hospedada no Render e usa JWT para autenticação.

```text
Usuário → Navegador → Frontend HTML/CSS/JavaScript
                         │ HTTPS + JWT
                         ▼
                Backend FastAPI → Supabase PostgreSQL
                                      │
                                      └→ ThingSpeak / dados climáticos
```

## Stack

- HTML5, CSS3 e JavaScript puro, sem framework ou etapa de build/npm
- Chart.js via CDN para gráficos
- Google Fonts / Inter
- Layout responsivo com CSS Grid e Flexbox
- Backend FastAPI consumido pela aplicação
- JWT para autenticação

## Funcionalidades

| Tela | Arquivo | Descrição |
|---|---|---|
| Login e cadastro | `login.html` | Autenticação e criação de conta pela API |
| Dashboard | `index.html` | Leituras atuais, histórico, alertas, umidade do solo e indicadores |
| Histórico | `historico.html` | Leituras dos últimos 7 ou 30 dias com filtros |
| Previsão de colheita | `previsao.html` | Janela estimada, condições diárias e indicação de estimativa simulada |
| Alertas | `alertas.html` | Alertas reais da API, filtros e marcação local como lidos |
| Configurações | `configuracoes.html` | Visualização local do perfil e preferências da interface |

O dashboard também informa quando a última leitura está desatualizada. A umidade do solo só é exibida quando há dados do sensor. Valores recebidos pela API que são inseridos no HTML são sanitizados por `escapeHTML`.

## Integração com a API

A URL de produção é:

```text
https://vinicola-back.onrender.com
```

A configuração do cliente HTTP está em `js/api.js`. O helper `apiFetch()` adiciona o token JWT, trata sessão expirada, timeout de 70 segundos e o aviso de cold start do servidor.

| Endpoint | Método | Finalidade |
|---|---|---|
| `/health` | GET | Verificar disponibilidade |
| `/auth/login` | POST | Autenticar usuário |
| `/auth/register` | POST | Cadastrar usuário |
| `/clima/atual` | GET | Consultar a última leitura |
| `/clima/historico` | GET | Consultar histórico por horas |
| `/alertas` | GET | Consultar alertas |
| `/previsao/janela-colheita` | GET | Consultar previsão de colheita |

O histórico usa `horas=24`, `horas=168` ou `horas=720`, conforme a tela. A previsão é uma estimativa baseada no histórico do ThingSpeak; quando o backend indicar `simulado`, a interface mantém essa informação visível e não inventa uma confiança ausente.

As permissões das rotas são controladas pelo backend. O frontend envia o JWT recebido no login e redireciona para a tela de login quando recebe `401 Unauthorized`.

As configurações de perfil, limites e notificações são apenas visuais: a API atual não possui endpoint de persistência para elas.

## Estrutura do projeto

```text
Vinicola-Front/
├── index.html
├── login.html
├── historico.html
├── previsao.html
├── alertas.html
├── configuracoes.html
├── css/style.css
├── imagens/
│   ├── logo-completo.svg
│   └── logo-icone.svg
└── js/
    ├── api.js
    ├── app.js
    ├── alertas.js
    ├── configuracoes.js
    ├── historico.js
    ├── layout.js
    ├── login.js
    └── previsao.js
```

## Como executar localmente

Não é necessária instalação de dependências npm. Abra a pasta no VS Code e use uma extensão de servidor estático, como Live Server:

```text
http://127.0.0.1:5500
```

Também é possível usar qualquer servidor HTTP estático. A origem local precisa estar autorizada no backend pela variável `CORS_ORIGINS`, por exemplo:

```text
http://localhost:5500,http://127.0.0.1:5500
```

## Status

- [x] Interface principal, dashboard, histórico, previsão, alertas e configurações
- [x] Integração com a API FastAPI
- [x] Autenticação JWT e tratamento de sessão expirada
- [ ] Deploy próprio do frontend
- [ ] Evolução das funcionalidades de previsão e alertas

## Segurança e projetos relacionados

O frontend não deve armazenar chaves do ThingSpeak, senha do banco, `JWT_SECRET_KEY` ou outros secrets de infraestrutura. O token de autenticação é mantido somente na sessão do navegador.

- **Backend:** `Vinicola-Back` — API FastAPI, autenticação, RBAC e banco
- **IoT:** `Vinicola-IoT` — ESP32 + DHT11 e envio ao ThingSpeak
- **Banco:** Supabase PostgreSQL
