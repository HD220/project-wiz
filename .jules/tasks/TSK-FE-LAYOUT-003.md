# Tarefa: FE-LAYOUT-003 - Implementar Layout da Seção de Projeto.

**ID da Tarefa:** `FE-LAYOUT-003`
**Título Breve:** Implementar Layout da Seção de Projeto
**Descrição Completa:**
Implementar o layout específico para a seção de gerenciamento de projetos da aplicação (ex: `(logged)/project/_layout.tsx` ou uma rota de grupo similar). Este layout geralmente é aninhado dentro do layout principal autenticado e pode incluir uma sub-navegação ou sidebar específica para projetos (`ProjectSidebar`), além da área de conteúdo para as páginas de projeto.

---

**Status:** `Pendente`
**Dependências (IDs):** `FE-LAYOUT-002` (Layout Principal Autenticado), `FE-COMP-SIDEBAR-PROJ` (Componente ProjectSidebar)
**Complexidade (1-5):** `3`
**Prioridade (P0-P4):** `P1` (Estrutura chave para funcionalidade de projeto)
**Responsável:** `Frontend` (Originalmente, mas Jules pode iniciar)
**Branch Git Proposta:** `feat/fe-layout-project-section`
**Commit da Conclusão (Link):**

---

## Critérios de Aceitação
- Arquivo de layout para a seção de projetos criado (ex: `src_refactored/presentation/ui/routes/(logged)/project/_layout.tsx`).
- O layout inclui o componente `ProjectSidebar` (ou seu placeholder), que deve ser resizável.
- O layout inclui uma área de conteúdo que renderiza rotas filhas específicas de projeto através de `<Outlet />`.
- A navegação entre diferentes projetos e dentro de um projeto (ex: overview, tasks, discussions) é considerada na estrutura do layout.

---

## Notas/Decisões de Design
- Inclui `ProjectSidebar` resizável e área de conteúdo do projeto. (Nota original da tarefa)
- O nome do arquivo/pasta `(logged)/project` é uma convenção para group routes.

---

## Comentários
- `(Data da migração): Tarefa migrada para novo formato.`

---

## Histórico de Modificações da Tarefa (Opcional)
-
