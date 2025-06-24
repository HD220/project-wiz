# Tarefa: FE-COMP-CHAT-MSG - Implementar ChatMessage

**ID da Tarefa:** `FE-COMP-CHAT-MSG`
**Título Breve:** Implementar `ChatMessage` (chat/chat-message.tsx equivalente).
**Descrição Completa:**
Reimplementar o componente `ChatMessage` para exibir uma única mensagem dentro de um feed de chat. Este componente deve mostrar o avatar do remetente, o nome do remetente, o timestamp da mensagem e o conteúdo da mensagem (que pode incluir Markdown).

---

**Status:** `Pendente`
**Dependências (IDs):** `FE-COMP-MARKDOWN` (para renderizar o conteúdo da mensagem), `FE-SETUP-002` (Shadcn/UI para Avatar, etc.)
**Complexidade (1-5):** `2`
**Prioridade (P0-P4):** `P1` (Componente essencial para chat)
**Responsável:** `Frontend`
**Branch Git Proposta:** `feat/fe-comp-chat-message`
**Commit da Conclusão (Link):**

---

## Critérios de Aceitação
- Componente `ChatMessage.tsx` criado em `src_refactored/presentation/ui/features/chat/components/` (ou local apropriado).
- Exibe o avatar do remetente (usando componente `Avatar` do Shadcn/UI).
- Exibe o nome do remetente.
- Exibe o timestamp da mensagem formatado de forma legível.
- Renderiza o conteúdo da mensagem usando o componente `MarkdownRenderer` (`FE-COMP-MARKDOWN`).
- Diferencia visualmente mensagens do usuário atual versus outros usuários (ex: alinhamento, cor de fundo).

---

## Notas/Decisões de Design
- A lógica de formatação de timestamp pode ser um utilitário separado.
- O componente `MarkdownRenderer` é uma dependência chave.

---

## Comentários
- `(Data da migração): Tarefa migrada para novo formato.`

---

## Histórico de Modificações da Tarefa (Opcional)
-
