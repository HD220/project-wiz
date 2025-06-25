# Tarefa: FE-FEAT-PROJ-CREATE - Implementar fluxo de Criação de Projeto.

**ID da Tarefa:** `FE-FEAT-PROJ-CREATE`
**Título Breve:** Implementar fluxo de Criação de Projeto.
**Descrição Completa:**
Implementar a funcionalidade completa para criar um novo projeto. Isso inclui exibir um formulário (provavelmente em um Dialog/Modal do Shadcn/UI), coletar os dados do projeto (Nome, Descrição), chamar o endpoint IPC correspondente (`FE-IPC-PROJ-CREATE`) para criar o projeto no backend, e atualizar a UI (ex: invalidar a query da lista de projetos).

---

**Status:** `Pendente`
**Dependências (IDs):** `FE-PAGE-PROJ-LIST` (onde o botão de criar geralmente reside), `FE-SETUP-002` (Shadcn base para Dialog/Modal), `FE-SETUP-005` (RHF/Zod para o formulário), `FE-IPC-PROJ-CREATE` (definição do IPC)
**Complexidade (1-5):** `3`
**Prioridade (P0-P4):** `P1` (Funcionalidade central)
**Responsável:** `Frontend`
**Branch Git Proposta:** `feat/fe-feature-project-create`
**Commit da Conclusão (Link):**

---

## Critérios de Aceitação
- Um Dialog/Modal é exibido ao clicar no botão "Criar Novo Projeto".
- O Dialog contém um formulário com campos para Nome e Descrição do projeto.
- O formulário utiliza React Hook Form e Zod para gerenciamento de estado e validação.
- Ao submeter o formulário, a chamada IPC para `usecase:create-project` (definida em `FE-IPC-PROJ-CREATE`) é executada com os dados do formulário.
- Após a criação bem-sucedida, o Dialog é fechado e a lista de projetos é atualizada/invalidada.
- Feedback apropriado (sucesso/erro) é exibido ao usuário.

---

## Notas/Decisões de Design
- Dialog, Formulário (Nome, Descrição), chamada IPC via `useCore().usecase.createProject`. (Nota original da tarefa, adaptada para o nome do IPC)
- A dependência `FE-COMP-UI-003` (Dialog) foi cancelada; usar o componente Dialog do Shadcn/UI diretamente.

---

## Comentários
- `(Data da migração): Tarefa migrada para novo formato.`

---

## Histórico de Modificações da Tarefa (Opcional)
-
