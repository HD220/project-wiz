# TASK011: Criar Módulo de Mensagens (Messaging)

## 📋 Descrição da Tarefa

Criar o módulo de mensagens unificado que consolidará os módulos `channel-messaging`, `direct-messages` e `communication`, implementando uma arquitetura limpa e coesa.

## 🎯 Objetivo

Implementar um módulo unificado de mensagens que trate todos os tipos de comunicação (canais, mensagens diretas, conversas com IA) seguindo os princípios SOLID e DDD.

## 📦 Dependências

- **TASK001** - Estrutura Base do Core (deve estar 100% completa)
- **TASK002** - Classes Base e Abstratas (deve estar 100% completa)
- **TASK003** - Sistema de Erros Padronizado (deve estar 100% completa)
- **TASK004** - Sistema de Logging Centralizado (deve estar 100% completa)
- **TASK005** - Sistema de Configuração e Validação (deve estar 100% completa)
- **TASK006** - Sistema de Eventos e Mediator (deve estar 100% completa)
- **TASK007** - Sistema de Persistência e Repositories (deve estar 100% completa)
- **TASK008** - Módulo de Agentes (deve estar 100% completa)
- **TASK009** - Módulo de Projetos (deve estar 100% completa)
- **TASK010** - Módulo de Integração LLM (deve estar 100% completa)

## 🔧 O que deve ser feito

### 1. Criar estrutura do módulo `modules/messaging/`

```
modules/messaging/
├── domain/
│   ├── entities/
│   │   ├── channel.entity.ts
│   │   ├── message.entity.ts
│   │   ├── conversation.entity.ts
│   │   └── participant.entity.ts
│   ├── value-objects/
│   │   ├── channel-id.vo.ts
│   │   ├── message-id.vo.ts
│   │   ├── message-type.vo.ts
│   │   └── conversation-id.vo.ts
│   ├── services/
│   │   ├── message-routing.service.ts
│   │   ├── ai-chat.service.ts
│   │   └── typing-indicator.service.ts
│   └── events/
│       ├── message-sent.event.ts
│       ├── channel-created.event.ts
│       └── conversation-started.event.ts
├── application/
│   ├── commands/
│   │   ├── send-message.command.ts
│   │   ├── create-channel.command.ts
│   │   └── start-conversation.command.ts
│   ├── queries/
│   │   ├── get-messages.query.ts
│   │   ├── get-conversations.query.ts
│   │   └── get-channels.query.ts
│   └── handlers/
│       ├── send-message.handler.ts
│       ├── create-channel.handler.ts
│       └── get-messages.handler.ts
├── infrastructure/
│   ├── repositories/
│   │   ├── message.repository.ts
│   │   ├── channel.repository.ts
│   │   └── conversation.repository.ts
│   ├── services/
│   │   └── real-time-messaging.service.ts
│   └── mappers/
│       ├── message.mapper.ts
│       └── channel.mapper.ts
└── presentation/
    └── ipc/
        └── messaging.handlers.ts
```

### 2. Implementar Domain Layer

- **Channel Entity**: Canais de comunicação
- **Message Entity**: Mensagens universais
- **Conversation Entity**: Conversas privadas
- **Participant Entity**: Participantes em conversas
- **Value Objects**: IDs e tipos tipados
- **Domain Services**: Lógica de negócio complexa
- **Domain Events**: Eventos de domínio

### 3. Implementar Application Layer

- **Commands**: Comandos para operações de escrita
- **Queries**: Consultas para operações de leitura
- **Handlers**: Handlers para comandos e queries
- **DTOs**: Data Transfer Objects

### 4. Implementar Infrastructure Layer

- **Repository**: Implementação concreta dos repositories
- **Services**: Serviços de infraestrutura
- **Mappers**: Mapeamento entre domain e persistence

## 🎯 Como fazer

### Domain Layer

1. **Message Entity**:
   - Propriedades: id, content, type, senderId, channelId, conversationId, timestamp
   - Métodos: isFromAI(), isFromUser(), markAsRead()
   - Validações: conteúdo válido, tipo válido
   - Eventos: MessageSent, MessageRead

2. **Channel Entity**:
   - Propriedades: id, name, description, projectId, isPrivate, participants
   - Métodos: addParticipant(), removeParticipant(), archive()
   - Validações: nome único, projeto válido
   - Eventos: ChannelCreated, ParticipantAdded

3. **Conversation Entity**:
   - Propriedades: id, participants, type, lastMessageAt
   - Métodos: addMessage(), markAsRead(), archive()
   - Validações: participantes válidos
   - Eventos: ConversationStarted, ConversationEnded

4. **Domain Services**:
   - MessageRoutingService: Roteamento de mensagens
   - AIChatService: Integração com IA
   - TypingIndicatorService: Indicadores de digitação

### Application Layer

1. **Commands/Queries**:
   - Estruturas simples com dados necessários
   - Validação de entrada
   - Imutáveis

2. **Handlers**:
   - Uma única responsabilidade
   - Uso de repositories via interface
   - Publicação de eventos

### Infrastructure Layer

1. **Repositories**:
   - MessageRepository: Armazenamento de mensagens
   - ChannelRepository: Armazenamento de canais
   - ConversationRepository: Armazenamento de conversas

2. **Services**:
   - RealTimeMessagingService: Comunicação em tempo real

### Padrões a Seguir

- **Unified Model**: Modelo unificado para todos os tipos de mensagem
- **Event-Driven**: Comunicação via eventos
- **CQRS**: Separação de comandos e queries
- **Repository Pattern**: Abstração de persistência

## 🔍 O que considerar

### Princípios de Design

- **Unification**: Modelo unificado para messaging
- **Real-Time**: Comunicação em tempo real
- **Scalability**: Escalabilidade para muitas mensagens
- **Consistency**: Consistência entre diferentes tipos

### Boas Práticas

- **Message Ordering**: Ordenação de mensagens
- **Delivery Guarantees**: Garantias de entrega
- **Persistence**: Persistência confiável
- **Search**: Busca eficiente de mensagens

### Considerações Técnicas

- **Performance**: Queries otimizadas para mensagens
- **Real-Time**: WebSocket ou similar para tempo real
- **Storage**: Armazenamento eficiente de mensagens
- **Indexing**: Indexação para busca rápida

## ✅ Definição de Pronto

A tarefa estará completa quando:

1. ✅ Estrutura do módulo criada
2. ✅ Domain layer implementado
3. ✅ Application layer implementado
4. ✅ Infrastructure layer implementado
5. ✅ Comandos de qualidade executados sem erros

## 🧪 Checklist de Validação

### Estrutura do Módulo

- [ ] Pasta `modules/messaging/` criada
- [ ] Subpastas domain/, application/, infrastructure/, presentation/
- [ ] Arquivos de índice criados

### Domain Layer

- [ ] `Channel` entity com comportamentos
- [ ] `Message` entity com tipos
- [ ] `Conversation` entity para privadas
- [ ] `Participant` entity para participantes
- [ ] `ChannelId` value object
- [ ] `MessageId` value object
- [ ] `MessageType` value object
- [ ] `ConversationId` value object
- [ ] `MessageRoutingService` domain service
- [ ] `AIChatService` domain service
- [ ] `TypingIndicatorService` domain service
- [ ] `MessageSent` event
- [ ] `ChannelCreated` event
- [ ] `ConversationStarted` event

### Application Layer

- [ ] `SendMessageCommand` estruturado
- [ ] `CreateChannelCommand` estruturado
- [ ] `StartConversationCommand` estruturado
- [ ] `GetMessagesQuery` estruturado
- [ ] `GetConversationsQuery` estruturado
- [ ] `GetChannelsQuery` estruturado
- [ ] `SendMessageHandler` implementado
- [ ] `CreateChannelHandler` implementado
- [ ] `GetMessagesHandler` implementado

### Infrastructure Layer

- [ ] `MessageRepository` implementado
- [ ] `ChannelRepository` implementado
- [ ] `ConversationRepository` implementado
- [ ] `RealTimeMessagingService` implementado
- [ ] `MessageMapper` para conversões
- [ ] `ChannelMapper` para conversões
- [ ] Esquema de banco atualizado

### Presentation Layer

- [ ] `MessagingIpcHandlers` implementados
- [ ] Integração com mediator
- [ ] Validação de entrada

### Integração e Qualidade

- [ ] Módulo registrado no sistema
- [ ] Integração com módulos existentes
- [ ] `npm run format` executado sem erros
- [ ] `npm run lint` executado sem erros
- [ ] `npm run type-check` executado sem erros

### Validação

- [ ] Entities funcionam corretamente
- [ ] Services funcionam corretamente
- [ ] Handlers funcionam corretamente
- [ ] Integração com módulos existentes funciona
- [ ] Funcionalidades de mensagem funcionam

## 🚨 Critérios de Aceitação

### Obrigatórios

- **Unified**: Modelo unificado para messaging
- **Real-Time**: Comunicação em tempo real
- **Scalable**: Escalável para muitas mensagens
- **Maintainable**: Fácil de manter

### Desejáveis

- **Search**: Busca eficiente de mensagens
- **Offline**: Suporte a modo offline
- **Notifications**: Sistema de notificações

## 📝 Observações

- **Substitua** os módulos `channel-messaging`, `direct-messages` e `communication`
- **Mantenha** compatibilidade com IPC existente
- **Implemente** comunicação em tempo real
- **Documente** tipos de mensagem
- **Valide** cenários de concorrência

## 🔄 Próxima Tarefa

**TASK012**: Implementar Camada de Aplicação (Application Layer) - Depende desta tarefa estar 100% completa
