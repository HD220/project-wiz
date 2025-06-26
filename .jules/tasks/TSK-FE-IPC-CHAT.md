# Tarefa: FE-IPC-CHAT - Definir e implementar IPC para Chat.

**ID da Tarefa:** `FE-IPC-CHAT`
**Título Breve:** Definir e implementar IPC para `chat:sendMessage` e listener `chat:streamEvent`.
**Descrição Completa:**
Definir e implementar os canais de comunicação entre processos (IPC) e os handlers no backend para a funcionalidade de chat. Isso inclui um canal para enviar mensagens (`chat:sendMessage`) e um canal ou evento para o frontend escutar e receber novas mensagens ou tokens de streaming (`chat:streamEvent` ou similar).

---

**Status:** `Concluído`
**Dependências (IDs):** `FE-IPC-CORE-ABSTR` (Camada de abstração IPC no frontend), (Backend) Lógica de processamento de chat no backend (parcialmente mockado/placeholder nesta tarefa).
**Complexidade (1-5):** `2`
**Prioridade (P0-P4):** `P0` (Essencial para a funcionalidade de chat)
**Responsável:** `Jules`
**Branch Git Proposta:** `feat/fe-ipc-chat`
**Commit da Conclusão (Link):** `(Link para o commit no branch feat/fe-ipc-chat após o push)`

---

## Critérios de Aceitação
- Canais IPC `CHAT_SEND_MESSAGE` e `CHAT_STREAM_EVENT` definidos em `src_refactored/shared/ipc-channels.ts`. **(Concluído)**
- Tipos de payload (`ChatSendMessagePayload`, `ChatStreamEventPayload`) definidos em `src_refactored/shared/ipc-chat.types.ts`. **(Concluído)**
- Handler IPC para `CHAT_SEND_MESSAGE` implementado em `src_refactored/presentation/electron/main/ipc-chat.handlers.ts`. **(Concluído)**
    - Handler utiliza (placeholder) `ILLMAdapter` para simular streaming de resposta.
    - Handler envia eventos `CHAT_STREAM_EVENT` para o renderer.
- Frontend `IPCService` (`ipc.service.ts`) estendido com métodos `sendChatMessage` e `onChatStreamEvent`. **(Concluído)**
- O hook `useIPC` (`useIPC.ts`) permite acesso a estes novos métodos. **(Concluído)**
- Registro dos handlers no `main.ts` (`src_refactored/presentation/electron/main/main.ts`) criado. **(Concluído)**

---

## Notas/Decisões de Design
- A implementação exata do streaming de tokens e como o backend emite esses eventos precisará ser coordenada com a implementação do backend. Para esta tarefa, o handler IPC simula o streaming usando o `ILLMAdapter` (ou mock se não disponível) e envia eventos `ChatStreamEventPayload` definidos.
- A lógica completa de um `ChatService` no backend não foi implementada como parte desta tarefa; o handler IPC contém a lógica de interação com o `ILLMAdapter` diretamente por enquanto.
- A criação de um `preload.js` funcional para `src_refactored` é uma dependência externa a esta tarefa mas crucial para o funcionamento completo.

---

## Comentários
- `(Data da migração): Tarefa migrada para novo formato.`
- `(Data Atual): Implementação dos IPCs de Chat concluída e submetida. Definidos canais, tipos, handlers no main e extensões no serviço IPC do frontend.`

---

## Histórico de Modificações da Tarefa (Opcional)
-
