# Tarefa: FE-IPC-PROJ-CREATE - Definir e implementar IPC para usecase:create-project.

**ID da Tarefa:** `FE-IPC-PROJ-CREATE`
**Título Breve:** Definir e implementar IPC para `usecase:create-project`.
**Descrição Completa:**
Definir e implementar o canal de comunicação entre processos (IPC) e o handler no backend para o caso de uso `usecase:create-project`. Este caso de uso será invocado pelo frontend para criar um novo projeto com os dados fornecidos pelo usuário.

---

**Status:** `Pendente`
**Dependências (IDs):** `FE-IPC-CORE-ABSTR` (Camada de abstração IPC no frontend), (Backend) Definição do caso de uso de criação de projeto.
**Complexidade (1-5):** `1`
**Prioridade (P0-P4):** `P1` (Necessário para criar projetos)
**Responsável:** `Frontend` (para a chamada) e `Backend` (para o handler)
**Branch Git Proposta:** `feat/fe-ipc-create-project`
**Commit da Conclusão (Link):**

---

## Critérios de Aceitação
- Canal IPC `usecase:create-project` definido em `shared/ipc-types.ts` (ou local compartilhado similar).
- Handler IPC implementado no processo principal do Electron que invoca o caso de uso de criação de projeto no backend com os dados recebidos (nome, descrição, etc.).
- A camada de abstração `useCore()` no frontend expõe uma função para chamar `usecase:create-project`.
- Tipagem para os argumentos da requisição (dados do novo projeto) e para a resposta (ex: o projeto criado ou um status de sucesso/erro) definida.

---

## Notas/Decisões de Design
- O backend precisa ter o caso de uso para criar projetos implementado.

---

## Comentários
- `(Data da migração): Tarefa migrada para novo formato.`

---

## Histórico de Modificações da Tarefa (Opcional)
-
