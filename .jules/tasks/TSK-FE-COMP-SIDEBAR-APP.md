# Tarefa: FE-COMP-SIDEBAR-APP - Implementar AppSidebar

**ID da Tarefa:** `FE-COMP-SIDEBAR-APP`
**Título Breve:** Implementar `AppSidebar` (sidebar/app-sidebar.tsx equivalente).
**Descrição Completa:**
Reimplementar o componente `AppSidebar` na nova estrutura do frontend. Este componente é a barra lateral principal da aplicação, visível quando o usuário está logado, e contém links de navegação globais, uma lista de projetos do usuário e um botão para adicionar novos projetos.

---

**Status:** `Pendente`
**Dependências (IDs):** `FE-SETUP-002 (Shadcn base), FE-COMP-UI-008 (Tooltip, ScrollArea, Separator)` (Nota: FE-COMP-UI-008 foi cancelada; a dependência real é em componentes base Shadcn/UI como Tooltip, ScrollArea, Separator que serão usados diretamente)
**Complexidade (1-5):** `2`
**Prioridade (P0-P4):** `P1` (Navegação principal)
**Responsável:** `Frontend`
**Branch Git Proposta:** `feat/fe-comp-app-sidebar`
**Commit da Conclusão (Link):**

---

## Critérios de Aceitação
- Componente `AppSidebar.tsx` criado em `src_refactored/presentation/ui/components/layout/` (ou local apropriado).
- Links de navegação principais implementados (ex: Dashboard, Projetos, Configurações de Usuário).
- Funcionalidade para listar projetos do usuário (a fonte de dados será via IPC/TanStack Query em tarefa separada).
- Botão "Adicionar Projeto" presente (a funcionalidade do dialog/modal será tratada em tarefa separada).
- Utiliza componentes base do Shadcn/UI (ex: para scroll, tooltips, separadores) conforme necessário.
- Design responsivo básico considerado.

---

## Notas/Decisões de Design
- Inclui links de navegação, lista de projetos (dinâmica), botão "Adicionar Projeto".
- As dependências originais `FE-COMP-UI-001` e `FE-COMP-UI-008` foram canceladas. A intenção é usar os componentes Shadcn/UI diretamente. A dependência `FE-SETUP-002` (configuração do Shadcn/UI) é o pré-requisito principal.

---

## Comentários
- `(Data da migração): Tarefa migrada para novo formato.`

---

## Histórico de Modificações da Tarefa (Opcional)
-
