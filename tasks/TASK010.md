# TASK010: Criar Módulo de Integração LLM (LLM-Integration)

## 📋 Descrição da Tarefa

Criar o módulo de integração com LLMs reimplementado seguindo a nova arquitetura, substituindo o módulo `llm-provider` atual por uma implementação limpa e extensível.

## 🎯 Objetivo

Implementar o módulo de integração com LLMs seguindo os princípios SOLID e DDD, com arquitetura extensível para múltiplos provedores e desacoplamento completo.

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

## 🔧 O que deve ser feito

### 1. Criar estrutura do módulo `modules/llm-integration/`

```
modules/llm-integration/
├── domain/
│   ├── entities/
│   │   ├── llm-provider.entity.ts
│   │   └── text-generation-request.entity.ts
│   ├── value-objects/
│   │   ├── provider-id.vo.ts
│   │   ├── provider-type.vo.ts
│   │   └── api-key.vo.ts
│   ├── services/
│   │   ├── provider-factory.service.ts
│   │   └── text-generation.service.ts
│   └── events/
│       ├── provider-configured.event.ts
│       └── text-generated.event.ts
├── application/
│   ├── commands/
│   │   ├── configure-provider.command.ts
│   │   └── generate-text.command.ts
│   ├── queries/
│   │   ├── get-provider.query.ts
│   │   └── list-providers.query.ts
│   └── handlers/
│       ├── configure-provider.handler.ts
│       └── generate-text.handler.ts
├── infrastructure/
│   ├── repositories/
│   │   └── llm-provider.repository.ts
│   ├── adapters/
│   │   ├── openai.adapter.ts
│   │   └── deepseek.adapter.ts
│   ├── services/
│   │   └── encryption.service.ts
│   └── mappers/
│       └── llm-provider.mapper.ts
└── presentation/
    └── ipc/
        └── llm-provider.handlers.ts
```

### 2. Implementar Domain Layer

- **LLM Provider Entity**: Entidade principal com validações
- **Text Generation Request**: Requests de geração de texto
- **Value Objects**: IDs e tipos tipados
- **Domain Services**: Lógica de negócio complexa
- **Domain Events**: Eventos de domínio

### 3. Implementar Application Layer

- **Commands**: Comandos para operações de escrita
- **Queries**: Consultas para operações de leitura
- **Handlers**: Handlers para comandos e queries
- **DTOs**: Data Transfer Objects

### 4. Implementar Infrastructure Layer

- **Repository**: Implementação concreta do repository
- **Adapters**: Adaptadores para diferentes provedores
- **Services**: Serviços de infraestrutura
- **Mappers**: Mapeamento entre domain e persistence

## 🎯 Como fazer

### Domain Layer

1. **LLMProvider Entity**:
   - Propriedades: id, name, type, apiKey, configuration, isActive
   - Métodos: activate(), deactivate(), updateConfiguration()
   - Validações: configuração válida, chave API válida
   - Eventos: ProviderConfigured, ProviderActivated

2. **Domain Services**:
   - ProviderFactoryService: Criação de provedores
   - TextGenerationService: Lógica de geração de texto

3. **Value Objects**:
   - ProviderId: ID tipado
   - ProviderType: Tipos permitidos (OpenAI, DeepSeek, etc.)
   - ApiKey: Chave API encriptada

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

1. **Adapters**:
   - OpenAIAdapter: Integração com OpenAI
   - DeepSeekAdapter: Integração com DeepSeek
   - Interface comum para todos os adapters

2. **Services**:
   - EncryptionService: Criptografia de chaves API
   - ConfigurationService: Validação de configurações

### Padrões a Seguir

- **Adapter Pattern**: Adaptadores para diferentes provedores
- **Factory Pattern**: Criação de provedores
- **Strategy Pattern**: Estratégias de geração
- **CQRS**: Separação de comandos e queries

## 🔍 O que considerar

### Princípios de Design

- **Extensibility**: Fácil adição de novos provedores
- **Security**: Criptografia de chaves API
- **Reliability**: Tolerância a falhas
- **Performance**: Geração eficiente de texto

### Boas Práticas

- **Rate Limiting**: Controle de taxa de requisições
- **Retry Logic**: Lógica de retry para falhas
- **Circuit Breaker**: Proteção contra falhas
- **Async Processing**: Processamento assíncrono

### Considerações Técnicas

- **Security**: Armazenamento seguro de chaves
- **Performance**: Otimização de requisições
- **Reliability**: Tratamento de falhas
- **Monitoring**: Monitoramento de uso

## ✅ Definição de Pronto

A tarefa estará completa quando:

1. ✅ Estrutura do módulo criada
2. ✅ Domain layer implementado
3. ✅ Application layer implementado
4. ✅ Infrastructure layer implementado
5. ✅ Comandos de qualidade executados sem erros

## 🧪 Checklist de Validação

### Estrutura do Módulo

- [ ] Pasta `modules/llm-integration/` criada
- [ ] Subpastas domain/, application/, infrastructure/, presentation/
- [ ] Arquivos de índice criados

### Domain Layer

- [ ] `LLMProvider` entity com comportamentos
- [ ] `TextGenerationRequest` entity
- [ ] `ProviderId` value object
- [ ] `ProviderType` value object
- [ ] `ApiKey` value object
- [ ] `ProviderFactoryService` domain service
- [ ] `TextGenerationService` domain service
- [ ] `ProviderConfigured` event
- [ ] `TextGenerated` event

### Application Layer

- [ ] `ConfigureProviderCommand` estruturado
- [ ] `GenerateTextCommand` estruturado
- [ ] `GetProviderQuery` estruturado
- [ ] `ListProvidersQuery` estruturado
- [ ] `ConfigureProviderHandler` implementado
- [ ] `GenerateTextHandler` implementado

### Infrastructure Layer

- [ ] `LLMProviderRepository` implementado
- [ ] `OpenAIAdapter` implementado
- [ ] `DeepSeekAdapter` implementado
- [ ] `EncryptionService` implementado
- [ ] `LLMProviderMapper` para conversões
- [ ] Esquema de banco atualizado

### Presentation Layer

- [ ] `LLMProviderIpcHandlers` implementados
- [ ] Integração com mediator
- [ ] Validação de entrada

### Integração e Qualidade

- [ ] Módulo registrado no sistema
- [ ] Integração com core components
- [ ] `npm run format` executado sem erros
- [ ] `npm run lint` executado sem erros
- [ ] `npm run type-check` executado sem erros

### Validação

- [ ] Entities funcionam corretamente
- [ ] Services funcionam corretamente
- [ ] Adapters funcionam corretamente
- [ ] Handlers funcionam corretamente
- [ ] Integração com provedores LLM funciona
- [ ] Criptografia funciona corretamente

## 🚨 Critérios de Aceitação

### Obrigatórios

- **Extensible**: Fácil adição de novos provedores
- **Secure**: Armazenamento seguro de chaves API
- **Reliable**: Tolerância a falhas
- **Maintainable**: Fácil de manter

### Desejáveis

- **Performance**: Geração eficiente de texto
- **Monitored**: Métricas de uso
- **Rate Limited**: Controle de taxa

## 📝 Observações

- **Substitua** o módulo `llm-provider` atual
- **Mantenha** compatibilidade com IPC existente
- **Implemente** criptografia robusta
- **Documente** cada adapter
- **Teste** cenários de falha

## 🔄 Próxima Tarefa

**TASK011**: Criar Módulo de Mensagens (Messaging) - Depende desta tarefa estar 100% completa
