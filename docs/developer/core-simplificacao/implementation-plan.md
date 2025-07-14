# Implementation Plan - Simplificação e Reorganização do Core da Aplicação

**Data:** 2025-07-14  
**Status:** 📋 Pronto para Execução  
**Domínio:** Core Architecture  
**Estimativa Total:** 6-8 sprints (12-16 semanas)

---

## Visão Geral do Plano

Este plano detalha a execução da simplificação e reorganização do core do Project Wiz em fases incrementais, minimizando riscos e mantendo a aplicação funcionando durante toda a migração.

### Estratégia Geral

- **Migração Incremental**: Implementar nova estrutura em paralelo à atual
- **Validação Contínua**: Verificação manual e automática em cada etapa
- **Rollback Seguro**: Capacidade de reverter mudanças a qualquer momento
- **Zero Downtime**: Usuários não percebem a migração

---

## Fase 1: Fundação e Infraestrutura (Sprint 1-2)

### Sprint 1: Setup da Nova Estrutura

#### 1.1 Criar Estrutura de Domínios

**Duração:** 2 dias  
**🤖 LLM Executa:** 90% (estrutura, configs)  
**👨‍💻 Humano Valida:** 10% (review, aprovação)

**Tarefas:**

- [ ] 🤖 Criar estrutura `/src/main/domains/`
- [ ] 🤖 Setup de diretórios: `projects/`, `agents/`, `users/`, `llm/`
- [ ] 🤖 Criar subdiretorios padrão: `value-objects/`, `entities/`, `functions/`
- [ ] 🤖 Configurar imports e paths no TypeScript

**Critérios de Aceite:**

- [ ] Estrutura de diretórios criada conforme implementation-guide.md
- [ ] TypeScript compila sem erros
- [ ] Imports relativos configurados corretamente

**Comandos de Validação:**

- `npm run type-check` - Verificação de tipos TypeScript
- Verificar estrutura de diretórios manualmente no VS Code

#### 1.2 Implementar Infraestrutura Transparente

**Duração:** 3 dias  
**🤖 LLM Executa:** 95% (implementação completa)  
**👨‍💻 Humano Valida:** 5% (teste integração)

**Tarefas:**

- [ ] 🤖 Implementar `getDatabase()` em `src/main/infrastructure/database.ts`
- [ ] 🤖 Implementar `getLogger(context)` em `src/main/infrastructure/logger.ts`
- [ ] 🤖 Implementar `publishEvent()` em `src/main/infrastructure/events.ts`
- [ ] 🤖 Criar utilitários para validação transparente
- [ ] 🤖 Documentar padrões de uso

**Critérios de Aceite:**

- [ ] Funções utilitárias funcionam independentemente
- [ ] Singleton patterns implementados corretamente
- [ ] Performance igual ou melhor que DI atual
- [ ] Documentação de uso criada

**Comandos de Validação:**

- `npm run type-check` - Verificação de tipos
- `npm run lint:check` - Verificação de linting

### Sprint 2: Value Objects Base

#### 2.1 Implementar Value Objects Fundamentais

**Duração:** 5 dias  
**🤖 LLM Executa:** 95% (código completo)  
**👨‍💻 Humano Valida:** 5% (regras de negócio)

**Tarefas:**

- [ ] 🤖 `ProjectName` com validação Zod completa
- [ ] 🤖 `Temperature` para LLM com validação de range

**Critérios de Aceite:**

- [ ] Todos os Value Objects seguem Object Calisthenics
- [ ] Validação Zod funciona corretamente
- [ ] Métodos `equals()` e `toString()` implementados

**Comandos de Validação:**

- `npm run type-check` - Verificação de tipos
- `npm run lint:check` - Verificação de linting

**Exemplo de Implementação:**

```typescript
// Baseado em: implementation-guide.md seção 2
export class ProjectName {
  constructor(name: string) {
    const validated = ProjectNameSchema.parse(name);
    this.value = validated;
  }

  private readonly value: string;
  // ... resto da implementação
}
```

---

## Fase 2: Domínio Projects (Sprint 3-4)

### Sprint 3: Entidades Ricas do Domínio Projects

#### 3.1 Implementar Project Entity Rica

**Duração:** 3 dias  
**🤖 LLM Executa:** 85% (estrutura + refatoração)  
**👨‍💻 Humano Valida:** 15% (lógica de negócio)

**Tarefas:**

- [ ] 🤖 Criar `Project` entity seguindo Object Calisthenics
- [ ] 🤖🔍 Migrar lógica de negócio do `ProjectService` atual
- [ ] 🤖 Garantir máximo 2 variáveis de instância
- [ ] 🤖 Métodos ≤10 linhas cada

**Critérios de Aceite:**

- [ ] Entity com ≤50 linhas total
- [ ] Máximo 1 nível de indentação por método
- [ ] Comportamentos de negócio centralizados na entity
- [ ] Sem getters/setters, apenas comportamentos

**Baseado em:** `src/main/modules/project-management/domain/project.entity.ts`

#### 3.2 Implementar Channel e Message Entities

**Duração:** 2 dias  
**🤖 LLM Executa:** 80% (extração + criação)  
**👨‍💻 Humano Valida:** 20% (integração)

**Tarefas:**

- [ ] 🤖 Extrair `Channel` entity de `communication` module
- [ ] 🤖 Criar `ProjectMessage` entity para mensagens de projeto
- [ ] 🤖🔍 Migrar lógica de `channel-messaging` para `ProjectMessage`

**Critérios de Aceite:**

- [ ] Entities seguem Object Calisthenics
- [ ] Lógica de canais centralizada em `Channel` entity
- [ ] Mensagens de projeto separadas de DMs

### Sprint 4: Funções Simples e Integração

#### 4.1 Implementar Funções CRUD para Projects

**Duração:** 2 dias  
**🤖 LLM Executa:** 90% (implementação completa)  
**👨‍💻 Humano Valida:** 10% (validação)

**Tarefas:**

- [ ] 🤖 `createProject()` function com validação completa
- [ ] 🤖 `findProjectById()` e `findProjectsByOwner()` functions
- [ ] 🤖 `updateProject()` e `deleteProject()` functions
- [ ] 🤖 `addChannelToProject()` e `removeChannelFromProject()` functions
- [ ] 🤖 Integração com infraestrutura transparente

**Critérios de Aceite:**

- [ ] Funções focadas em uma única responsabilidade
- [ ] Uso correto de `getDatabase()`, `getLogger()`, `publishEvent()`
- [ ] Validação através de Value Objects
- [ ] Error handling consistente

**Baseado em:** `src/main/modules/project-management/application/project.service.ts`

#### 4.2 Migração Incremental das APIs

**Duração:** 3 dias  
**🤖 LLM Executa:** 60% (proxy methods)  
**👨‍💻 Humano Valida:** 40% (testing + integração)

**Tarefas:**

- [ ] 🔍 Manter APIs atuais funcionando
- [ ] 🤖 Redirecionar chamadas internas para novas functions
- [ ] 🤖🔍 Atualizar IPC handlers gradualmente
- [ ] 🔍 Validar frontend continua funcionando

**Critérios de Aceite:**

- [ ] Zero breaking changes para frontend
- [ ] Performance mantida ou melhorada
- [ ] Logs indicam uso da nova estrutura

**Comandos de Validação:**

- `npm run type-check` - Verificação de tipos
- `npm run lint:check` - Verificação de linting
- `npm run quality:check` - Validação completa

---

## Fase 3: Domínio Agents (Sprint 5-6)

### Sprint 5: Reestruturação do Agent Management

#### 5.1 Refatorar Agent Entity para Object Calisthenics

**Duração:** 3 dias  
**🤖 LLM Executa:** 75% (refatoração automática)  
**👨‍💻 Humano Valida:** 25% (decisões complexas)

**Tarefas:**

- [ ] 🤖🔍 Analisar `AgentService` atual (185 linhas) e extrair responsabilidades
- [ ] 🤖 Criar `Agent` entity rica com máximo 2 variáveis de instância
- [ ] 🤖🔍 Migrar lógica de negócio para entity
- [ ] 🤖 Quebrar métodos longos em métodos ≤10 linhas

**Baseado em:** `src/main/modules/agent-management/application/agent.service.ts:34-92`

**Problemas Identificados a Resolver:**

- `createAgent()` method com 58 linhas → quebrar em funções menores
- Mistura de validação de LLM provider com CRUD de agent
- 4+ dependências injetadas → reduzir para máximo 2

#### 5.2 Implementar Worker e Queue Infrastructure

**Duração:** 2 dias  
**🤖 LLM Executa:** 70% (estrutura base)  
**👨‍💻 Humano Valida:** 30% (integração complexa)

**Tarefas:**

- [ ] 🤖 Criar `agent.worker.ts` para execução de tarefas
- [ ] 🤖 Implementar `agent.queue.ts` para gerenciamento de fila
- [ ] 🔍 Extrair infraestrutura de Worker que está faltando
- [ ] 🤖🔍 Integrar com system de eventos existente

**Critérios de Aceite:**

- [ ] Worker executa tarefas de forma assíncrona
- [ ] Queue gerencia prioridades e estados
- [ ] Integração com `EventBus` existente

### Sprint 6: Consolidação e Validação

#### 6.1 Migrar AIService Duplications

**Duração:** 2 dias  
**🤖 LLM Executa:** 80% (consolidação código)  
**👨‍💻 Humano Valida:** 20% (decisões arquiteturais)

**Tarefas:**

- [ ] 🤖🔍 Analisar duplicação entre `AIService` e `TextGenerationService`
- [ ] 🔍 Consolidar em uma única implementação no domínio `llm`
- [ ] 🤖 Migrar `AIMessageService` e `AIChatService` para usarem nova estrutura
- [ ] 🤖 Eliminar código duplicado

**Baseado em:** Análise de `src/main/modules/llm-provider/application/`

#### 6.2 Validação Completa do Domínio Agents

**Duração:** 3 dias  
**🤖 LLM Executa:** 20% (correções automáticas)  
**👨‍💻 Humano Valida:** 80% (testing + review)

**Tarefas:**

- [ ] 🤖🔍 Validação de Object Calisthenics com linter customizado
- [ ] 🔍 Verificação de performance para geração de respostas
- [ ] 🔍 Validação de que todas as funcionalidades continuam operando
- [ ] 🔍 Code review detalhado da nova estrutura

**Comandos de Validação:**

- `npm run lint:check` - Verificação de linting
- `npm run type-check` - Verificação de tipos
- `npm run quality:check` - Validação completa

---

## Fase 4: Domínios Users e LLM (Sprint 7-8)

### Sprint 7: Domínio Users (Direct Messages)

#### 7.1 Migrar Direct Messages para Users Domain

**Duração:** 3 dias  
**🤖 LLM Executa:** 75% (migração + entities)  
**👨‍💻 Humano Valida:** 25% (lógica de negócio)

**Tarefas:**

- [ ] 🤖🔍 Analisar `AIMessageService` (257 linhas) e quebrar responsabilidades
- [ ] 🤖 Criar `DirectMessage` entity no domínio `users`
- [ ] 🤖 Implementar `UserPreferences` e `UserSettings` entities
- [ ] 🤖🔍 Migrar lógica de conversas privadas
- [ ] 🤖 Consolidar com `conversation.service.ts` existente

**Baseado em:** `src/main/modules/direct-messages/application/ai-message.service.ts:16-129`

#### 7.2 User Space Personal Management

**Duração:** 2 dias  
**🤖 LLM Executa:** 70% (entities + configurações)  
**👨‍💻 Humano Valida:** 30% (autenticação + integração)

**Tarefas:**

- [ ] 🤖 Implementar `User` entity rica para espaço pessoal
- [ ] 🤖 Configurações pessoais (LLM preferences, themes, etc.)
- [ ] 🤖 Histórico de conversas pessoais
- [ ] 🔍 Integração com autenticação existente

### Sprint 8: Domínio LLM e Finalização

#### 8.1 Consolidar LLM Infrastructure

**Duração:** 2 dias  
**🤖 LLM Executa:** 85% (unificação + entities)  
**👨‍💻 Humano Valida:** 15% (decisões API)

**Tarefas:**

- [ ] 🤖 Unificar `AIService` e `TextGenerationService`
- [ ] 🤖 Criar `LLMProvider` entity rica
- [ ] 🤖 Implementar `ProviderRegistry` pattern
- [ ] 🤖 `Temperature`, `MaxTokens`, `ModelConfig` value objects

#### 8.2 Cleanup e Deprecação

**Duração:** 3 dias  
**🤖 LLM Executa:** 60% (remoção + cleanup)  
**👨‍💻 Humano Valida:** 40% (validação final)

**Tarefas:**

- [ ] 🤖 Remover módulos antigos (`channel-messaging`, `direct-messages`, etc.)
- [ ] 🤖 Limpar imports e dependências não utilizadas
- [ ] 🤖🔍 Atualizar documentação (`CLAUDE.md`)
- [ ] 🔍 Performance benchmarks finais
- [ ] 🤖🔍 Validação final de Object Calisthenics

---

## Validação e Quality Gates

### A Cada Sprint

**🤖 Validação Automática LLM:**

- `npm run lint:check` - Verificação de linting a cada commit
- `npm run type-check` - Verificação de tipos a cada commit
- Aplicação automática de Object Calisthenics rules

**🔍 Verificações Manuais Obrigatórias (Humano):**

- Máximo 1 nível indentação
- Métodos ≤10 linhas
- Classes ≤50 linhas
- Máximo 2 variáveis de instância
- Teste funcional pós-refatoração

**🤖🔍 Validation Checks Híbrida:**

- `npm run quality:check` - Executar a cada merge (inclui lint, type-check, format)
- LLM aplica correções automáticas, humano aprova

**🔍 Code Quality Gates (Humano Essencial):**

- [ ] Zero violações de Object Calisthenics
- [ ] Performance igual ou melhor
- [ ] Zero breaking changes no frontend
- [ ] TypeScript compilation sem erros

### Checkpoints de Validação

**End of Sprint 2:**

- [ ] Infraestrutura transparente funcionando
- [ ] Value Objects base implementados
- [ ] Padrões estabelecidos e documentados

**End of Sprint 4:**

- [ ] Domínio Projects completamente migrado
- [ ] Frontend funcionando com nova estrutura
- [ ] Performance validada

**End of Sprint 6:**

- [ ] Domínio Agents migrado
- [ ] Worker/Queue infrastructure operacional
- [ ] AI services consolidados

**End of Sprint 8:**

- [ ] Todos os domínios migrados
- [ ] Módulos antigos removidos
- [ ] Documentação atualizada
- [ ] Performance final validada

---

## Gestão de Riscos

### Alto Risco: Breaking Changes

**Mitigação:**

- Migração incremental com APIs paralelas
- Feature flags para rollback rápido
- Validação manual das funcionalidades

**Plano de Contingência:**

- Reverter mudanças manualmente nos arquivos
- Executar `npm run quality:check` para validar código
- Corrigir problemas identificados

### Médio Risco: Performance Degradation

**Monitoramento:**

- Benchmarks before/after cada mudança
- Profiling de memory usage
- Response time monitoring

**Limites:**

- Response time: não pode degradar >10%
- Memory usage: não pode crescer >20%
- Database queries: manter ou melhorar performance

### Baixo Risco: Team Learning Curve

**Mitigação:**

- Pair programming durante migração
- Code reviews rigorosos
- Documentação detalhada de padrões

---

## Recursos e Ferramentas

### Desenvolvimento

- **IDE Extensions:** ESLint rules customizados para Object Calisthenics
- **Performance:** Benchmarks de performance
- **Code Quality:** SonarQube/CodeClimate para métricas

### Validação Automática

**Scripts disponíveis:**

- `npm run quality:check` - Lint + Type-check + Format (validação completa)
- `npm run type-check` - Verificação de tipos TypeScript
- `npm run lint:check` - Verificação de linting sem correção
- `npm run format:check` - Verificação de formatação

### Monitoramento

- Performance dashboards
- Error tracking (Sentry/LogRocket)
- Usage metrics para validar migração

---

## Cronograma Detalhado

```
Sprint 1 (Semana 1-2): ████████████████████ Infraestrutura
Sprint 2 (Semana 3-4): ████████████████████ Value Objects
Sprint 3 (Semana 5-6): ████████████████████ Projects Domain
Sprint 4 (Semana 7-8): ████████████████████ Projects Integration
Sprint 5 (Semana 9-10): ███████████████████ Agents Domain
Sprint 6 (Semana 11-12): ██████████████████ Agents Integration
Sprint 7 (Semana 13-14): █████████████████ Users Domain
Sprint 8 (Semana 15-16): ████████████████ LLM + Cleanup
```

**Marcos Importantes:**

- **Semana 4:** Value Objects funcionais
- **Semana 8:** Projects Domain completamente migrado
- **Semana 12:** Agents Domain migrado
- **Semana 16:** Migração completa e cleanup finalizado

---

## Critérios de Sucesso Final

### Quantitativos

- [ ] 100% dos módulos antigos removidos
- [ ] 0 violações de Object Calisthenics
- [ ] Performance igual ou melhor em 90% dos casos
- [ ] Zero breaking changes para usuários finais
- [ ] TypeScript compilation sem erros

### Qualitativos

- [ ] Desenvolvedores encontram código intuitivamente
- [ ] Manutenção de código mais rápida
- [ ] Novos features mais fáceis de implementar
- [ ] Onboarding de novos devs mais simples

### Métricas de Sucesso

- **Lines of Code:** Redução esperada de 20-30%
- **Cyclomatic Complexity:** Redução média de 40%
- **Time to Fix Bugs:** Redução esperada de 25%
- **Time to Add Features:** Redução esperada de 30%

---

---

## Validação de Object Calisthenics

### ESLint Rules Customizados

**Configuração Específica:**

```javascript
// .eslintrc.calisthenics.js
module.exports = {
  rules: {
    "max-depth": ["error", 1], // Máximo 1 nível indentação
    "max-lines-per-function": ["error", 10], // Máximo 10 linhas por método
    "max-params": ["error", 2], // Força Value Objects
    "no-static-methods": "error", // Proíbe métodos estáticos em entidades e value objects
    "max-instance-variables": ["error", 2], // Máximo 2 variáveis de instância
    "no-else-return": "error", // Proíbe else
    "prefer-early-return": "error", // Força early returns
    "no-primitive-parameters": "error", // Força Value Objects
  },
};
```

**Comandos de Validação:**

- `npm run dev` - Modo desenvolvimento com type-checking automático
- `npm run quality:check` - Validação completa (lint + type-check + format)

### Quality Gates

**Nenhum código pode ser mergeado sem:**

- [ ] Zero violações de Object Calisthenics
- [ ] Zero métodos estáticos em entidades e value objects
- [ ] Performance mantida ou melhorada
- [ ] TypeScript compilation sem erros

---

## Estratégia de Automação: LLM vs. Humano

### Divisão de Responsabilidades

**🤖 LLM Executável (80% do código):**

- **Infraestrutura Transparente:** `getDatabase()`, `getLogger()`, `publishEvent()` (100% automático)
- **Value Objects:** `ProjectName`, `Temperature` com validação Zod (95% automático)
- **Funções CRUD:** `createProject()`, `findProjectById()`, etc. (90% automático)
- **Refatoração Object Calisthenics:** Quebrar métodos >10 linhas, reduzir variáveis de instância (85% automático)
- **Migração de Código:** Transformar repositories em functions (90% automático)
- **Frontend Updates:** Atualizar imports e tipos em stores (80% automático)

**👨‍💻 Humano Essencial (Validação + Decisões):**

- **Validação Manual:** Testar funcionalidades após cada mudança (100% humano)
- **Performance Testing:** Benchmarks before/after, memory usage (100% humano)
- **Decisões Arquiteturais:** Resolver conflitos de design (100% humano)
- **Integration Testing:** Validar fluxos de usuário completos (100% humano)
- **Code Reviews:** Aprovar mudanças arquiteturais (100% humano)
- **Sprint Planning:** Coordenação e ajustes de cronograma (100% humano)

### Cronograma Híbrido Otimizado

**Cronograma Original:** 20-28 semanas (puramente humano)
**Cronograma Híbrido:** 12-16 semanas (LLM + validação humana)

| Sprint | LLM Executa                    | Humano Valida        | Duração     |
| ------ | ------------------------------ | -------------------- | ----------- |
| 1-2    | Infraestrutura + Value Objects | Setup + Validação    | 3-4 semanas |
| 3-4    | Projects Domain + CRUD         | Testing + Integração | 3-4 semanas |
| 5-6    | Agents Refactoring             | Validação Complexa   | 3-4 semanas |
| 7-8    | Users/LLM + Cleanup            | Testing Final        | 3-4 semanas |

### Workflow Recomendado

**Ciclo por Sprint:**

1. **LLM Executa** transformações automáticas (2-3 dias)
2. **Humano Valida** funcionalidades críticas (1-2 dias)
3. **LLM Corrige** problemas identificados (0.5-1 dia)
4. **Humano Aprova** para próxima fase (0.5 dia)

**Benefícios:**

- **Redução de 40-50%** no tempo total
- **Consistência** na aplicação de Object Calisthenics
- **Qualidade** mantida através de validação humana contínua

---

## Próximos Passos Imediatos

1. **Aprovação do Plano:** Review com stakeholders técnicos
2. **Setup de Validação:** Configurar ferramentas de validação Object Calisthenics
3. **Team Kickoff:** Apresentar padrões e Object Calisthenics + estratégia LLM
4. **LLM Setup:** Configurar ambiente para automação de código
5. **Sprint 1 Start:** Começar implementação híbrida da infraestrutura

**Pronto para execução híbrida!** 🤖👨‍💻🚀
