# 8. Funcionalidade: Espaço Pessoal e DMs

**Versão:** 3.0  
**Status:** Design Final  
**Data:** 2025-01-17

---

## 🎯 Visão da Funcionalidade

O Espaço Pessoal é o hub central do usuário, independente de projetos. Ele oferece uma área para conversas privadas com os agentes de IA (Personas) e um local para gerenciar configurações globais da conta. A interface é projetada para ser limpa e focada, separando as interações pessoais das interações de projeto.

---

## 1. Mensagens Diretas (DMs)

As DMs permitem que o usuário tenha conversas 1-para-1 com qualquer Persona do sistema.

### Implementação Técnica

- **Backend**: A lógica reside no Bounded Context `conversations`.
  - O `MessageService` (`@/main/conversations/message.service.ts`) lida com o envio e o recebimento de mensagens.
  - O `dm-conversations.schema.ts` define a tabela que relaciona um usuário e um agente a uma conversa específica.
- **Frontend**: A UI é gerenciada pela feature `direct-messages`.
  - A rota é definida em `@/renderer/app/user/direct-messages/[conversation-id]/`.
  - O hook `use-direct-messages.ts` em `@/renderer/features/conversations/direct-messages/hooks/` gerencia o estado das conversas, buscando mensagens e enviando novas através da API IPC.

### Fluxo de Uso

1.  O usuário clica no ícone de Mensagens Diretas na sidebar principal.
2.  A UI exibe uma lista de conversas existentes com Personas.
3.  Ao selecionar uma conversa, o histórico de mensagens é carregado na área de chat.
4.  O usuário pode enviar uma mensagem, que é processada pelo `MessageService` e roteada para o `AgentWorker` correspondente, que então gera e envia uma resposta.

---

## 2. Configurações Globais

Esta seção permite ao usuário gerenciar configurações que se aplicam a toda a sua conta.

### Implementação Técnica

- **Backend**: A lógica pertence ao Bounded Context `user`.
  - O `ProfileService` (`@/main/user/profile/profile.service.ts`) contém os métodos para atualizar as preferências do usuário.
  - As preferências são armazenadas como um campo JSON na tabela `usersTable` (`@/main/user/authentication/users.schema.ts`).
- **Frontend**: A UI é gerenciada pela feature `user`.
  - A rota é definida em `@/renderer/app/user/settings/`.
  - Um hook `use-user-settings.ts` interage com a API IPC para buscar e salvar as configurações.

### Funcionalidades de Configuração

- **Gerenciamento de Tema**: Alternar entre os modos Dark e Light.
- **Gerenciamento de Notificações**: Configurar como o usuário recebe alertas.
- **Chaves de API**: Um local seguro para o usuário armazenar suas chaves de API para serviços de LLM (ex: OpenAI, DeepSeek). Essas chaves são armazenadas de forma segura no backend e nunca expostas diretamente ao frontend.
