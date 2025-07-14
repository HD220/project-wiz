# Requirements - Simplificação e Reorganização do Core da Aplicação

**Data:** 2025-07-14  
**Status:** 📋 Planejamento  
**Domínio:** Core Architecture  
**Brainstorm Base:** [2025-07-14-simplificacao-core-aplicacao.md](../../brainstorms/2025-07-14-simplificacao-core-aplicacao.md)

---

## Visão Geral

### Objetivo Principal
Simplificar e reorganizar a arquitetura central do Project Wiz através de:
- Aplicação rigorosa de Object Calisthenics (9 regras)
- Reorganização por domínios de negócio (DDD pragmático)
- Entidades ricas com comportamento ao invés de anemic domain model
- Infraestrutura transparente (sem dependency injection para utilitários)
- Eliminação de violações do Single Responsibility Principle

### Problemas Identificados na Codebase Atual

#### Violações de Object Calisthenics
1. **Indentação Profunda (>1 nível)**
   - `src/main/modules/agent-management/application/agent.service.ts:35-74`
   - Múltiplos níveis de if/else aninhados

2. **Métodos Longos (>10 linhas)**
   - `AgentService.createAgent()`: 58 linhas
   - `AIMessageService.processUserMessage()`: 113 linhas
   - `AIChatService.sendUserMessage()`: 101 linhas

3. **Classes com Muitas Variáveis de Instância (>2)**
   - `AIMessageService`: 4 dependências
   - Maioria dos services violam a regra

4. **Parâmetros Primitivos ao invés de Value Objects**
   - Strings para IDs, nomes, conteúdo em todos os métodos
   - Falta de encapsulamento de primitivos

#### Violações de Single Responsibility Principle
1. **AgentService** (185 linhas) mistura:
   - CRUD de agentes
   - Validação de LLM providers
   - Publicação de eventos
   - Gerenciamento de agentes padrão

2. **AIMessageService** mistura:
   - Processamento de mensagens
   - Gerenciamento de conversas
   - Lookup de agentes
   - Geração de respostas de IA

3. **AIChatService** mistura:
   - Gerenciamento de mensagens de canal
   - Integração com IA
   - Validação de canais
   - Estado de digitação

#### Bounded Contexts Inadequados
- Módulos organizados por concerns técnicos (`channel-messaging`, `direct-messages`)
- Domínios de negócio espalhados (`Projects`, `Agents`, `Users`, `LLM`)
- Falta de hierarquia natural alinhada com modelo mental do usuário

---

## Requisitos Funcionais

### RF001 - Reorganização por Domínios de Negócio
**Como** desenvolvedor  
**Eu quero** que o código seja organizado por domínios de negócio  
**Para que** a arquitetura reflita o modelo mental do usuário e facilite manutenção

**Critérios de Aceite:**
- [ ] Estrutura `/domains` criada com subdomínios: `projects`, `agents`, `users`, `llm`
- [ ] Módulos técnicos (`channel-messaging`, `direct-messages`) migrados para domínios apropriados
- [ ] Hierarquia natural: Projects como containers, Agents como workers, Users como espaço pessoal
- [ ] LLM como infraestrutura compartilhada

### RF002 - Entidades Ricas com Object Calisthenics
**Como** desenvolvedor  
**Eu quero** que as entidades tenham comportamento próprio seguindo Object Calisthenics  
**Para que** o código seja mais expressivo e com menos bugs

**Critérios de Aceite:**
- [ ] Máximo 1 nível de indentação por método
- [ ] Máximo 2 variáveis de instância por classe
- [ ] Métodos com máximo 10 linhas
- [ ] Sem uso de ELSE (early returns, guard clauses)
- [ ] Primitivos encapsulados em Value Objects
- [ ] First-class collections (Participants, Messages)
- [ ] Sem getters/setters - apenas comportamentos
- [ ] Máximo 50 linhas por classe

### RF003 - Value Objects para Primitivos
**Como** desenvolvedor  
**Eu quero** que primitivos sejam encapsulados em Value Objects  
**Para que** tenhamos validação automática e expressividade no código

**Critérios de Aceite:**
- [ ] `ProjectName` criado com validação
- [ ] `Temperature` para LLM criado
- [ ] Validação Zod nos construtores dos Value Objects
- [ ] Métodos `equals()`, `toString()` implementados
- [ ] Imutabilidade garantida

### RF004 - Funções Simples para Persistência
**Como** desenvolvedor  
**Eu quero** funções simples para operações de persistência  
**Para que** evitemos over-engineering e mantenhamos simplicidade

**Critérios de Aceite:**
- [ ] `create-project.ts`, `find-project.ts`, `update-project.ts` criados
- [ ] `create-agent.ts`, `find-agent.ts`, `update-agent.ts` criados
- [ ] Funções focadas em uma única operação
- [ ] Sem métodos estáticos em entidades
- [ ] Acesso transparente ao banco via `getDatabase()`

### RF005 - Infraestrutura Transparente
**Como** desenvolvedor  
**Eu quero** que infraestrutura seja transparente (sem DI)  
**Para que** o foco seja nas dependências de negócio reais

**Critérios de Aceite:**
- [ ] `getLogger(context)` para logging
- [ ] `getDatabase()` para acesso ao banco
- [ ] Validação Zod direta nos Value Objects
- [ ] DI apenas para dependências de domínio
- [ ] Utilitários não passam por DI

---

## Requisitos Não-Funcionais

### RNF001 - Manutenibilidade
- Código organizado por domínio deve facilitar localização de funcionalidades
- Entidades pequenas (≤50 linhas) devem ser mais fáceis de entender
- Separação clara entre regras de negócio e persistência

### RNF002 - Manutenibilidade
- Entidades ricas devem ser compreensíveis independentemente
- Funções simples devem ser facilmente modificáveis
- Value Objects devem ter validação clara e direta

### RNF003 - Performance
- Reorganização não deve impactar performance atual
- Value Objects devem ser leves e eficientes
- Acesso transparente ao banco não deve adicionar overhead

### RNF004 - Compatibilidade
- Migração deve ser incremental sem quebrar funcionalidades
- APIs existentes devem continuar funcionando durante transição
- Frontend deve ser compatível com nova estrutura

---

## Dependências Identificadas

### Módulos Externos
- **Drizzle ORM**: Persistência de dados (`src/main/persistence/`)
- **Zod**: Validação (`src/shared/utils/validation.utils.ts`)
- **Event System**: Comunicação entre domínios (`src/main/kernel/event-bus.ts`)
- **IPC System**: Comunicação Main/Renderer (`src/main/kernel/ipc-handler-utility.ts`)

### Módulos Internos Afetados
- **agent-management**: Reestruturação completa para domínio `agents`
- **channel-messaging**: Migração para domínio `projects`
- **direct-messages**: Migração para domínio `users`
- **llm-provider**: Reestruturação para domínio `llm`
- **communication**: Integração com domínio `projects`
- **project-management**: Extensão para domínio `projects` completo

### Frontend Dependencies
- **Zustand Stores**: Adaptação para nova estrutura de domínios
- **TanStack Query**: Atualização para novos endpoints
- **Components**: Adaptação para novos tipos e interfaces

---

## Riscos e Mitigações

### Risco Alto: Scope Creep
**Problema**: Adicionar funcionalidades durante refatoração  
**Mitigação**: Manter foco estrito na reorganização, documentar novas funcionalidades para depois  
**Responsável**: Tech Lead  

### Risco Alto: Breaking Changes
**Problema**: Quebrar funcionalidades existentes durante migração  
**Mitigação**: Migração incremental, validação manual, manter APIs antigas temporariamente  
**Responsável**: QA + Development Team  

### Risco Médio: Over-engineering
**Problema**: Aplicar padrões complexos desnecessários  
**Mitigação**: Foco em simplicidade, Object Calisthenics como guia, code reviews rigorosos  
**Responsável**: Architecture Team  

### Risco Médio: Inconsistência de Value Objects
**Problema**: Value Objects diferentes entre domínios para conceitos similares  
**Mitigação**: Definir padrões claros, shared value objects quando apropriado  
**Responsável**: Architecture Team  

---

## Impactos no Sistema

### Positivos
- **Manutenibilidade**: Código mais limpo e organizado
- **Simplicidade**: Entidades pequenas e focadas
- **Expressividade**: Value Objects tornam código mais legível
- **Simplicidade**: Menos boilerplate de DI
- **Alinhamento**: Código reflete modelo mental do usuário

### Negativos Temporários
- **Complexidade de Migração**: Período de transição com duas estruturas
- **Curva de Aprendizado**: Equipe precisa se adaptar aos novos padrões
- **Tempo de Desenvolvimento**: Período inicial mais lento devido à reorganização

### Neutros
- **Performance**: Sem impacto significativo esperado
- **Funcionalidades**: Mesmas capacidades, organização diferente

---

## Critérios de Sucesso

### Quantitativos
- [ ] 90% dos métodos com ≤10 linhas
- [ ] 95% das classes com ≤2 variáveis de instância
- [ ] 100% dos primitivos encapsulados em Value Objects onde apropriado
- [ ] 0 níveis de indentação >1 por método
- [ ] 100% das entidades com ≤50 linhas

### Qualitativos
- [ ] Desenvolvedores conseguem localizar funcionalidades intuitivamente
- [ ] Código expressa intenção de negócio claramente
- [ ] Separação limpa entre regras de negócio e infraestrutura
- [ ] Facilidade para adicionar novas funcionalidades
- [ ] Redução de bugs relacionados a acoplamento

---

## Próximos Passos

1. **Escolha do Domínio Piloto**: Definir qual domínio migrar primeiro
2. **Prova de Conceito**: Implementar estrutura base seguindo padrões definidos
3. **Validação**: Verificar padrões com implementação real
4. **Migração Incremental**: Aplicar aprendizados aos outros domínios
5. **Deprecação**: Remover estrutura antiga gradualmente

---

## Referências

- [Object Calisthenics - 9 Rules](https://williamdurand.fr/2013/06/03/object-calisthenics/)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)
- [Anemic Domain Model Anti-pattern](https://martinfowler.com/bliki/AnemicDomainModel.html)
- **Codebase Atual**: `src/main/modules/` (padrões existentes)
- **Documentação Arquitetural**: `CLAUDE.md` (estrutura atual)