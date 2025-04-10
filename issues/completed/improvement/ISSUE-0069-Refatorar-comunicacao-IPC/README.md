# ISSUE-0069: Refatorar comunicação IPC para utilizar `contextBridge` corretamente

**Tipo:** Improvement

**Descrição:**
A comunicação IPC entre o processo principal e o worker foi refatorada para utilizar o `contextBridge` corretamente, garantindo a segurança e a integridade da aplicação.

**Status:** Concluído

**Detalhes da Implementação:**

- **Uso correto do `contextBridge`:** O preload (`src/core/infrastructure/electron/preload.ts`) expõe APIs seguras (`historyAPI`, `githubTokenAPI`, `llmMetricsAPI`) via `contextBridge.exposeInMainWorld`, evitando exposição direta do `ipcRenderer`.
- **Modularização:** A comunicação IPC com o worker foi encapsulada na classe `ElectronWorkerAdapter` e no cliente `ElectronIpcClient` (`src/core/infrastructure/electron/electron-worker-adapter.ts`).
- **Tratamento de erros:** Implementado tratamento robusto para erros de parsing, erros do worker e timeouts, com múltiplas tentativas automáticas.
- **Streaming incremental:** A comunicação suporta streaming incremental de respostas do worker via AsyncGenerator, com controle de fluxo e cancelamento de listeners.
- **Segurança:** A API exposta ao renderer é restrita, mitigando riscos de segurança comuns em IPC Electron.

**Prioridade:** Alta

**Critérios de Aceitação:**
- A comunicação IPC utiliza o `contextBridge` corretamente. **(Atendido)**
- A aplicação funciona como esperado após a refatoração. **(Atendido)**
- Não há regressões. **(Atendido)**