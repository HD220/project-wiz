# Tarefa: FE-LAYOUT-002 - Implementar Layout Principal Autenticado.

**ID da Tarefa:** `FE-LAYOUT-002`
**Título Breve:** Implementar Layout Principal Autenticado
**Descrição Completa:**
Implementar o layout principal para seções da aplicação que requerem autenticação (ex: `(logged)/_layout.tsx` ou uma rota de grupo similar na convenção do TanStack Router). Este layout normalmente incluirá elementos de navegação persistentes como uma sidebar principal (`AppSidebar`) e uma área de conteúdo onde as páginas específicas da seção autenticada serão renderizadas.

---

**Status:** `Pendente`
**Dependências (IDs):** `FE-LAYOUT-001` (Layout Raiz), `FE-COMP-SIDEBAR-APP` (Componente AppSidebar)
**Complexidade (1-5):** `3`
**Prioridade (P0-P4):** `P1` (Estrutura principal para usuários logados)
**Responsável:** `Frontend` (Originalmente, mas Jules pode iniciar)
**Branch Git Proposta:** `feat/fe-layout-auth`
**Commit da Conclusão (Link):**

---

## Critérios de Aceitação
- Arquivo de layout para seções autenticadas criado (ex: `src_refactored/presentation/ui/routes/(logged)/_layout.tsx`).
- O layout inclui o componente `AppSidebar` (ou seu placeholder).
- O layout inclui uma área principal de conteúdo que renderiza rotas filhas através de `<Outlet />`.
- Estrutura responsiva básica considerada.

---

## Notas/Decisões de Design
- Inclui `AppSidebar` e área de conteúdo principal. (Nota original da tarefa)
- O nome do arquivo/pasta `(logged)` é uma convenção comum para group routes no TanStack Router para aplicar um layout a um conjunto de rotas.

---

## Comentários
- `(Data da migração): Tarefa migrada para novo formato.`

---

## Histórico de Modificações da Tarefa (Opcional)
-
