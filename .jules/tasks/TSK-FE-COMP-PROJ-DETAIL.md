# Tarefa: FE-COMP-PROJ-DETAIL - Implementar ProjectDetailPage

**ID da Tarefa:** `FE-COMP-PROJ-DETAIL`
**Título Breve:** Implementar `ProjectDetailPage` (projects/project-detail-page.tsx equivalente).
**Descrição Completa:**
Reimplementar o componente/página `ProjectDetailPage` que serve como a visualização principal dos detalhes de um projeto. Esta página geralmente contém várias abas (Tabs) para diferentes aspectos do projeto, como Visão Geral, Tarefas, Discussões, Equipe, etc.

---

**Status:** `Pendente`
**Dependências (IDs):** `FE-SETUP-002 (Shadcn base), FE-COMP-UI-008 (Tabs), FE-COMP-PROJ-TABS` (Nota: FE-COMP-UI-008 foi cancelada; a dependência real é no componente Tabs do Shadcn/UI. `FE-COMP-PROJ-TABS` é uma tarefa para implementar o conteúdo dessas abas.)
**Complexidade (1-5):** `4`
**Prioridade (P0-P4):** `P1` (Visualização central de um projeto)
**Responsável:** `Frontend`
**Branch Git Proposta:** `feat/fe-comp-project-detail`
**Commit da Conclusão (Link):**

---

## Critérios de Aceitação
- Componente `ProjectDetailPage.tsx` (ou estrutura de página similar) criado em `src_refactored/presentation/ui/features/project/pages/` (ou local apropriado).
- Utiliza o componente `Tabs` do Shadcn/UI para organizar o conteúdo em abas (ex: Visão Geral, Tarefas, Discussões, Equipe).
- Cada aba renderiza o conteúdo correspondente (inicialmente podem ser placeholders, a serem preenchidos pela tarefa `FE-COMP-PROJ-TABS`).
- Exibe o nome do projeto e outras informações de cabeçalho relevantes.

---

## Notas/Decisões de Design
- Página principal de detalhes do projeto, com abas. (Nota original da tarefa)
- **Requer subdivisão:** A complexidade 4 indica que esta tarefa deve ser subdividida após esta migração de formato. As sub-tarefas podem focar em cada aba individualmente ou em aspectos específicos da página.
- A dependência original `FE-COMP-UI-008` foi cancelada; usar o componente Tabs do Shadcn/UI diretamente.

---

## Comentários
- `(Data da migração): Tarefa migrada para novo formato.`

---

## Histórico de Modificações da Tarefa (Opcional)
-
