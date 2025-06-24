# Tarefa: FE-COMP-DASH-USER - Implementar UserDashboard

**ID da Tarefa:** `FE-COMP-DASH-USER`
**Título Breve:** Implementar `UserDashboard` (dashboard/user-dashboard.tsx equivalente).
**Descrição Completa:**
Reimplementar o componente `UserDashboard` que serve como a página principal do dashboard do usuário. Este componente agregará várias informações e funcionalidades relevantes para o usuário, como uma lista de atividades recentes (usando `ActivityListItem`), estatísticas, atalhos, etc.

---

**Status:** `Pendente`
**Dependências (IDs):** `FE-COMP-DASH-ACTIVITY`
**Complexidade (1-5):** `3`
**Prioridade (P0-P4):** `P1` (Página principal para usuários)
**Responsável:** `Frontend`
**Branch Git Proposta:** `feat/fe-comp-dash-user`
**Commit da Conclusão (Link):**

---

## Critérios de Aceitação
- Componente `UserDashboard.tsx` criado em `src_refactored/presentation/ui/features/dashboard/components/` (ou como uma página em `features/dashboard/pages/`).
- Renderiza uma lista de componentes `ActivityListItem` para exibir atividades recentes.
- Inclui placeholders ou seções para outras informações do dashboard (ex: estatísticas, gráficos, atalhos).
- Layout organizado e informativo.

---

## Notas/Decisões de Design
- Agrega atividades e outras informações relevantes para o usuário. (Nota original da tarefa)
- A fonte de dados para as atividades e outras informações será gerenciada por TanStack Query em tarefas de funcionalidade separadas.

---

## Comentários
- `(Data da migração): Tarefa migrada para novo formato.`

---

## Histórico de Modificações da Tarefa (Opcional)
-
