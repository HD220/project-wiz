# Tarefa: FE-FEAT-PROJ-LIST - Implementar lógica de exibição da Lista de Projetos.

**ID da Tarefa:** `FE-FEAT-PROJ-LIST`
**Título Breve:** Implementar lógica de exibição da Lista de Projetos.
**Descrição Completa:**
Implementar a lógica para buscar e exibir a lista de projetos na `ProjectListPage` (`FE-PAGE-PROJ-LIST`). Isso envolverá o uso do TanStack Query (`useQuery`) para chamar um endpoint IPC (a ser definido em `FE-IPC-PROJ-LIST`) que retorna os projetos do usuário. A lista de projetos deve ser invalidada ou atualizada quando novos projetos forem criados.

---

**Status:** `Pendente`
**Dependências (IDs):** `FE-PAGE-PROJ-LIST, FE-SETUP-008` (TanStack Query configurado), `FE-IPC-PROJ-LIST` (definição do IPC)
**Complexidade (1-5):** `2`
**Prioridade (P0-P4):** `P1` (Funcionalidade central)
**Responsável:** `Frontend`
**Branch Git Proposta:** `feat/fe-feature-project-list`
**Commit da Conclusão (Link):**

---

## Critérios de Aceitação
- Hook `useQuery` configurado na `ProjectListPage` (ou em um hook customizado) para buscar a lista de projetos.
- A chave de query (`queryKey`) é apropriada (ex: `['projects']`).
- A função de query chama o IPC correto para buscar os projetos.
- Os dados retornados são mapeados e passados para o componente `ProjectListPage` para renderização.
- Mecanismo de invalidação da query de projetos implementado para ser usado após a criação de um novo projeto.

---

## Notas/Decisões de Design
- Usar TanStack Query (`useQuery(['projects'], () => core.query.projects())`) e IPC para invalidar. (Nota original da tarefa, adaptada para o nome do IPC)
- A definição exata do endpoint IPC e seu contrato são definidos em `FE-IPC-PROJ-LIST`.

---

## Comentários
- `(Data da migração): Tarefa migrada para novo formato.`

---

## Histórico de Modificações da Tarefa (Opcional)
-
