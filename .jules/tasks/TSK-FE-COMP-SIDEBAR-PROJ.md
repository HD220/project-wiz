# Tarefa: FE-COMP-SIDEBAR-PROJ - Implementar ProjectSidebar

**ID da Tarefa:** `FE-COMP-SIDEBAR-PROJ`
**Título Breve:** Implementar `ProjectSidebar` (sidebar/project-sidebar.tsx equivalente).
**Descrição Completa:**
Reimplementar o componente `ProjectSidebar` na nova estrutura do frontend. Esta barra lateral é específica para a visualização de um projeto, mostrando o nome do projeto, navegação interna do projeto (ex: Visão Geral, Tarefas, Discussões) e uma lista de canais ou seções do projeto. Deve ser resizável.

---

**Status:** `Em Andamento`
**Dependências (IDs):** `FE-SETUP-002 (Shadcn base)` (Componentes Shadcn/UI como ScrollArea, Collapsible, Button, Separator são usados diretamente. Resizable functionality will depend on parent using ResizablePanel.)
**Complexidade (1-5):** `3`
**Prioridade (P0-P4):** `P1` (Navegação de projeto)
**Responsável:** `Jules`
**Branch Git Proposta:** `feat/fe-comp-project-sidebar`
**Commit da Conclusão (Link):**

---

## Critérios de Aceitação
- Componente `ProjectSidebar.tsx` criado em `src_refactored/presentation/ui/features/project/components/ProjectSidebar.tsx`. **(Concluído)**
- Exibe o nome do projeto atual (placeholder, dados dinâmicos virão depois). **(Concluído)**
- Contém links de navegação para as diferentes seções de um projeto (Overview, Tasks, Discussions, Files, Settings) usando TanStack Router `<Link>` e `lucide-react` icons. **(Concluído)**
- Exibe uma lista de canais/seções do projeto (placeholder, dados dinâmicos virão depois) usando `Collapsible`. **(Concluído)**
- Funcionalidade de redimensionamento: O componente é estruturado para ser colocado dentro de um `ResizablePanel` de Shadcn/UI (que usa `react-resizable-panels`). A implementação do grupo resizable é externa a este componente. **(Considerado Concluído para escopo do componente)**
- Utiliza componentes base do Shadcn/UI (`ScrollArea`, `Collapsible`, `Button`, `Separator`). **(Concluído)**

---

## Notas/Decisões de Design
- O componente `ProjectSidebar` é projetado para ser o conteúdo de um painel redimensionável. A lógica de `ResizablePanelGroup` e `ResizableHandle` será implementada em um componente de layout pai.
- Nome do projeto e lista de canais são placeholders. A integração com dados reais (via IPC/TanStack Query) será feita em tarefas futuras.
- Links de navegação usam TanStack Router e são parametrizados com um `projectId` (placeholder).
- Ícones de `lucide-react` são usados para melhorar a interface.

---

## Comentários
- `(Data da migração): Tarefa migrada para novo formato.`
- `(Data Atual): Implementada a estrutura básica do ProjectSidebar com placeholders, navegação e seções colapsáveis.`

---

## Histórico de Modificações da Tarefa (Opcional)
-
