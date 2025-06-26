# Tarefa: FE-IPC-CORE-ABSTR - Implementar camada de abstração useCore() para chamadas IPC.

**ID da Tarefa:** `FE-IPC-CORE-ABSTR`
**Título Breve:** Implementar camada de abstração `useCore()` para chamadas IPC.
**Descrição Completa:**
Implementar uma camada de abstração no frontend, similar ao hook `useCore()` existente na base de código antiga (`src/hooks/use-core.ts`), para encapsular as chamadas de comunicação entre processos (IPC) para o backend. Esta camada deve ser adaptada para as novas queries e casos de uso da arquitetura refatorada.

---

**Status:** `Em Andamento`
**Dependências (IDs):** `FE-SETUP-001` (Estrutura básica do frontend)
**Complexidade (1-5):** `2`
**Prioridade (P0-P4):** `P0` (Fundamental para a comunicação FE-BE)
**Responsável:** `Jules`
**Branch Git Proposta:** `feat/fe-ipc-core-abstraction`
**Commit da Conclusão (Link):**

---

## Critérios de Aceitação
- Hook customizado (ex: `useCore.ts` ou `useIPC.ts`) criado em `src_refactored/presentation/ui/hooks/useIPC.ts`. **(Concluído)**
- Camada de serviço de abstração IPC (`ipc.service.ts`) criada em `src_refactored/presentation/ui/services/`. **(Concluído)**
- O serviço/hook expõe funções para os canais IPC principais (`invoke`, `on`, `send`). **(Concluído)**
- Tipagem (`ipc.types.ts`) para a API exposta pelo preload e para os resultados de IPC foi definida. **(Concluído)**
- Facilita o uso de chamadas IPC nos componentes e hooks da UI de forma consistente. **(Concluído)**

---

## Notas/Decisões de Design
- A implementação foi dividida em:
    - `src_refactored/presentation/ui/services/ipc.types.ts`: Define a interface `IElectronIPC` que o preload script deverá expor (e.g., em `window.electronIPC`) e o tipo `IPCResult`.
    - `src_refactored/presentation/ui/services/ipc.service.ts`: Contém a classe `IPCService` que implementa a lógica de comunicação, acessando `window.electronIPC`. Inclui um fallback para um mock API caso o `window.electronIPC` não esteja disponível (útil para desenvolvimento/teste fora do Electron). Exporta um singleton `ipcService`.
    - `src_refactored/presentation/ui/hooks/useIPC.ts`: Um hook React simples que retorna o singleton `ipcService` para fácil consumo em componentes.
- A referência ao antigo `src/hooks/use-core.ts` não pôde ser usada pois o arquivo não foi encontrado.
- A implementação atual assume que um novo preload script será criado em `src_refactored/presentation/electron/preload/` e que ele exporá um objeto em `window.electronIPC` compatível com a interface `IElectronIPC`. A criação deste novo preload script não faz parte desta tarefa.
- O `shared/ipc-types.ts` existente parece mais focado na comunicação entre `worker` e `main`, então uma nova interface `IElectronIPC` mais genérica foi definida para a comunicação `renderer` <-> `main` via preload.

---

## Comentários
- `(Data da migração): Tarefa migrada para novo formato.`
- `(Data Atual): Iniciada a implementação da camada de abstração IPC. Definida a interface, serviço e hook.`

---

## Histórico de Modificações da Tarefa (Opcional)
-
