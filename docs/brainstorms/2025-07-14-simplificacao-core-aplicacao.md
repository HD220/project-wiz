# Brainstorm Session - Simplificação e Reorganização do Core da Aplicação

**Data:** 2025-07-14  
**Duração:** 13:00 - 14:30  
**Participantes:** Usuário, Claude Code

---

## Contexto

### Objetivo da Sessão

Simplificar e melhorar a organização do core da aplicação Project Wiz, que está muito complexo. Aplicar o princípio da responsabilidade única quebrando módulos em submódulos gerenciáveis para facilitar reorganização/refatoração/simplificação.

### Cenário Atual

O sistema possui 6 módulos principais com violações significativas do Single Responsibility Principle:

- `agent-management`: Mixing domain operations com validation de LLM providers
- `channel-messaging`: AIChatService fazendo 7+ responsabilidades diferentes
- `direct-messages`: AIMessageService com 6+ responsabilidades misturadas
- `llm-provider`: Dois serviços duplicados (AIService + TextGenerationService)
- `communication`: Channel management com default channel creation
- `project-management`: Bem estruturado (sem problemas graves)

### Motivação

A complexidade atual está dificultando manutenção e evolução do código. Há duplicação de responsabilidades, tight coupling, e mistura de concerns técnicos com domínios de negócio.

---

## Tópicos Discutidos

### Análise de Bounded Contexts vs Módulos Técnicos

**Descrição:** Identificação de que os módulos atuais estão organizados por concerns técnicos ao invés de domínios de negócio (DDD).

**Pontos Levantados:**

- Módulos como `channel-messaging`, `direct-messages`, `communication` são concerns técnicos
- Project Wiz é uma "Fábrica de Software Autônoma" com domínios de negócio específicos
- Necessidade de reorganizar por domínios: Projects, Agents, Users, LLM Infrastructure

**Considerações Técnicas:**

- Messaging/communication são mecanismos para conectar domínios, não domínios em si
- Agents têm infraestrutura própria (worker, queue, workflow) que está faltando ou espalhada

**Impactos Identificados:**

- Reorganização por domínios de negócio simplificará arquitetura
- Redução de duplicação e acoplamento entre módulos
- Melhoria na manutenibilidade e testabilidade

### Definição de Hierarquia de Domínios

**Descrição:** Definição da estrutura hierárquica baseada no negócio da aplicação.

**Pontos Levantados:**

- Projects como containers de colaboração (Git Repository, Channels, Forums, Participants)
- Agents como workers autônomos (Prompts, Worker, Queue, Workflow)
- Users como espaço pessoal (Configurations, DMs)
- LLM como infraestrutura compartilhada

**Considerações Técnicas:**

- Persona é apenas um conjunto de propriedades do Agent (name, role, goal, backstory)
- Messages aparecem em múltiplos contextos (Channels, Forums, DMs) mas podem compartilhar base comum
- Worker/Queue são infraestrutura de execução dos Agents

**Impactos Identificados:**

- Hierarquia natural e intuitiva alinhada com o modelo mental do usuário
- Reutilização de componentes como Message em diferentes contextos
- Separação clara entre espaço pessoal (User) e colaborativo (Projects)

### Aplicação de Object Calisthenics + DDD Pragmático

**Descrição:** Adoção de Object Calisthenics para tornar o código mais limpo e orientado a objeto, evitando over-engineering.

**Pontos Levantados:**

- Aplicação das 9 regras: um nível de indentação, sem ELSE, encapsular primitivos, etc.
- Entidades ricas com comportamento ao invés de anemic domain model
- Evitar CQRS, eventos complexos, muitas interfaces - foco em simplicidade

**Considerações Técnicas:**

- Value Objects para encapsular primitivos (ProjectName, ChannelName, etc.)
- First-class collections (Participants, Messages)
- Máximo 2 variáveis de instância por classe
- Sem getters/setters - apenas comportamentos

**Impactos Identificados:**

- Código mais expressivo e com menos bugs
- Entidades pequenas e focadas (≤50 linhas)
- Redução significativa de boilerplate

### Infraestrutura Transparente vs DI Rica

**Descrição:** Separação entre utilitários de infraestrutura (transparentes) e dependências de domínio (DI).

**Pontos Levantados:**

- Logger, validação Zod, database access não devem poluir DI
- Usar funções utilitárias: getLogger(context), getDatabase()
- DI apenas para dependências reais de domínio

**Considerações Técnicas:**

- Zod direto nos Value Objects para validação de estrutura
- Validações de regras de negócio nas entidades
- Pino para logging com contexto automático
- Drizzle para queries com possibilidade de troca de ORM

**Impactos Identificados:**

- Redução dramática de boilerplate de DI
- Foco em dependências que realmente importam para o negócio
- Flexibilidade para trocar componentes de infraestrutura

---

## Decisões Tomadas

### Decisão 1: Estrutura por Domínios de Negócio

**Descrição:** Reorganizar código por domínios de negócio ao invés de concerns técnicos  
**Justificativa:** Alinha código com modelo mental do usuário e facilita manutenção  
**Alternativas Consideradas:** Manter estrutura atual com refatoração incremental  
**Impacto:** Requer migração significativa mas resulta em arquitetura mais sustentável

### Decisão 2: Entidades Ricas + Object Calisthenics

**Descrição:** Adotar entidades ricas que fazem tudo que precisam + aplicar as 9 regras do Object Calisthenics  
**Justificativa:** Reduz complexidade, melhora expressividade e mantém simplicidade  
**Alternativas Consideradas:** Clean Architecture com múltiplas camadas, CQRS  
**Impacto:** Código mais simples, testável e orientado a objeto

### Decisão 3: Infraestrutura Transparente

**Descrição:** Utilitários como logger, database, validação Zod ficam transparentes (não passam por DI)  
**Justificativa:** Reduz boilerplate e foca DI em dependências de negócio reais  
**Alternativas Consideradas:** DI para tudo, Service Locator pattern  
**Impacto:** Menos código, mais foco no domínio

### Decisão 4: Separação de Camadas Conceituais

**Descrição:** Entidades ricas APENAS com regras de negócio + funções simples para persistência  
**Justificativa:** Persistência não deve estar misturada com regras de negócio  
**Alternativas Consideradas:** Entidades que fazem tudo, repositories com DI  
**Impacto:** Separação limpa de responsabilidades sem over-engineering

### Decisão 5: Crescimento Orgânico de Arquivos

**Descrição:** Começar com project.functions.ts, separar em create-project.ts, update-project.ts conforme cresce  
**Justificativa:** Evita over-engineering prematuro, organiza conforme necessidade real  
**Alternativas Consideradas:** Estrutura fixa desde o início  
**Impacto:** Código evolui naturalmente sem complexidade desnecessária

### Decisão 6: Eliminação de Métodos Estáticos

**Descrição:** Sem métodos estáticos em entidades ou value objects  
**Justificativa:** Evita tight coupling e facilita testes  
**Alternativas Consideradas:** Factory methods estáticos  
**Impacto:** Necessidade de definir padrões alternativos para criação

---

## Considerações e Observações

### Pontos de Atenção

- Migração deve ser incremental para não quebrar funcionalidades existentes
- Value Objects precisam ser consistentes entre todos os domínios
- Messages compartilhados entre contextos precisam de hierarquia bem definida
- Worker/Queue infrastructure dos Agents precisa ser implementada

### Questões em Aberto

- ✅ **RESOLVIDO:** Padrão para creation/finding - usar funções simples (create-project.ts, find-project.ts)
- Ordem de migração dos domínios (Projects → Agents → Users → LLM?)
- Como migrar dados existentes durante refatoração
- Strategy para deprecação gradual dos módulos atuais
- Testes durante a migração
- Padronização de Value Objects sem métodos estáticos

### Insights e Descobertas

- Persona é apenas propriedades do Agent, não entidade separada
- AIChatService e AIMessageService têm responsabilidades quase idênticas
- Project-management já segue boas práticas de SRP
- LLM provider module tem duplicação crítica (AIService + TextGenerationService)

---

## Artefatos e Referências

### Código Analisado

- `src/main/modules/agent-management/` - Violações de SRP identificadas
- `src/main/modules/channel-messaging/application/ai-chat.service.ts` - 7+ responsabilidades
- `src/main/modules/direct-messages/application/ai-message.service.ts` - 6+ responsabilidades
- `src/main/modules/llm-provider/application/` - Duplicação entre AIService e TextGenerationService
- `src/main/kernel/` - Dependency container e event bus complexos

### Documentação Consultada

- `CLAUDE.md` - Arquitetura atual e padrões
- `README.md` - Visão de produto e conceitos de negócio
- `docs/developer/product/SYSTEM_FEATURES.md` - Features e módulos do sistema

### Exemplos e Comparações

- Project-management module como referência de boa estrutura
- Violations patterns similares entre channel-messaging e direct-messages
- Event system duplication entre diferentes arquivos

---

## Anexos

### Estrutura Final Proposta

```
/domains
├── /projects
│   ├── project.entity.ts        # Entidade rica que faz tudo
│   ├── channel.entity.ts        # Entidade rica
│   ├── message.entity.ts        # Entidade rica
│   ├── project.finder.ts        # Queries complexas
│   ├── project.creator.ts       # Creation logic
│   └── /value-objects
│       ├── project-name.vo.ts
│       └── project-identity.vo.ts
├── /agents
│   ├── agent.entity.ts          # Entidade rica
│   ├── agent.worker.ts          # Worker execution
│   ├── agent.queue.ts           # Queue management
│   └── /value-objects
│       └── persona-properties.vo.ts
├── /users
│   ├── user.entity.ts           # Entidade rica
│   ├── user.preferences.ts      # User configurations
│   └── direct-message.entity.ts # DM handling
└── /llm
    ├── llm-provider.entity.ts   # Provider management
    ├── text-generation.ts       # Unified generation
    └── provider.registry.ts     # Provider registry
```

### Snippets de Código Relevantes

```typescript
// ✅ Value Object sem métodos estáticos
export class ProjectName {
  constructor(private readonly value: string) {
    ProjectNameSchema.parse(value.trim()); // Zod direto no constructor
  }

  toString(): string {
    return this.value;
  }
  equals(other: ProjectName): boolean {
    return this.value === other.value;
  }
}

// ✅ Entidade Rica - APENAS regras de negócio
export class Project {
  private logger = getLogger("Project");

  constructor(
    private identity: ProjectIdentity,
    private workspace: ProjectWorkspace,
  ) {}

  createChannel(name: ChannelName, creator: User): Channel {
    this.ensureUserCanCreateChannels(creator);
    return this.workspace.addChannel(name, creator);
  }

  inviteParticipant(user: User): void {
    this.ensureCanInvite(user);
    this.workspace.addParticipant(user);
  }
}

// ✅ Funções simples para persistência
// create-project.ts
export async function createProject(
  name: string,
  owner: User,
): Promise<Project> {
  const db = getDatabase();

  const projectName = new ProjectName(name);
  const identity = new ProjectIdentity(crypto.randomUUID(), projectName);
  const workspace = new ProjectWorkspace(owner);

  await db.insert(projectsTable).values({
    id: identity.id,
    name: projectName.toString(),
    ownerId: owner.id,
  });

  return new Project(identity, workspace);
}

// find-projects.ts
export async function findProjectById(id: string): Promise<Project | null> {
  const db = getDatabase();
  const result = await db
    .select()
    .from(projectsTable)
    .where(eq(projectsTable.id, id));
  return result.length ? mapToProject(result[0]) : null;
}
```

---

## Conclusões e Próximos Passos

### Principais Conquistas da Sessão

1. **Identificação clara dos problemas** - SRP violations críticas nos módulos atuais
2. **Definição de estrutura por domínios** - Projects, Agents, Users, LLM alinhados com negócio
3. **Padrão arquitetural definido** - DDD pragmático + Object Calisthenics + separação de camadas
4. **Resolução de questões críticas** - Eliminação de métodos estáticos e padrão de funções simples

### Benefícios Esperados

- **Manutenibilidade:** Código mais limpo e organizado por domínio
- **Testabilidade:** Entidades pequenas e funções focadas
- **Simplicidade:** Sem over-engineering, crescimento orgânico
- **Clareza:** Separação limpa entre regras de negócio e persistência

### Próximos Passos Recomendados

1. **Escolher domínio para migração piloto** (sugestão: Projects por ser mais maduro)
2. **Criar estrutura base** do domínio escolhido seguindo padrões definidos
3. **Migrar módulo atual** de forma incremental
4. **Validar padrões** com implementação real
5. **Replicar para outros domínios** baseado nos aprendizados

### Estratégia de Implementação

- **Incremental:** Migrar um domínio por vez
- **Paralela:** Manter módulos atuais funcionando durante migração
- **Validação:** Testar cada etapa antes de prosseguir
- **Documentação:** Atualizar padrões conforme implementação

### Riscos Identificados

- **Scope creep:** Evitar adicionar funcionalidades durante refatoração
- **Over-engineering:** Manter foco na simplicidade mesmo com pressão por padrões complexos
- **Breaking changes:** Garantir compatibilidade durante migração

---

### Links e Recursos

- [Object Calisthenics - 9 Rules](https://williamdurand.fr/2013/06/03/object-calisthenics/)
- [Domain-Driven Design Principles](https://martinfowler.com/bliki/DomainDrivenDesign.html)
- [Anemic Domain Model Anti-pattern](https://martinfowler.com/bliki/AnemicDomainModel.html)

---

**Status:** ✅ Brainstorm Completo  
**Documento:** Salvo em `/docs/brainstorms/2025-07-14-simplificacao-core-aplicacao.md`  
**Próxima ação:** Aguardando decisão sobre domínio piloto para migração
