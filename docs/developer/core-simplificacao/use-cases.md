# Use Cases - Simplificação e Reorganização do Core da Aplicação

**Data:** 2025-07-14  
**Status:** 📋 Planejamento  
**Domínio:** Core Architecture  
**Base:** requirements.md

---

## Casos de Uso Principais

### UC001 - Migrar Módulo para Estrutura de Domínio

**Ator:** Developer  
**Objetivo:** Migrar um módulo existente para a nova estrutura de domínio seguindo Object Calisthenics

**Pré-condições:**

- Módulo existente identificado para migração
- Estrutura de domínio de destino definida
- Padrões de Value Objects e entidades ricas estabelecidos

**Fluxo Principal:**

1. Developer analisa módulo atual e identifica violações de SRP
2. Developer mapeia responsabilidades para domínios apropriados
3. Developer cria Value Objects para primitivos identificados
4. Developer extrai entidades ricas seguindo Object Calisthenics
5. Developer cria funções simples para persistência
6. Developer valida que funcionalidades continuam operando
7. Developer depreca estrutura antiga

**Fluxos Alternativos:**

- **4a.** Se entidade fica >50 linhas: dividir em entidades menores
- **5a.** Se função fica >10 linhas: extrair sub-funções
- **6a.** Se funcionalidades quebram: corrigir problemas antes prosseguir

**Pós-condições:**

- Módulo migrado segue Object Calisthenics
- Todas as funcionalidades continuam operando
- Código organizado seguindo novos padrões

**Baseado em:** Análise atual de `agent-management`, `channel-messaging`, `direct-messages`

---

### UC002 - Criar Value Object

**Ator:** Developer  
**Objetivo:** Encapsular primitivo em Value Object com validação

**Pré-condições:**

- Primitivo identificado para encapsulação (ID, nome, conteúdo, etc.)
- Regras de validação definidas
- Esquema Zod para validação disponível

**Fluxo Principal:**

1. Developer identifica primitivo usado em múltiplos lugares
2. Developer define regras de negócio para o primitivo
3. Developer cria classe Value Object com constructor privado
4. Developer adiciona validação Zod no constructor
5. Developer implementa métodos `equals()` e `toString()`
6. Developer substitui uso do primitivo pelo Value Object
7. Developer valida que Value Object funciona corretamente

**Exemplo de Implementação (baseado em padrões atuais):**

```typescript
// Baseado em src/shared/utils/validation.utils.ts
export class ProjectName {
  constructor(name: string) {
    const result = z
      .string()
      .min(1, "Nome não pode estar vazio")
      .max(100, "Nome muito longo")
      .regex(/^[a-zA-Z0-9\s-_]+$/, "Caracteres inválidos")
      .parse(name.trim());
    this.value = result;
  }

  private readonly value: string;

  toString(): string {
    return this.value;
  }
  equals(other: ProjectName): boolean {
    return this.value === other.value;
  }
}
```

**Fluxos Alternativos:**

- **4a.** Se validação falha: lançar erro descritivo
- **6a.** Se substituição quebra código: ajustar gradualmente

**Pós-condições:**

- Primitivo validado automaticamente
- Código mais expressivo e seguro
- Redução de bugs relacionados a valores inválidos

**Baseado em:** Padrões atuais em `validation.utils.ts` e necessidades identificadas

---

### UC003 - Refatorar Entidade para Rich Domain Model

**Ator:** Developer  
**Objetivo:** Transformar entidade anêmica em entidade rica seguindo Object Calisthenics

**Pré-condições:**

- Entidade anêmica identificada
- Lógica de negócio espalhada em services identificada
- Regras de Object Calisthenics definidas

**Fluxo Principal:**

1. Developer identifica entidade com apenas propriedades
2. Developer localiza lógica de negócio relacionada em services
3. Developer move regras de negócio para dentro da entidade
4. Developer garante máximo 2 variáveis de instância
5. Developer quebra métodos longos em métodos menores (≤10 linhas)
6. Developer elimina níveis de indentação >1
7. Developer remove getters/setters, mantém apenas comportamentos
8. Developer valida que entidade tem ≤50 linhas total

**Exemplo de Transformação (baseado em análise atual):**

```typescript
// ANTES: Entidade Anêmica (padrão atual)
export class Agent {
  constructor(
    public id: string,
    public name: string,
    public systemPrompt: string,
    public isActive: boolean,
  ) {}
}

// DEPOIS: Entidade Rica (Object Calisthenics)
export class Agent {
  constructor(
    private id: string,
    private properties: AgentProperties,
  ) {}

  activate(): Agent {
    return new Agent(this.id, this.properties.activate());
  }

  async generateResponse(
    userMessage: string,
    llmProvider: LLMProvider,
  ): Promise<string> {
    const prompt = this.properties.buildSystemPrompt();
    return await llmProvider.generateResponse(prompt, userMessage);
  }
}
```

**Fluxos Alternativos:**

- **4a.** Se >2 variáveis necessárias: extrair Value Objects ou outras entidades
- **5a.** Se método não consegue ficar ≤10 linhas: extrair métodos privados
- **8a.** Se entidade >50 linhas: dividir responsabilidades

**Pós-condições:**

- Entidade com comportamento próprio
- Lógica de negócio centralizada na entidade
- Código mais expressivo e manutenível

**Baseado em:** Análise de `src/main/modules/agent-management/domain/agent.entity.ts`

---

### UC004 - Implementar Infraestrutura Transparente

**Ator:** Developer  
**Objetivo:** Remover utilitários do DI e torná-los transparentes

**Pré-condições:**

- Utilitários identificados (logger, database, validation)
- Funções utilitárias definidas
- DI atual mapeado

**Fluxo Principal:**

1. Developer identifica dependências que são utilitários
2. Developer cria funções `getLogger(context)`, `getDatabase()`
3. Developer remove utilitários do dependency container
4. Developer substitui injeção por chamadas diretas às funções
5. Developer mantém apenas dependências de domínio no DI
6. Developer valida que funcionalidades continuam operando

**Exemplo de Implementação (baseado em padrões atuais):**

```typescript
// Baseado em src/main/persistence/db.ts e src/main/logger.ts
export function getDatabase() {
  return drizzle(new Database(DB_PATH));
}

export function getLogger(context: string) {
  return logger.child({ context });
}

// ANTES: Service com DI complexo
export class AgentService {
  constructor(
    private repository: IAgentRepository,
    private logger: Logger,
    private database: Database,
    private validator: ValidationService,
  ) {}
}

// DEPOIS: Service com infraestrutura transparente
export class Agent {
  private logger = getLogger("Agent");

  constructor(
    private agentRepository: IAgentRepository, // Apenas dependência de domínio
  ) {}

  private validateInput(data: any) {
    // Zod direto, sem service
    return AgentSchema.parse(data);
  }
}
```

**Fluxos Alternativos:**

- **5a.** Se dependência é realmente de domínio: manter no DI

**Pós-condições:**

- DI focado em dependências de negócio
- Menos boilerplate
- Infraestrutura transparente

**Baseado em:** Análise atual de `src/main/kernel/dependency-container.ts`

---

### UC005 - Migrar Frontend para Nova Estrutura

**Ator:** Frontend Developer  
**Objetivo:** Adaptar stores e components para nova estrutura de domínios

**Pré-condições:**

- Backend migrado para nova estrutura
- Novos tipos e interfaces definidos
- Endpoints atualizados

**Fluxo Principal:**

1. Developer identifica stores afetados pela migração
2. Developer atualiza tipos importados para nova estrutura
3. Developer adapta queries TanStack para novos endpoints
4. Developer atualiza Zustand stores para novos padrões
5. Developer ajusta components para novos Value Objects
6. Developer valida que UI continua funcionando
7. Developer remove imports da estrutura antiga

**Exemplo de Adaptação (baseado em stores atuais):**

```typescript
// ANTES: Store com estrutura antiga
import { AgentDto } from "../../../shared/types/agent.types";

// DEPOIS: Store com nova estrutura de domínios
import { AgentDto } from "../../../shared/types/domains/agents/agent.types";

// Baseado em src/renderer/features/agent-management/stores/
export const useAgentStore = create<AgentStore>((set, get) => ({
  // Padrão mantido, apenas tipos atualizados
}));
```

**Fluxos Alternativos:**

- **6a.** Se UI quebra: corrigir problemas antes prosseguir

**Pós-condições:**

- Frontend compatível com nova estrutura
- Tipos atualizados
- Funcionalidades preservadas

**Baseado em:** Análise de `src/renderer/features/` e stores existentes

---

## Cenários de Validação

### Cenário 1: Migração Incremental sem Breaking Changes

**Contexto:** Developer migrando agent-management module
**Ações:**

1. Criar nova estrutura em `/domains/agents/`
2. Manter módulo atual funcionando
3. Gradualmente redirecionar calls para nova estrutura
4. Deprecar módulo antigo apenas quando novo está 100% funcional

**Resultado Esperado:** Usuários não percebem mudanças, funcionalidades preservadas

### Cenário 2: Value Object com Validação Falha

**Contexto:** Developer criando ProjectName value object
**Ações:**

1. Tentar criar ProjectName("")
2. Tentar criar ProjectName("nome-com-caracteres-#$%")
3. Tentar criar ProjectName("a".repeat(200))

**Resultado Esperado:** Erros descritivos para cada violação de regra

### Cenário 3: Entidade Rica com Object Calisthenics

**Contexto:** Developer refatorando Agent entity
**Ações:**

1. Mover lógica de prompt generation para dentro de Agent
2. Garantir métodos ≤10 linhas
3. Eliminar indentação >1 nível
4. Manter apenas 2 variáveis de instância

**Resultado Esperado:** Código mais expressivo, entidade ≤50 linhas

### Cenário 4: Infraestrutura Transparente

**Contexto:** Developer removendo Logger do DI
**Ações:**

1. Substituir `this.logger` por `getLogger('Context')`
2. Remover Logger do constructor
3. Validar que logs continuam funcionando

**Resultado Esperado:** Menos boilerplate, funcionalidade preservada

---

## Fluxos de Exceção

### Exceção 1: Migração Quebra Funcionalidade Crítica

**Trigger:** Validação manual detecta falha após migração
**Tratamento:**

1. Reverter mudanças imediatamente
2. Analisar causa raiz
3. Corrigir problemas em ambiente isolado
4. Re-aplicar migração com correções

### Exceção 2: Value Object Performance Issue

**Trigger:** Validação Zod causa lentidão significativa
**Tratamento:**

1. Identificar operações críticas de performance
2. Implementar cache de validação se apropriado
3. Considerar validação lazy para casos específicos

### Exceção 3: Object Calisthenics Impraticável

**Trigger:** Regra específica impossível de aplicar em contexto
**Tratamento:**

1. Documentar exceção e justificativa
2. Aplicar máximo possível das outras regras
3. Revisar com equipe para consenso

### Exceção 4: Conflito de Dependências Durante Migração

**Trigger:** Circular dependencies ou problemas de inicialização
**Tratamento:**

1. Mapear dependências problemáticas
2. Refatorar para quebrar ciclos
3. Ajustar ordem de inicialização se necessário

---

## Validação e Critérios de Aceite

### Para UC001 (Migrar Módulo)

- [ ] Zero violações de Object Calisthenics detectadas
- [ ] Performance mantida ou melhorada
- [ ] Funcionalidades preservadas 100%
- [ ] Código organizado seguindo novos padrões

### Para UC002 (Criar Value Object)

- [ ] Validação Zod funciona corretamente
- [ ] Métodos equals() e toString() implementados
- [ ] Usado consistentemente no código
- [ ] Sem métodos estáticos

### Para UC003 (Entidade Rica)

- [ ] Entidade ≤50 linhas total
- [ ] Métodos ≤10 linhas cada
- [ ] Máximo 2 variáveis de instância
- [ ] Zero indentação >1 nível
- [ ] Lógica de negócio centralizada

### Para UC004 (Infraestrutura Transparente)

- [ ] DI reduzido a dependências de domínio apenas
- [ ] Funções utilitárias funcionam corretamente
- [ ] Performance não impactada
- [ ] Código mais limpo e legível

### Para UC005 (Frontend)

- [ ] UI funciona identicamente
- [ ] Tipos corretos importados
- [ ] Stores funcionais
- [ ] Zero warnings de TypeScript

---

## Referências de Implementação

- **Padrões Atuais Bons**: `src/main/modules/project-management/` (estrutura limpa)
- **Validation Patterns**: `src/shared/utils/validation.utils.ts`
- **Error Handling**: `src/main/errors/base.error.ts` (sistema completo)
- **Entity Examples**: `src/main/modules/agent-management/domain/agent.entity.ts`
- **Repository Patterns**: `src/main/modules/agent-management/persistence/agent.repository.ts`
- **Store Patterns**: `src/renderer/features/agent-management/stores/`
