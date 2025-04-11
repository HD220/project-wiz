# ISSUE-0160 - Refatorar main.ts do Electron em módulos menores

## Contexto
O arquivo `src/core/infrastructure/electron/main.ts` concentra diversas responsabilidades:

- Criação e configuração da janela Electron
- Registro de múltiplos handlers IPC (history, GitHub token, worker, GPU)
- Inicialização da API HTTP Express para o app mobile
- Inicialização de serviços

Com 239 linhas, o arquivo está difícil de manter, revisar e evoluir, além de dificultar a aplicação de boas práticas de segurança e testes.

---

## Análise Detalhada do Arquivo Atual

### 1. Handlers IPC
- **HistoryService:** `registerHistoryServiceHandlers()`
- **GitHub Token:** `registerGitHubTokenHandlers()`
- **WorkerService:** `registerWorkerServiceHandlers()`
- **GPU Metrics:** `registerGpuMetricsHandlers()`

Cada grupo de handlers possui validações e chamadas específicas, podendo ser extraído para arquivos separados.

### 2. API HTTP Express para Mobile
- Função `startMobileApiServer()`
- Endpoints:
  - `/pairing` (token e URL)
  - `/status`
  - `/history`
  - `/settings`
- Middleware de autenticação com token gerado na inicialização

### 3. Criação da Janela Electron
- Função `createWindow()`
- Configurações de segurança (sandbox, contextIsolation, sem nodeIntegration)
- Carregamento da URL ou arquivo local
- Abertura do DevTools

### 4. Bootstrap
- Importa e instancia `WorkerServiceAdapter` e `GpuMetricsProviderElectronAdapter`
- Registra todos os handlers
- Cria a janela
- Inicia a API mobile
- Eventos do ciclo de vida do Electron (`activate`, `window-all-closed`)

---

## Problemas Identificados
- Viola o princípio da responsabilidade única (SRP)
- Dificulta a leitura e manutenção
- Aumenta o risco de bugs e falhas de segurança
- Torna a testabilidade mais complexa

## Proposta de Refatoração
Dividir o arquivo em módulos menores e especializados:

- `window.ts`: criação e configuração da janela Electron
- `ipc-handlers/`: pasta com arquivos para cada grupo de handlers IPC
  - `history-handlers.ts`
  - `github-token-handlers.ts`
  - `worker-handlers.ts`
  - `gpu-metrics-handlers.ts`
- `mobile-api.ts`: inicialização da API HTTP Express
- `main.ts`: apenas bootstrap e orquestração das importações

## Critérios de Aceitação
- Código modularizado, com responsabilidades separadas
- `main.ts` com menos de 100 linhas, focado em orquestração
- Facilitar manutenção, testes e futuras melhorias
- Documentação atualizada refletindo a nova estrutura

## Riscos
- Quebra de funcionalidades se a refatoração não for cuidadosamente testada
- Dependências cruzadas entre módulos

## Relacionamento
Relacionado à melhoria de segurança da issue **ISSUE-0152**.

## Prioridade
Alta para facilitar futuras melhorias e reforço de segurança.