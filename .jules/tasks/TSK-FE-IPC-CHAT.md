# Tarefa: FE-IPC-CHAT - Definir e implementar IPC para Chat.

**ID da Tarefa:** `FE-IPC-CHAT`
**Título Breve:** Definir e implementar IPC para `chat:sendMessage` e listener `chat:streamEvent`.
**Descrição Completa:**
Definir e implementar os canais de comunicação entre processos (IPC) e os handlers no backend para a funcionalidade de chat. Isso inclui um canal para enviar mensagens (`chat:sendMessage`) e um canal ou evento para o frontend escutar e receber novas mensagens ou tokens de streaming (`chat:streamEvent` ou similar).

---

**Status:** `Pendente`
**Dependências (IDs):** `FE-IPC-CORE-ABSTR` (Camada de abstração IPC no frontend), (Backend) Lógica de processamento de chat no backend.
**Complexidade (1-5):** `2`
**Prioridade (P0-P4):** `P0` (Essencial para a funcionalidade de chat)
**Responsável:** `Frontend` (para as chamadas/listeners) e `Backend` (para os handlers)
**Branch Git Proposta:** `feat/fe-ipc-chat`
**Commit da Conclusão (Link):**

---

## Critérios de Aceitação
- Canal IPC `chat:sendMessage` definido em `shared/ipc-types.ts` para o envio de mensagens do frontend para o backend.
- Handler IPC para `chat:sendMessage` implementado no processo principal, que encaminha a mensagem para o serviço de chat do backend.
- Canal IPC ou mecanismo de evento (ex: `chat:streamEvent`, `chat:newMessage`) definido para o backend enviar mensagens/tokens para o frontend.
- O frontend (via `useCore()` ou similar) pode enviar mensagens usando `chat:sendMessage`.
- O frontend pode registrar um listener para `chat:streamEvent` (ou equivalente) para receber atualizações do chat.
- Tipagem para os payloads de mensagem definida.

---

## Notas/Decisões de Design
- A implementação exata do streaming de tokens e como o backend emite esses eventos precisará ser coordenada com a implementação do backend.

---

## Comentários
- `(Data da migração): Tarefa migrada para novo formato.`

---

## Histórico de Modificações da Tarefa (Opcional)
-
