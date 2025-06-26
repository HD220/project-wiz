# Tarefa: FE-COMP-CHAT-INPUT - Implementar ChatInput

**ID da Tarefa:** `FE-COMP-CHAT-INPUT`
**Título Breve:** Implementar `ChatInput` (chat/chat-input.tsx equivalente).
**Descrição Completa:**
Reimplementar o componente `ChatInput` para a nova interface de chat. Este componente consiste em um campo de texto para digitar mensagens e um botão de envio. A lógica para o envio de mensagens (chamada IPC) será tratada em uma tarefa de funcionalidade separada, mas o componente deve estar preparado para acionar essa lógica.

---

**Status:** `Concluído`
**Dependências (IDs):** `FE-SETUP-002 (Shadcn base)` (Componentes Shadcn/UI como Button, Textarea são usados diretamente)
**Complexidade (1-5):** `2`
**Prioridade (P0-P4):** `P1` (Componente essencial para chat)
**Responsável:** `Jules`
**Branch Git Proposta:** `feat/fe-comp-chat-input`
**Commit da Conclusão (Link):** `(Link para o commit no branch feat/fe-comp-chat-input)`

---

## Critérios de Aceitação
- Componente `ChatInput.tsx` criado em `src_refactored/presentation/ui/features/chat/components/ChatInput.tsx`. **(Concluído)**
- Inclui um campo de texto (`Textarea` do Shadcn/UI) para entrada de mensagem, com auto-resize. **(Concluído)**
- Inclui um botão de envio (`Button` do Shadcn/UI com ícone `SendHorizontal` ou `Mic`). **(Concluído)**
- O componente gerencia o estado do texto de entrada. **(Concluído)**
- Ao pressionar Enter (sem Shift) ou clicar no botão de envio, a função de callback `onSubmit` é chamada com o conteúdo da mensagem. **(Concluído)**
- O campo de texto é limpo após o envio. **(Concluído)**
- Considerações básicas de acessibilidade (placeholder, sr-only para botões de ícone). **(Concluído)**
- Input e botão são desabilitados quando `isLoading` é true. **(Concluído)**
- Placeholder para botão de anexo de arquivo. **(Concluído)**

---

## Notas/Decisões de Design
- Lógica para envio de mensagens (IPC) será tratada em `FE-FEAT-CHAT` ou tarefa similar.
- O componente utiliza `Textarea` para permitir múltiplas linhas e implementa uma funcionalidade de auto-resize para a altura do textarea com base no conteúdo, até um máximo de 5 linhas (aproximadamente 120px).
- A tecla Enter envia a mensagem, enquanto Shift+Enter permite criar uma nova linha.
- O botão de envio muda para um ícone de microfone (placeholder) quando o campo de texto está vazio, similar a algumas UIs de chat modernas.
- Adicionado um placeholder para botão de anexo de arquivo.

---

## Comentários
- `(Data da migração): Tarefa migrada para novo formato.`
- `(Data Atual): Implementado e submetido o componente ChatInput com manejo de estado, lógica de submissão (Enter/botão), auto-resize para o textarea e placeholders para ações adicionais. Commit link a ser atualizado após push.`

---

## Histórico de Modificações da Tarefa (Opcional)
-
