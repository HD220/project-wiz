# Tarefa: FE-IPC-PROJ-LIST - Definir e implementar IPC para query:get-projects.

**ID da Tarefa:** `FE-IPC-PROJ-LIST`
**Título Breve:** Definir e implementar IPC para `query:get-projects`.
**Descrição Completa:**
Definir e implementar o canal de comunicação entre processos (IPC) e o handler no backend para a query `query:get-projects`. Esta query será usada pelo frontend para buscar a lista de projetos do usuário.

---

**Status:** `Em Andamento`
**Dependências (IDs):** `FE-IPC-CORE-ABSTR` (Camada de abstração IPC no frontend), (Backend) `ListProjectsUseCase` e suas dependências (repositório de projetos).
**Complexidade (1-5):** `1`
**Prioridade (P0-P4):** `P1` (Necessário para listar projetos)
**Responsável:** `Jules`
**Branch Git Proposta:** `feat/fe-ipc-get-projects`
**Commit da Conclusão (Link):**

---

## Critérios de Aceitação
- Canal IPC `PROJECT_LIST_QUERY` ('project:list') definido em `src_refactored/shared/ipc-channels.ts`. **(Concluído)**
- Tipos de payload (`ProjectListItem`, `ProjectListResponse`) definidos em `src_refactored/shared/ipc-project.types.ts`. **(Concluído)**
- Handler IPC para `PROJECT_LIST_QUERY` implementado em `src_refactored/presentation/electron/main/ipc-project.handlers.ts`. **(Concluído)**
    - Handler utiliza `ListProjectsUseCase` para buscar dados.
    - Mapeia entidades de domínio para DTOs `ProjectListItem`.
- Frontend `IPCService` (`ipc.service.ts`) estendido com o método `listProjects()`. **(Concluído)**
- O hook `useIPC` (`useIPC.ts`) permite acesso a este novo método. **(Concluído)**
- Handler registrado no `main.ts` (`src_refactored/presentation/electron/main/main.ts`). **(Concluído)**

---

## Notas/Decisões de Design
- O backend `ListProjectsUseCase` é utilizado para buscar os dados. A instanciação no handler IPC é feita via DI container (`appContainer`) com um fallback para instanciação manual (que é um placeholder e depende da configuração correta do DI e do banco de dados no processo principal).
- Os dados do projeto são mapeados para `ProjectListItem` para o frontend.

---

## Comentários
- `(Data da migração): Tarefa migrada para novo formato.`
- `(Data Atual): Implementado o IPC para listar projetos, incluindo definições de canal/tipo, handler no main e método no serviço IPC do frontend.`

---

## Histórico de Modificações da Tarefa (Opcional)
-
