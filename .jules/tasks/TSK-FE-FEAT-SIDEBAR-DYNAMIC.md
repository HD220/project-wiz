# Tarefa: FE-FEAT-SIDEBAR-DYNAMIC - Implementar carregamento dinâmico de dados para sidebars.

**ID da Tarefa:** `FE-FEAT-SIDEBAR-DYNAMIC`
**Título Breve:** Implementar carregamento dinâmico de dados para sidebars.
**Descrição Completa:**
Implementar a lógica para carregar dinamicamente os dados exibidos nas sidebars, como a lista de projetos na `AppSidebar` (`FE-COMP-SIDEBAR-APP`) e a lista de canais/seções na `ProjectSidebar` (`FE-COMP-SIDEBAR-PROJ`), ou a lista de DMs na `UserSidebar` (`FE-COMP-SIDEBAR-USER`). Isso envolverá o uso do TanStack Query e chamadas IPC.

---

**Status:** `Pendente`
**Dependências (IDs):** `FE-COMP-SIDEBAR-PROJ`, `FE-COMP-SIDEBAR-USER`, `FE-SETUP-008` (TanStack Query), `FE-IPC-PROJ-LIST` (ou IPCs específicos para canais/DMs)
**Complexidade (1-5):** `3`
**Prioridade (P0-P4):** `P1`
**Responsável:** `Frontend`
**Branch Git Proposta:** `feat/fe-feature-sidebar-dynamic-data`
**Commit da Conclusão (Link):**

---

## Critérios de Aceitação
- `AppSidebar` busca e exibe a lista de projetos do usuário.
- `ProjectSidebar` busca e exibe a lista de canais/seções do projeto atual.
- `UserSidebar` busca e exibe a lista de DMs do usuário.
- TanStack Query é usado para gerenciar o estado desses dados (cache, atualização em background, etc.).
- Chamadas IPC apropriadas são feitas para buscar os dados.

---

## Notas/Decisões de Design
- Conforme Task 1.9.3 da análise original. (Nota original da tarefa)
- Os componentes de sidebar devem ser atualizados para consumir os hooks do TanStack Query.

---

## Comentários
- `(Data da migração): Tarefa migrada para novo formato.`

---

## Histórico de Modificações da Tarefa (Opcional)
-
