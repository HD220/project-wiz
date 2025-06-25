# Tarefa: FE-IPC-PROJ-LIST - Definir e implementar IPC para query:get-projects.

**ID da Tarefa:** `FE-IPC-PROJ-LIST`
**Título Breve:** Definir e implementar IPC para `query:get-projects`.
**Descrição Completa:**
Definir e implementar o canal de comunicação entre processos (IPC) e o handler no backend para a query `query:get-projects`. Esta query será usada pelo frontend para buscar a lista de projetos do usuário.

---

**Status:** `Pendente`
**Dependências (IDs):** `FE-IPC-CORE-ABSTR` (Camada de abstração IPC no frontend), (Backend) Definição do serviço/repositório de projetos.
**Complexidade (1-5):** `1`
**Prioridade (P0-P4):** `P1` (Necessário para listar projetos)
**Responsável:** `Frontend` (para a chamada) e `Backend` (para o handler)
**Branch Git Proposta:** `feat/fe-ipc-get-projects`
**Commit da Conclusão (Link):**

---

## Critérios de Aceitação
- Canal IPC `query:get-projects` definido em `shared/ipc-types.ts` (ou local compartilhado similar).
- Handler IPC implementado no processo principal do Electron (main process) que busca os projetos do repositório apropriado.
- A camada de abstração `useCore()` no frontend expõe uma função para chamar `query:get-projects`.
- Tipagem para a requisição (se houver) e a resposta da lista de projetos definida.

---

## Notas/Decisões de Design
- O backend precisa ter a lógica de acesso a dados de projetos implementada.

---

## Comentários
- `(Data da migração): Tarefa migrada para novo formato.`

---

## Histórico de Modificações da Tarefa (Opcional)
-
