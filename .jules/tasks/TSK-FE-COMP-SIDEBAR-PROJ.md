# Tarefa: FE-COMP-SIDEBAR-PROJ - Implementar ProjectSidebar

**ID da Tarefa:** `FE-COMP-SIDEBAR-PROJ`
**Título Breve:** Implementar `ProjectSidebar` (sidebar/project-sidebar.tsx equivalente).
**Descrição Completa:**
Reimplementar o componente `ProjectSidebar` na nova estrutura do frontend. Esta barra lateral é específica para a visualização de um projeto, mostrando o nome do projeto, navegação interna do projeto (ex: Visão Geral, Tarefas, Discussões) e uma lista de canais ou seções do projeto. Deve ser resizável.

---

**Status:** `Pendente`
**Dependências (IDs):** `FE-SETUP-002 (Shadcn base), FE-COMP-UI-008 (Sidebar base, ScrollArea, Collapsible)` (Nota: FE-COMP-UI-008 foi cancelada; a dependência real é em componentes base Shadcn/UI como Sidebar, ScrollArea, Collapsible)
**Complexidade (1-5):** `3`
**Prioridade (P0-P4):** `P1` (Navegação de projeto)
**Responsável:** `Frontend`
**Branch Git Proposta:** `feat/fe-comp-project-sidebar`
**Commit da Conclusão (Link):**

---

## Critérios de Aceitação
- Componente `ProjectSidebar.tsx` criado em `src_refactored/presentation/ui/features/project/components/` (ou local apropriado).
- Exibe o nome do projeto atual (dinamicamente).
- Contém links de navegação para as diferentes seções de um projeto.
- Exibe uma lista de canais/seções do projeto (dinamicamente).
- Funcionalidade de redimensionamento implementada (ex: usando componente Resizable do Shadcn/UI).
- Utiliza componentes base do Shadcn/UI (ex: para a base da sidebar, scroll, seções colapsáveis) conforme necessário.

---

## Notas/Decisões de Design
- Inclui nome do projeto, navegação específica do projeto, lista de canais.
- A dependência original `FE-COMP-UI-008` foi cancelada. A intenção é usar os componentes Shadcn/UI diretamente.

---

## Comentários
- `(Data da migração): Tarefa migrada para novo formato.`

---

## Histórico de Modificações da Tarefa (Opcional)
-
