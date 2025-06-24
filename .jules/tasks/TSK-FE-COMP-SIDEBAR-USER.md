# Tarefa: FE-COMP-SIDEBAR-USER - Implementar UserSidebar

**ID da Tarefa:** `FE-COMP-SIDEBAR-USER`
**Título Breve:** Implementar `UserSidebar` (sidebar/user-sidebar.tsx equivalente).
**Descrição Completa:**
Reimplementar o componente `UserSidebar` na nova estrutura do frontend. Esta barra lateral é para a seção do usuário, exibindo o nome do usuário, links de navegação para configurações de perfil, dashboard do usuário, lista de Mensagens Diretas (DMs), etc. Deve ser resizável.

---

**Status:** `Pendente`
**Dependências (IDs):** `FE-SETUP-002 (Shadcn base), FE-COMP-UI-008 (Sidebar base, ScrollArea)` (Nota: FE-COMP-UI-008 foi cancelada; a dependência real é em componentes base Shadcn/UI como Sidebar, ScrollArea)
**Complexidade (1-5):** `3`
**Prioridade (P0-P4):** `P1` (Navegação da seção do usuário)
**Responsável:** `Frontend`
**Branch Git Proposta:** `feat/fe-comp-user-sidebar`
**Commit da Conclusão (Link):**

---

## Critérios de Aceitação
- Componente `UserSidebar.tsx` criado em `src_refactored/presentation/ui/features/user/components/` (ou local apropriado).
- Exibe o nome do usuário atual (dinamicamente).
- Contém links de navegação para as diferentes seções do usuário (ex: Perfil, Dashboard, DMs).
- Exibe uma lista de DMs (a fonte de dados será via IPC/TanStack Query em tarefa separada).
- Funcionalidade de redimensionamento implementada.
- Utiliza componentes base do Shadcn/UI (ex: para a base da sidebar, scroll) conforme necessário.

---

## Notas/Decisões de Design
- Inclui nome do usuário, navegação do usuário, lista de DMs.
- A dependência original `FE-COMP-UI-008` foi cancelada. A intenção é usar os componentes Shadcn/UI diretamente.

---

## Comentários
- `(Data da migração): Tarefa migrada para novo formato.`

---

## Histórico de Modificações da Tarefa (Opcional)
-
