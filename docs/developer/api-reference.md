# APIs e Endpoints (api-reference.md)

Na arquitetura Electron, a comunicação entre o Frontend (Renderer Process) e o Backend (Main Process) não ocorre através de endpoints HTTP, mas sim por meio de **Canais de Comunicação Inter-Processos (IPC)**. O `ipcMain` (no backend) e o `ipcRenderer` (no frontend) são usados para enviar e receber mensagens de forma assíncrona.

Esta documentação descreve os canais IPC disponíveis, que funcionam como a "API" da aplicação.

---

## 1. Módulo de Gerenciamento de Projetos (`project-management`)

**Prefixo do Canal:** `project:`

| Canal             | Descrição                                            | Payload de Exemplo (Entrada)                   | Resposta Esperada (Saída) |
| :---------------- | :--------------------------------------------------- | :--------------------------------------------- | :------------------------ |
| `project:create`  | Cria um novo projeto.                                | `{ name: 'Novo Projeto', description: '...' }` | `ProjectDto`              |
| `project:list`    | Lista os projetos existentes, com filtros opcionais. | `{ status: 'active' }`                         | `ProjectDto[]`            |
| `project:getById` | Busca um projeto pelo seu ID.                        | `{ id: 'uuid-123' }`                           | `ProjectDto` ou `null`    |
| `project:update`  | Atualiza os dados de um projeto.                     | `{ id: 'uuid-123', name: 'Nome Atualizado' }`  | `ProjectDto`              |
| `project:delete`  | Remove um projeto permanentemente.                   | `{ id: 'uuid-123' }`                           | `void`                    |
| `project:archive` | Arquiva um projeto, marcando-o como inativo.         | `{ id: 'uuid-123' }`                           | `ProjectDto`              |

---

## 2. Módulo de Gerenciamento de Agentes (`agent-management`)

**Prefixo do Canal:** `agent:`

| Canal              | Descrição                       | Payload de Exemplo (Entrada)                        | Resposta Esperada (Saída) |
| :----------------- | :------------------------------ | :-------------------------------------------------- | :------------------------ |
| `agent:create`     | Cria um novo agente de IA.      | `{ name: 'Agente de Testes', role: 'Tester', ... }` | `AgentDto`                |
| `agent:update`     | Atualiza um agente existente.   | `{ id: 'uuid-123', temperature: 0.8 }`              | `AgentDto`                |
| `agent:getById`    | Busca um agente pelo ID.        | `{ id: 'uuid-123' }`                                | `AgentDto` ou `null`      |
| `agent:list`       | Lista todos os agentes.         | `{}`                                                | `AgentDto[]`              |
| `agent:listActive` | Lista apenas os agentes ativos. | `{}`                                                | `AgentDto[]`              |
| `agent:delete`     | Remove um agente.               | `{ id: 'uuid-123' }`                                | `{ success: true }`       |
| `agent:activate`   | Ativa um agente.                | `{ id: 'uuid-123' }`                                | `AgentDto`                |
| `agent:deactivate` | Desativa um agente.             | `{ id: 'uuid-123' }`                                | `AgentDto`                |

---

## 3. Módulo de Provedor de LLM (`llm-provider`)

**Prefixo do Canal:** `llm-provider:` e `ai:`

| Canal                     | Descrição                                    | Payload de Exemplo (Entrada)                  | Resposta Esperada (Saída)  |
| :------------------------ | :------------------------------------------- | :-------------------------------------------- | :------------------------- |
| `llm-provider:create`     | Adiciona um novo provedor de LLM.            | `{ name: 'OpenAI', apiKey: '...' }`           | `LlmProviderDto`           |
| `llm-provider:list`       | Lista os provedores configurados.            | `{}`                                          | `LlmProviderDto[]`         |
| `llm-provider:update`     | Atualiza um provedor.                        | `{ id: 'uuid-123', apiKey: 'new-key' }`       | `LlmProviderDto`           |
| `llm-provider:delete`     | Remove um provedor.                          | `{ id: 'uuid-123' }`                          | `void`                     |
| `llm-provider:getDefault` | Obtém o provedor padrão.                     | `{}`                                          | `LlmProviderDto` ou `null` |
| `llm-provider:setDefault` | Define um provedor como padrão.              | `{ id: 'uuid-123' }`                          | `LlmProviderDto`           |
| `ai:generate-text`        | Gera texto usando um provedor específico.    | `{ providerId: 'uuid-123', messages: [...] }` | `string` (resposta do LLM) |
| `ai:validate-provider`    | Verifica se a chave de um provedor é válida. | `{ providerId: 'uuid-123' }`                  | `boolean`                  |

---

## 4. Módulo de Comunicação (`communication`)

**Prefixo do Canal:** `channel:`

| Canal                   | Descrição                          | Payload de Exemplo (Entrada)                      | Resposta Esperada (Saída) |
| :---------------------- | :--------------------------------- | :------------------------------------------------ | :------------------------ |
| `channel:create`        | Cria um novo canal de comunicação. | `{ name: 'Canal Geral', projectId: 'uuid-proj' }` | `ChannelDto`              |
| `channel:listByProject` | Lista os canais de um projeto.     | `'uuid-proj'`                                     | `ChannelDto[]`            |
| `channel:getById`       | Busca um canal pelo ID.            | `'uuid-123'`                                      | `ChannelDto` ou `null`    |
| `channel:update`        | Atualiza um canal.                 | `{ id: 'uuid-123', name: 'Novo Nome' }`           | `ChannelDto`              |
| `channel:archive`       | Arquiva um canal.                  | `'uuid-123'`                                      | `ChannelDto`              |
| `channel:delete`        | Remove um canal.                   | `'uuid-123'`                                      | `void`                    |

---

## 5. Módulo de Mensagens de Canal (`channel-messaging`)

**Prefixo do Canal:** `channelMessage:`

| Canal                                 | Descrição                                         | Payload de Exemplo (Entrada)                                      | Resposta Esperada (Saída)                                          |
| :------------------------------------ | :------------------------------------------------ | :---------------------------------------------------------------- | :----------------------------------------------------------------- |
| `channelMessage:create`               | Envia uma nova mensagem para um canal.            | `{ channelId: 'uuid-123', content: 'Olá' }`                       | `ChannelMessageDto`                                                |
| `channelMessage:listByChannel`        | Lista mensagens de um canal com paginação.        | `'uuid-123', 50, 0`                                               | `ChannelMessagePaginationDto`                                      |
| `channelMessage:update`               | Atualiza o conteúdo de uma mensagem.              | `{ id: 'uuid-msg', content: 'Olá, mundo!' }`                      | `ChannelMessageDto`                                                |
| `channelMessage:delete`               | Remove uma mensagem.                              | `'uuid-msg'`                                                      | `void`                                                             |
| `channelMessage:ai:sendMessage`       | Envia uma mensagem para a IA em um canal.         | `{ channelId: 'uuid-123', content: '...', llmProviderId: '...' }` | `{ userMessage: ChannelMessageDto, aiMessage: ChannelMessageDto }` |
| `channelMessage:ai:regenerateMessage` | Pede para a IA gerar novamente a última resposta. | `{ channelId: 'uuid-123', llmProviderId: '...' }`                 | `ChannelMessageDto`                                                |

---

## 6. Módulo de Mensagens Diretas (`direct-messages`)

**Prefixo do Canal:** `dm:`

| Canal                          | Descrição                                             | Payload de Exemplo (Entrada)                      | Resposta Esperada (Saída)                               |
| :----------------------------- | :---------------------------------------------------- | :------------------------------------------------ | :------------------------------------------------------ |
| `dm:conversation:findOrCreate` | Encontra ou cria uma conversa com participantes.      | `{ participants: ['user-id', 'agent-id'] }`       | `ConversationDto`                                       |
| `dm:message:getByConversation` | Lista as mensagens de uma conversa.                   | `{ conversationId: 'uuid-conv' }`                 | `MessageDto[]`                                          |
| `dm:agent:sendMessage`         | Envia uma mensagem para um agente em uma conversa.    | `{ conversationId: 'uuid-conv', message: '...' }` | `{ userMessage: MessageDto, agentMessage: MessageDto }` |
| `dm:agent:regenerateResponse`  | Pede para o agente gerar novamente a última resposta. | `{ conversationId: 'uuid-conv' }`                 | `MessageDto`                                            |
