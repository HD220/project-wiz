# TASK009: Criar Módulo de Projetos (Project)

## 📋 Descrição da Tarefa

Criar o módulo de projetos reimplementado seguindo a nova arquitetura, substituindo o módulo `project-management` atual por uma implementação limpa e bem estruturada.

## 🎯 Objetivo

Implementar o módulo de projetos seguindo os princípios SOLID e DDD, com responsabilidades bem definidas e integração com o módulo de agentes.

## 📦 Dependências

- **TASK001** - Estrutura Base do Core (deve estar 100% completa)
- **TASK002** - Classes Base e Abstratas (deve estar 100% completa)
- **TASK003** - Sistema de Erros Padronizado (deve estar 100% completa)
- **TASK004** - Sistema de Logging Centralizado (deve estar 100% completa)
- **TASK005** - Sistema de Configuração e Validação (deve estar 100% completa)
- **TASK006** - Sistema de Eventos e Mediator (deve estar 100% completa)
- **TASK007** - Sistema de Persistência e Repositories (deve estar 100% completa)
- **TASK008** - Módulo de Agentes (deve estar 100% completa)

## 🔧 O que deve ser feito

### 1. Criar estrutura do módulo `modules/project/`

```
modules/project/
├── domain/
│   ├── entities/
│   │   ├── project.entity.ts
│   │   └── project-member.entity.ts
│   ├── value-objects/
│   │   ├── project-id.vo.ts
│   │   └── project-status.vo.ts
│   ├── services/
│   │   ├── project-creation.service.ts
│   │   └── project-member-management.service.ts
│   └── events/
│       ├── project-created.event.ts
│       ├── project-updated.event.ts
│       └── agent-added-to-project.event.ts
├── application/
│   ├── commands/
│   │   ├── create-project.command.ts
│   │   ├── update-project.command.ts
│   │   └── add-agent-to-project.command.ts
│   ├── queries/
│   │   ├── get-project.query.ts
│   │   ├── list-projects.query.ts
│   │   └── get-project-agents.query.ts
│   └── handlers/
│       ├── create-project.handler.ts
│       ├── get-project.handler.ts
│       └── add-agent-to-project.handler.ts
├── infrastructure/
│   ├── repositories/
│   │   ├── project.repository.ts
│   │   └── project-member.repository.ts
│   └── mappers/
│       └── project.mapper.ts
└── presentation/
    └── ipc/
        └── project.handlers.ts
```

### 2. Implementar Domain Layer

- **Project Entity**: Entidade principal com validações
- **Project Member**: Relacionamento projeto-agente
- **Value Objects**: IDs e status tipados
- **Domain Services**: Lógica de negócio complexa
- **Domain Events**: Eventos de domínio

### 3. Implementar Application Layer

- **Commands**: Comandos para operações de escrita
- **Queries**: Consultas para operações de leitura
- **Handlers**: Handlers para comandos e queries
- **DTOs**: Data Transfer Objects

### 4. Implementar Infrastructure Layer

- **Repository**: Implementação concreta dos repositories
- **Mappers**: Mapeamento entre domain e persistence
- **External Services**: Integrações externas

## 🎯 Como fazer

### Domain Layer

1. **Project Entity**:
   - Propriedades: id, name, description, status, createdAt, updatedAt
   - Métodos: activate(), deactivate(), addAgent(), removeAgent()
   - Validações: nome único, status válido
   - Eventos: ProjectCreated, ProjectUpdated, AgentAddedToProject

2. **Domain Services**:
   - ProjectCreationService: Lógica complexa de criação
   - ProjectMemberManagementService: Gestão de membros

3. **Value Objects**:
   - ProjectId: ID tipado
   - ProjectStatus: Status permitidos

### Application Layer

1. **Commands/Queries**:
   - Estruturas simples com dados necessários
   - Validação de entrada
   - Imutáveis

2. **Handlers**:
   - Uma única responsabilidade
   - Uso de repositories via interface
   - Publicação de eventos

### Padrões a Seguir

- **Domain-Driven Design**: Foco no domínio
- **CQRS**: Separação de comandos e queries
- **Event Sourcing**: Eventos de domínio
- **Repository Pattern**: Abstração de persistência

## 🔍 O que considerar

### Princípios de Design

- **Domain First**: Domínio é o centro da aplicação
- **Decoupling**: Camadas desacopladas
- **Maintainability**: Fácil de manter
- **Maintainability**: Fácil de manter

### Boas Práticas

- **Rich Domain Model**: Entidades ricas em comportamento
- **Immutable Objects**: Objetos imutáveis onde possível
- **Event-Driven**: Comunicação via eventos
- **Validation**: Validação em múltiplas camadas

### Considerações Técnicas

- **Performance**: Queries otimizadas
- **Concurrency**: Controle de concorrência
- **Transactions**: Transações apropriadas
- **Caching**: Cache estratégico

## ✅ Definição de Pronto

A tarefa estará completa quando:

1. ✅ Estrutura do módulo criada
2. ✅ Domain layer implementado
3. ✅ Application layer implementado
4. ✅ Infrastructure layer implementado
5. ✅ Comandos de qualidade executados sem erros

## 🧪 Checklist de Validação

### Estrutura do Módulo
- [ ] Pasta `modules/project/` criada
- [ ] Subpastas domain/, application/, infrastructure/, presentation/
- [ ] Arquivos de índice criados

### Domain Layer
- [ ] `Project` entity com comportamentos
- [ ] `ProjectMember` entity para relacionamentos
- [ ] `ProjectId` value object
- [ ] `ProjectStatus` value object
- [ ] `ProjectCreationService` domain service
- [ ] `ProjectMemberManagementService` domain service
- [ ] `ProjectCreated` event
- [ ] `ProjectUpdated` event
- [ ] `AgentAddedToProject` event

### Application Layer
- [ ] `CreateProjectCommand` estruturado
- [ ] `UpdateProjectCommand` estruturado
- [ ] `AddAgentToProjectCommand` estruturado
- [ ] `GetProjectQuery` estruturado
- [ ] `ListProjectsQuery` estruturado
- [ ] `GetProjectAgentsQuery` estruturado
- [ ] `CreateProjectHandler` implementado
- [ ] `GetProjectHandler` implementado
- [ ] `AddAgentToProjectHandler` implementado

### Infrastructure Layer
- [ ] `ProjectRepository` implementado
- [ ] `ProjectMemberRepository` implementado
- [ ] `ProjectMapper` para conversões
- [ ] Esquema de banco atualizado

### Presentation Layer
- [ ] `ProjectIpcHandlers` implementados
- [ ] Integração com mediator
- [ ] Validação de entrada

### Integração e Qualidade
- [ ] Módulo registrado no sistema
- [ ] Integração com módulo de agentes
- [ ] `npm run format` executado sem erros
- [ ] `npm run lint` executado sem erros
- [ ] `npm run type-check` executado sem erros

### Validação
- [ ] Entities funcionam corretamente
- [ ] Services funcionam corretamente
- [ ] Handlers funcionam corretamente
- [ ] Integração com módulo de agentes funciona
- [ ] Funcionalidades de projeto funcionam

## 🚨 Critérios de Aceitação

### Obrigatórios
- **Domain-Driven**: Implementação orientada pelo domínio
- **CQRS**: Separação clara de comandos e queries
- **Event-Driven**: Comunicação via eventos
- **Maintainable**: Fácil de manter

### Desejáveis
- **Performance**: Operações otimizadas
- **Scalable**: Escalável para múltiplos projetos
- **Auditable**: Auditoria de operações

## 📝 Observações

- **Substitua** o módulo `project-management` atual
- **Mantenha** compatibilidade com IPC existente
- **Implemente** validações robustas
- **Documente** regras de negócio
- **Teste** cenários complexos

## 🔄 Próxima Tarefa

**TASK010**: Criar Módulo de Integração LLM (LLM-Integration) - Depende desta tarefa estar 100% completa