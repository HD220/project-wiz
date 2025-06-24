# Tarefa: FE-LAYOUT-004 - Implementar Layout da Seção de Usuário.

**ID da Tarefa:** `FE-LAYOUT-004`
**Título Breve:** Implementar Layout da Seção de Usuário
**Descrição Completa:**
Implementar o layout específico para a seção de usuário da aplicação (ex: `(logged)/user/_layout.tsx` ou uma rota de grupo similar). Este layout, aninhado dentro do layout principal autenticado, pode incluir uma sidebar específica para configurações de usuário, perfil, DMs (`UserSidebar`), e a área de conteúdo para as páginas relacionadas ao usuário.

---

**Status:** `Pendente`
**Dependências (IDs):** `FE-LAYOUT-002` (Layout Principal Autenticado), `FE-COMP-SIDEBAR-USER` (Componente UserSidebar)
**Complexidade (1-5):** `3`
**Prioridade (P0-P4):** `P1` (Estrutura para funcionalidades de usuário)
**Responsável:** `Frontend` (Originalmente, mas Jules pode iniciar)
**Branch Git Proposta:** `feat/fe-layout-user-section`
**Commit da Conclusão (Link):**

---

## Critérios de Aceitação
- Arquivo de layout para a seção de usuário criado (ex: `src_refactored/presentation/ui/routes/(logged)/user/_layout.tsx`).
- O layout inclui o componente `UserSidebar` (ou seu placeholder), que deve ser resizável.
- O layout inclui uma área de conteúdo que renderiza rotas filhas específicas de usuário (ex: dashboard, DMs, guias) através de `<Outlet />`.

---

## Notas/Decisões de Design
- Inclui `UserSidebar` resizável e área de conteúdo do usuário. (Nota original da tarefa)

---

## Comentários
- `(Data da migração): Tarefa migrada para novo formato.`

---

## Histórico de Modificações da Tarefa (Opcional)
-
