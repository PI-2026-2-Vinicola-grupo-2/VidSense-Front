# VidSense · Front-end

Interface web do Projeto Integrador **VidSense**, um dashboard de monitoramento climático e logístico para o vinhedo, no Vale do São Francisco. Consome a API REST do back-end (FastAPI), publicada no Render.

## Stack

- HTML5, CSS3 e JavaScript puro (sem framework e sem etapa de build)
- [Chart.js](https://www.chartjs.org/) 4.4.4 via CDN, para os gráficos
- Fonte Inter via Google Fonts
- Autenticação por JWT, guardado no `sessionStorage`

## Estrutura

```
VidSense-Front/
├── index.html            # Dashboard
├── historico.html        # Histórico de leituras (analista e administrador)
├── previsao.html         # Previsão de colheita
├── mercado.html          # Mercado e logística
├── alertas.html          # Alertas e histórico de alertas
├── relatorios.html       # Relatórios de segurança e qualidade (administrador)
├── usuarios.html         # Cadastro e perfis de usuários (administrador)
├── configuracoes.html    # Dados do usuário e status da fonte de dados
├── login.html            # Entrada no sistema
├── css/
│   └── style.css         # Estilos de todas as telas
├── imagens/
│   ├── logo-completo.svg
│   └── logo-icone.svg / .png
└── js/
    ├── api.js            # URL da API, apiFetch, sessão e escapeHTML
    ├── ui.js             # Padrões visuais: carregando, erro, vazio e selo de origem
    ├── layout.js         # Menu lateral, regras de acesso por perfil e aviso de acesso negado
    ├── app.js            # Dashboard
    ├── historico.js
    ├── previsao.js
    ├── mercado.js
    ├── alertas.js
    ├── relatorios.js
    ├── usuarios.js
    ├── configuracoes.js
    └── login.js
```

## Como executar

Não há dependências para instalar.

1. Abra a pasta no VS Code.
2. Instale a extensão **Live Server**.
3. Clique com o botão direito em `login.html` e escolha **Open with Live Server**.
4. O endereço padrão é `http://127.0.0.1:5500`.

Abra pelo Live Server, e não com duplo clique no arquivo, porque os scripts precisam ser servidos por HTTP.

## Configuração da API

A URL do back-end fica em `js/api.js`:

```js
const API_BASE = "https://vidsense-back.onrender.com";
```

O back-end libera a origem `http://127.0.0.1:5500` no CORS. Se o front for publicado em outro endereço, esse endereço precisa ser adicionado à variável `CORS_ORIGINS` do back.

## Perfis e acesso

O menu é montado a partir do perfil da sessão (`js/layout.js`), que é a única fonte das regras de acesso na interface.

| Tela | Produtor | Analista | Administrador |
|---|---|---|---|
| Dashboard | Sim (sem gráfico de histórico) | Sim | Sim |
| Histórico | Não | Sim | Sim |
| Previsão de colheita | Sim | Sim | Sim |
| Mercado e logística | Sim | Sim | Sim |
| Alertas | Sim | Sim | Sim |
| Relatórios | Não | Não | Sim |
| Usuários | Não | Não | Sim |
| Configurações | Sim | Sim | Sim |

Quando um perfil abre uma tela restrita pela barra de endereço, o sistema volta ao dashboard e mostra um aviso explicando o motivo.

> A restrição na interface é apenas uma camada de conveniência. O controle real de acesso fica na API, que responde 403 para perfis sem permissão.

## Integração com a API

| Endpoint | Acesso | Tela |
|---|---|---|
| `POST /auth/login` | Público | Login |
| `POST /auth/register` | Público (somente perfil produtor) | Login (criar conta) |
| `GET /clima/atual` | Público | Dashboard, Configurações |
| `GET /clima/historico?horas=` | Analista e administrador | Dashboard, Histórico |
| `GET /alertas` | Autenticado | Dashboard, Alertas |
| `GET /alertas/historico?limite=` | Autenticado | Alertas |
| `GET /previsao/janela-colheita` | Autenticado | Dashboard, Previsão |
| `GET /mercado/resumo` | Autenticado | Mercado e logística |
| `GET /admin/usuarios` | Administrador | Usuários |
| `POST /admin/usuarios` | Administrador | Usuários (novo usuário) |
| `PATCH /admin/usuarios/{id}/perfil` | Administrador | Usuários (alterar perfil) |

A logística ainda não tem endpoint. A tela usa dados de exemplo, controlados por `USAR_DADOS_EXEMPLO` no início de `js/mercado.js`.

## Padrões visuais

Todas as telas seguem o mesmo padrão, definido em `js/ui.js`:

- **Carregando:** texto cinza na lista ou tabela enquanto os dados chegam.
- **Erro:** mensagem em vermelho com o botão **Tentar de novo**. Em listas que já têm dados, a lista permanece na tela e o aviso aparece acima dela.
- **Lista vazia:** mensagem padrão quando não há itens para mostrar.
- **Selo de origem:**
  - **Dados da API:** vieram do back-end.
  - **Estimativa simulada:** a previsão ainda não usa histórico suficiente.
  - **Dados de exemplo:** valores fictícios, usados enquanto a API não existe.
  - **Indisponível:** a chamada falhou.

## Atualização dos dados

- **Dashboard:** busca os dados a cada 30 segundos e tem o botão **Atualizar** para buscar na hora. A linha "Última leitura" recalcula a idade da leitura a cada 15 segundos, sem recarregar a página. Passados 60 minutos, o dashboard passa a mostrar o aviso "Sem dados recentes" e o selo "Dados antigos da API".
- **Alertas:** busca a cada 30 segundos, com o mesmo comportamento de pausa em segundo plano.
- **Demais telas:** carregam os dados ao abrir. Atualização automática e botão **Atualizar** ainda não foram implementados nelas.
- A atualização pausa quando a aba fica em segundo plano e retoma ao voltar.

## Controle de acesso e avisos

- Ao abrir uma tela restrita sem permissão, o sistema volta ao dashboard e mostra o aviso "Seu perfil não tem acesso à tela…". O aviso aparece uma única vez.
- A tela de Histórico também mostra mensagem de permissão, caso a API responda 403.
- A tela de Usuários impede que o administrador altere o próprio perfil, tanto na interface quanto na API.

## Limitações conhecidas

- **Sensor parado:** o ESP32 ainda não está montado. A última leitura do canal ThingSpeak é de 30/10, então o dashboard mostra o aviso de dados antigos.
- **Umidade do solo:** o sensor ainda não está instalado. Quando estiver, o valor deve chegar no `field3` do canal, e o card passa a mostrar o dado.
- **Logística:** usa dados de exemplo, identificados com selo.
- **Relatórios:** usam dados de exemplo, identificados com selo.
- **Previsão:** a janela de colheita é uma estimativa simulada, até existir histórico suficiente.
- **Marcação de "lido" nos alertas:** fica guardada na sessão do navegador, e não no servidor.
- **Primeiro acesso:** o back-end está no plano gratuito do Render, que pode levar cerca de 50 segundos para responder depois de um período parado.

## Status

- [x] Login e controle de sessão
- [x] Dashboard com dados da API, atualização automática e botão Atualizar
- [x] Última leitura com idade atualizada automaticamente
- [x] Histórico com gráfico e filtro por status
- [x] Previsão de colheita (estimativa)
- [x] Alertas e histórico de alertas do servidor
- [x] Mercado com dados simulados da API
- [x] Logística com dados de exemplo
- [x] Relatórios com dados de exemplo, restritos ao administrador
- [x] Usuários: listar, cadastrar e alterar perfil
- [x] Configurações
- [x] Padronização visual das telas (`ui.js`)
- [x] Controle de acesso por perfil com aviso
- [ ] Atualização automática e botão Atualizar nas demais telas
- [ ] Logística com dados reais
- [ ] Relatórios com dados reais
- [ ] Configurações gravadas no servidor
- [ ] Marcação de "lido" gravada no servidor
- [ ] Deploy do front-end

## Repositórios relacionados

- **Back-end:** `VidSense-Back`, API FastAPI com autenticação, RBAC, ingestão do ThingSpeak, previsão, alertas, mercado e gestão de usuários.
- **IoT:** ESP32 com sensor DHT e sensor de umidade do solo, publicando no canal ThingSpeak 3500405.

## Equipe

Grupo 02 · Projeto Integrador, 4º módulo ADS.