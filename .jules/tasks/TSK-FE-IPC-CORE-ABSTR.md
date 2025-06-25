# Tarefa: FE-IPC-CORE-ABSTR - Implementar camada de abstração useCore() para chamadas IPC.

**ID da Tarefa:** `FE-IPC-CORE-ABSTR`
**Título Breve:** Implementar camada de abstração `useCore()` para chamadas IPC.
**Descrição Completa:**
Implementar uma camada de abstração no frontend, similar ao hook `useCore()` existente na base de código antiga (`src/hooks/use-core.ts`), para encapsular as chamadas de comunicação entre processos (IPC) para o backend. Esta camada deve ser adaptada para as novas queries e casos de uso da arquitetura refatorada.

---

**Status:** `Pendente`
**Dependências (IDs):** `FE-SETUP-001` (Estrutura básica do frontend)
**Complexidade (1-5):** `2`
**Prioridade (P0-P4):** `P0` (Fundamental para a comunicação FE-BE)
**Responsável:** `Frontend`
**Branch Git Proposta:** `feat/fe-ipc-core-abstraction`
**Commit da Conclusão (Link):**

---

## Critérios de Aceitação
- Hook customizado (ex: `useCore.ts` ou `useIPC.ts`) criado em `src_refactored/presentation/ui/hooks/` ou `services/`.
- O hook expõe funções para cada canal IPC principal (ex: `invoke`, `on`, `send`).
- Tipagem adequada para os argumentos e retornos das chamadas IPC, alinhada com `shared/ipc-types.ts`.
- Facilita o uso de chamadas IPC nos componentes e hooks da UI de forma consistente.

---

## Notas/Decisões de Design
- Similar a `src/hooks/use-core.ts`, adaptado para novas queries/usecases. (Nota original da tarefa)
- Esta camada de abstração é crucial para desacoplar a UI dos detalhes da implementação do IPC e para fornecer um ponto central para logging, tratamento de erros comuns de IPC, etc.

---

## Comentários
- `(Data da migração): Tarefa migrada para novo formato.`

---

## Histórico de Modificações da Tarefa (Opcional)
-
