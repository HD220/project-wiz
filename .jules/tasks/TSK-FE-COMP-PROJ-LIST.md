# Tarefa: FE-COMP-PROJ-LIST - Implementar ProjectListPage

**ID da Tarefa:** `FE-COMP-PROJ-LIST`
**Título Breve:** Implementar `ProjectListPage` (projects/project-list-page.tsx equivalente).
**Descrição Completa:**
Reimplementar o componente/página `ProjectListPage` que exibe uma lista de todos os projetos aos quais o usuário tem acesso. Esta página deve incluir a capacidade de criar um novo projeto (geralmente através de um botão que abre um modal/dialog).

---

**Status:** `Pendente`
**Dependências (IDs):** `FE-SETUP-002 (Shadcn base), FE-COMP-UI-001, FE-COMP-UI-002, FE-COMP-PROJ-CARD` (Nota: FE-COMP-UI-* foram canceladas; a dependência real é em componentes base Shadcn/UI como Button, Card)
**Complexidade (1-5):** `3`
**Prioridade (P0-P4):** `P1` (Ponto de entrada para gerenciamento de projetos)
**Responsável:** `Frontend`
**Branch Git Proposta:** `feat/fe-comp-project-list`
**Commit da Conclusão (Link):**

---

## Critérios de Aceitação
- Componente `ProjectListPage.tsx` (ou estrutura de página similar) criado em `src_refactored/presentation/ui/features/project/pages/` (ou local apropriado).
- Exibe uma lista de componentes `ProjectCard` (de `FE-COMP-PROJ-CARD`) para cada projeto.
- Inclui um botão "Criar Novo Projeto" (usando `Button` do Shadcn/UI).
- A lógica para buscar a lista de projetos e para o fluxo de criação de novo projeto será tratada em tarefas de funcionalidade separadas (`FE-FEAT-PROJ-LIST`, `FE-FEAT-PROJ-CREATE`).

---

## Notas/Decisões de Design
- Página para listar projetos, botão de criar novo. (Nota original da tarefa)
- As dependências originais `FE-COMP-UI-*` foram canceladas; usar componentes Shadcn/UI diretamente.

---

## Comentários
- `(Data da migração): Tarefa migrada para novo formato.`

---

## Histórico de Modificações da Tarefa (Opcional)
-
