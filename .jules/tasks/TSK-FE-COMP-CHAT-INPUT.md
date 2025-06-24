# Tarefa: FE-COMP-CHAT-INPUT - Implementar ChatInput

**ID da Tarefa:** `FE-COMP-CHAT-INPUT`
**Título Breve:** Implementar `ChatInput` (chat/chat-input.tsx equivalente).
**Descrição Completa:**
Reimplementar o componente `ChatInput` para a nova interface de chat. Este componente consiste em um campo de texto para digitar mensagens e um botão de envio. A lógica para o envio de mensagens (chamada IPC) será tratada em uma tarefa de funcionalidade separada, mas o componente deve estar preparado para acionar essa lógica.

---

**Status:** `Pendente`
**Dependências (IDs):** `FE-SETUP-002 (Shadcn base), FE-COMP-UI-001, FE-COMP-UI-004` (Nota: FE-COMP-UI-001 e FE-COMP-UI-004 foram canceladas; a dependência real é em componentes base Shadcn/UI como Button, Input/Textarea)
**Complexidade (1-5):** `2`
**Prioridade (P0-P4):** `P1` (Componente essencial para chat)
**Responsável:** `Frontend`
**Branch Git Proposta:** `feat/fe-comp-chat-input`
**Commit da Conclusão (Link):**

---

## Critérios de Aceitação
- Componente `ChatInput.tsx` criado em `src_refactored/presentation/ui/features/chat/components/` (ou local apropriado).
- Inclui um campo de texto (provavelmente `Textarea` do Shadcn/UI para múltiplas linhas) para entrada de mensagem.
- Inclui um botão de envio (`Button` do Shadcn/UI).
- O componente gerencia o estado do texto de entrada.
- Ao pressionar Enter (com modificador, ex: Shift+Enter para nova linha) ou clicar no botão de envio, uma função de callback `onSubmit` (a ser fornecida pelo componente pai) é chamada com o conteúdo da mensagem.
- O campo de texto é limpo após o envio.
- Considerações básicas de acessibilidade (labels, etc.).

---

## Notas/Decisões de Design
- Lógica para envio de mensagens (IPC) será tratada em `FE-FEAT-CHAT` ou tarefa similar.
- As dependências originais `FE-COMP-UI-001` e `FE-COMP-UI-004` foram canceladas. A intenção é usar os componentes Shadcn/UI diretamente.

---

## Comentários
- `(Data da migração): Tarefa migrada para novo formato.`

---

## Histórico de Modificações da Tarefa (Opcional)
-
