# Tarefa: FE-PAGE-USER-DM - Implementar Página de Mensagens Diretas

**ID da Tarefa:** `FE-PAGE-USER-DM`
**Título Breve:** Implementar Página de Mensagens Diretas (`(logged)/user/dm/$id/index.tsx` equivalente).
**Descrição Completa:**
Implementar a página que exibe uma conversa de mensagem direta (DM) específica com outro usuário ou agente. Esta página utilizará o componente `ChatThread` (definido em `FE-COMP-CHAT-THREAD`) e será renderizada dentro do layout da seção de usuário (`FE-LAYOUT-004`).

---

**Status:** `Pendente`
**Dependências (IDs):** `FE-LAYOUT-004`, `FE-COMP-CHAT-THREAD`
**Complexidade (1-5):** `3`
**Prioridade (P0-P4):** `P1` (Funcionalidade chave de comunicação)
**Responsável:** `Frontend`
**Branch Git Proposta:** `feat/fe-page-user-dm`
**Commit da Conclusão (Link):**

---

## Critérios de Aceitação
- Arquivo de rota/página dinâmico criado (ex: `src_refactored/presentation/ui/routes/(logged)/user/dm/$id/index.tsx`).
- A página extrai o ID da conversa/usuário da rota.
- A página renderiza o componente `ChatThread`, passando o ID da conversa para ele.
- A página é acessível através de rotas como `/user/dm/conversation-id-123` dentro do contexto autenticado.

---

## Notas/Decisões de Design
- Usa `ChatThread` component. (Nota original da tarefa)
- A lógica para buscar mensagens da conversa e enviar novas mensagens será tratada em `FE-FEAT-CHAT`.

---

## Comentários
- `(Data da migração): Tarefa migrada para novo formato.`

---

## Histórico de Modificações da Tarefa (Opcional)
-
