# ADR-024: Padrões de Segurança e Design para IPC Electron e Script de Preload

**Status:** Proposto (Considerado Aprovado Conforme Instrução)

**Contexto:**
A comunicação entre processos (IPC) no Electron é uma área crítica tanto para a funcionalidade quanto para a segurança da aplicação. O script de preload (`preload.ts`) atua como uma ponte segura entre o processo principal (com acesso a APIs Node.js) e o processo de renderização (UI). É vital padronizar como esta ponte é construída, como os canais IPC são definidos e usados, e como os dados são tratados e validados. Esta ADR baseia-se na análise do `preload.ts`, dos handlers IPC (mesmo que mockados), do `IPCService.ts`, dos hooks `useIpcQuery`/`useIpcMutation` e do ADR-023.

**Decisão:**

Serão adotados os seguintes padrões para IPC e o script de preload:

**1. Script de Preload (`preload.ts`):**
    *   **Obrigatoriedade:** Um script de preload DEVE ser configurado e usado para TODAS as instâncias de `BrowserWindow` que necessitem de comunicação com o processo principal (conforme ADR-023).
    *   **Exposição Segura com `contextBridge`:**
        *   **Padrão:** Utilizar `contextBridge.exposeInMainWorld("apiKey", apiObject)` como o ÚNICO mecanismo para expor funcionalidades do preload para o processo de renderização.
        *   **API Exposta:** Expor um objeto API único e bem definido (e.g., `window.electronIPC`) em vez de múltiplas APIs globais. Este objeto conterá os métodos para interagir com o IPC.
        *   **Não Expor Módulos Sensíveis:** NUNCA expor `ipcRenderer` diretamente, ou quaisquer outros módulos do Electron ou Node.js (`fs`, `path`, etc.) para o renderer.
    *   **API Curada e Tipada:**
        *   A API exposta via `contextBridge` deve ser mínima, contendo apenas os métodos necessários para a comunicação IPC (e.g., `invoke`, `on`, `send`, `removeAllListeners`).
        *   Definir uma interface TypeScript (e.g., `ElectronIPC` como visto em `preload.ts`) para tipar fortemente esta API, garantindo type-safety no código do renderer.
    *   **Implementação do Método `on` no Preload:**
        *   **Padrão:** A função `on` exposta pelo `contextBridge` deve simplificar a assinatura do listener para o renderer. O listener no renderer deve receber apenas os argumentos de dados enviados pelo processo principal, e não o objeto `IpcRendererEvent`.
        *   **Exemplo (Preload):**
            ```typescript
            // // preload.ts
            // contextBridge.exposeInMainWorld('electronIPC', {
            //   // ... invoke, send ...
            //   on: (channel: string, listener: (...args: unknown[]) => void) => {
            //     const subscription = (_event: IpcRendererEvent, ...args: unknown[]) => listener(...args);
            //     ipcRenderer.on(channel, subscription);
            //     return () => ipcRenderer.removeListener(channel, subscription); // Função de unsubscribe
            //   },
            // });
            ```
        *   A função de `on` DEVE retornar uma função para remover o listener (unsubscribe), prevenindo memory leaks.
    *   **Justificativa:** Garante uma ponte segura e controlada entre o main e o renderer, minimizando a superfície de ataque e mantendo o isolamento de contexto. Tipagem forte e listeners simplificados melhoram a Developer Experience (DX) no renderer.

**2. Canais IPC (`shared/ipc-channels.ts`):**
    *   **Padrão:** Todos os nomes de canais IPC DEVEM ser definidos como constantes string (ou membros de um enum) em um arquivo centralizado, por exemplo, `src_refactored/shared/ipc-channels.ts`.
    *   **Nomenclatura de Canais:** Adotar um padrão consistente, como `OBJETO:AÇÃO` ou `FUNCIONALIDADE:EVENTO` (e.g., `"PROJECT:CREATE"`, `"CHAT:NEW_MESSAGE"`, `"APP_STATUS:IS_DEV"`). Usar letras maiúsculas e `snake_case` (ou `kebab-case` se preferido, mas ser consistente).
    *   **Justificativa:** Evita o uso de strings "mágicas" para nomes de canais, reduzindo erros de digitação e facilitando a refatoração e a busca por usos de um canal específico.

**3. Serialização de Dados e Tipos DTO (`shared/ipc-types/` ou similar):**
    *   **Padrão:** Todos os dados passados entre processos via IPC (argumentos para `invoke`/`send`, payloads para `on`) DEVEM ser serializáveis pelo [Structured Clone Algorithm](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm) (e.g., primitivas, objetos simples, arrays, `Date`, `RegExp`, `Map`, `Set`, `ArrayBuffer`, mas não funções, instâncias de classes complexas com métodos, ou DOM nodes).
    *   **DTOs (Data Transfer Objects):** Definir interfaces ou tipos TypeScript para todos os payloads de requisição e resposta de canais IPC. Estes DTOs devem residir em `src_refactored/shared/ipc-types/` ou em arquivos de tipo específicos de funcionalidade (e.g., `shared/ipc-chat.types.ts`).
    *   **Justificativa:** Garante que os dados possam ser transferidos de forma confiável entre processos. DTOs tipados fornecem clareza sobre a estrutura dos dados esperados e Habilitam type-safety em ambos os lados da comunicação IPC.

**4. Handlers IPC (Processo Principal - `handlers/*.handlers.ts`):**
    *   **Localização e Registro:**
        *   Consolidar todos os handlers IPC no diretório `src_refactored/presentation/electron/main/handlers/`.
        *   Cada funcionalidade principal (e.g., Project, DM, User) deve ter seu arquivo `*.handlers.ts`.
        *   Todas as funções de registro de handlers (e.g., `registerProjectHandlers`) DEVEM ser chamadas no `main.ts` (conforme ADR-023).
    *   **Estrutura de um Handler (`ipcMain.handle`):**
        1.  O primeiro argumento é `event: IpcMainInvokeEvent` (para `handle`) ou `event: IpcMainEvent` (para `on`).
        2.  Os argumentos subsequentes são os dados enviados pelo renderer.
        3.  **Validação de Entrada (OBRIGATÓRIO):** O handler DEVE validar o DTO de entrada recebido do renderer usando esquemas Zod (definidos junto com os tipos DTO em `shared/`). Se a validação falhar, o handler deve retornar/lançar um erro apropriado (que será encapsulado em `IUseCaseResponse.error` pelo Caso de Uso ou seu wrapper).
        4.  **Lógica de Negócios:** O handler DEVE delegar a lógica de negócios para um Caso de Uso ou Serviço de Aplicação apropriado, passando os dados validados.
        5.  **Resposta:** O handler DEVE retornar o resultado do Caso de Uso/Serviço (que já deve estar no formato `IUseCaseResponse`). O handler em si não precisa re-empacotar a resposta se o Caso de Uso/Serviço já o faz.
        6.  **Tratamento de Erro:** Erros lançados por Casos de Uso/Serviços (que devem ser `CoreError` ou subclasses) serão capturados pelo mecanismo de `invoke` e transmitidos ao renderer. O `UseCaseWrapper` (ADR-008, ADR-012) garante que esses erros sejam formatados corretamente no `IUseCaseResponse`.
    *   **Segurança:**
        *   Confiar no `contextIsolation` como principal mitigador contra chamadas maliciosas de renderers comprometidos.
        *   A validação rigorosa de todos os dados de entrada com Zod é a principal defesa do handler.
        *   Evitar executar operações privilegiadas ou de sistema diretamente com base em dados não validados do renderer.
    *   **Justificativa:** Estrutura clara para handlers, validação de entrada robusta, e delegação adequada para a camada de aplicação, mantendo os handlers enxutos e focados na comunicação.

**5. Interação IPC no Renderer (`IPCService.ts`, Hooks Customizados):**
    *   **`IPCService.ts` como Padrão:**
        *   O `IPCService` (singleton, localizado em `src_refactored/presentation/ui/services/`) DEVE ser a abstração primária usada pelo código da UI (componentes, outros hooks, serviços da UI) para interagir com o `window.electronIPC` exposto pelo preload.
        *   Ele fornece métodos tipados para canais específicos, encapsula a lógica de `invoke`/`on`/`send`, e padroniza o formato de resposta para `invoke` com `IPCResult<T>` (`{ success, data?, error? }`).
        *   Inclui uma implementação mock para ambientes não-Electron, facilitando testes e desenvolvimento.
    *   **Hooks Customizados (`useIpcQuery`, `useIpcMutation`, `useIpcSubscription`):**
        *   Estes hooks são o padrão para componentes React realizarem queries e mutações de dados via IPC.
        *   **CORREÇÃO NECESSÁRIA:** Estes hooks DEVEM ser refatorados para usar o `IPCService` ou chamar `window.electronIPC` diretamente e corretamente (o `window.electronIPC.invoke` exposto, não `window.electron.ipcRenderer.invoke`). A análise revelou uma inconsistência aqui.
        *   Eles gerenciam estados de UI comuns (loading, error, data) associados a operações IPC.
    *   **Justificativa:** Abstrai os detalhes da comunicação IPC do restante do código da UI, fornece uma API consistente e type-safe, gerencia estados de requisição e facilita testes.

**6. Tratamento de Erros na Cadeia IPC:**
    1.  **Handler (Main):** Caso de Uso/Serviço retorna `IUseCaseResponse` com `error` populado. Handler IPC repassa isso.
    2.  **`electronIPC.invoke` (Preload/Electron):** Se o handler no main lançar uma exceção não tratada (o que não deveria ocorrer se ele sempre retornar `IUseCaseResponse`), `invoke` no renderer irá rejeitar.
    3.  **`IPCService.invoke` (Renderer):** Captura rejeições de `electronIPC.invoke` e as normaliza para o formato `{ success: false, error: { message, name, stack } }` dentro do `IPCResult`.
    4.  **Hooks (`useIpcQuery`/`useIpcMutation`) (Renderer):** Recebem o `IPCResult` do `IPCService` e expõem o campo `error` para o componente UI.
    5.  **Componente UI:** Verifica o campo `error` e exibe feedback apropriado ao usuário (e.g., usando `toast`).
    *   **Justificativa:** Fluxo de erro padronizado e robusto da origem no main até a exibição na UI.

**Consequências:**
*   Comunicação IPC segura e bem definida entre processos.
*   Clareza nos contratos de dados e tipos em toda a pilha IPC.
*   Melhor testabilidade e manutenibilidade da lógica de IPC e dos componentes da UI que a utilizam.
*   Correção da inconsistência crítica no acesso à API do preload pelos hooks customizados.

---
**Notas de Implementação para LLMs:**
*   Sempre defina canais IPC em `shared/ipc-channels.ts`.
*   Para cada canal, defina tipos DTO de requisição/resposta em `shared/ipc-types/`.
*   No Preload (`preload.ts`): Exponha apenas os métodos `invoke`, `on`, `send` etc., através de um objeto único em `window.electronIPC`. Garanta que `on` retorne uma função de unsubscribe e que o listener receba apenas os dados.
*   Nos Handlers IPC (Main Process): Valide TODAS as entradas do renderer com Zod. Delegue para Casos de Uso/Serviços. Retorne `IUseCaseResponse`.
*   No Renderer Process (UI): Use o `ipcService` singleton. Para componentes React, use os hooks `useIpcQuery` e `useIpcMutation` (após sua correção para usar `ipcService` ou `window.electronIPC` corretamente).
*   Trate os estados `isLoading` e `error` fornecidos pelos hooks para dar feedback ao usuário.
