# Plano de Teste Conceitual: APP-SVC-001.8.1
## Configurar `generic-agent-executor.service.spec.ts` com mocks e teste de inicialização

**Objetivo:** Garantir que o arquivo de teste para `GenericAgentExecutor` seja configurado corretamente com os mocks necessários para suas dependências diretas e que uma instância do executor possa ser criada com sucesso.

---

### 1. Criação do Arquivo de Teste
*   **Arquivo:** `src_refactored/core/application/services/generic-agent-executor.service.spec.ts`

---

### 2. Importações Iniciais Essenciais
*   `GenericAgentExecutor` de `./generic-agent-executor.service`
*   Entidades de domínio: `Job`, `Agent`, `AgentPersonaTemplate`, `LLMProviderConfig` (e seus VOs associados como `JobName`, `JobId`, `AgentId`, `MaxIterations`, `PersonaName`, `PersonaRole`, `PersonaGoal`, `PersonaBackstory`, `ToolNames`, `LLMProviderConfigId`, `AgentTemperature`).
*   Tipos de Interface para Mocks: `ILLMAdapter`, `IToolRegistryService`, `IJobRepository`, `IAgentInternalStateRepository`, `ILogger`.
*   Utilitários: `Result`, `ok`, `error` de `@/refactored/shared/result`.
*   Vitest: `vi`, `describe`, `it`, `expect`, `beforeEach`, `mock`, `DeepMockProxy` (se usado).

---

### 3. Mocks das Dependências Diretas
*   Utilizar `vi.mock()` para cada dependência externa do `GenericAgentExecutor`:
    *   `@/refactored/core/application/ports/adapters/i-llm.adapter`
    *   `@/refactored/core/application/ports/services/i-tool-registry.service`
    *   `@/refactored/core/domain/job/ports/i-job.repository`
    *   `@/refactored/core/domain/agent/ports/i-agent-internal-state.repository`
    *   `@/refactored/core/common/services/i-logger.service`

---

### 4. Configuração do Bloco `describe` e `beforeEach`

```typescript
// (Importações mencionadas acima)
import { mock, DeepMockProxy } from 'vitest-mock-extended'; // Exemplo de importação para mock deep
import { JobStatusType } from '@/refactored/core/domain/job/value-objects/job-status.vo';
import { TargetAgentRole } from '@/refactored/core/domain/job/value-objects/target-agent-role.vo';
import { AgentPersonaTemplate } from '@/refactored/core/domain/agent/agent-persona-template.vo';
import { PersonaId } from '@/refactored/core/domain/agent/value-objects/persona/persona-id.vo';
import { PersonaName } from '@/refactored/core/domain/agent/value-objects/persona/persona-name.vo';
import { PersonaRole } from '@/refactored/core/domain/agent/value-objects/persona/persona-role.vo';
import { PersonaGoal } from '@/refactored/core/domain/agent/value-objects/persona/persona-goal.vo';
import { PersonaBackstory } from '@/refactored/core/domain/agent/value-objects/persona/persona-backstory.vo';
import { ToolNames } from '@/refactored/core/domain/agent/value-objects/persona/tool-names.vo';
import { MaxIterations } from '@/refactored/core/domain/agent/value-objects/max-iterations.vo';


describe('GenericAgentExecutor', () => {
  // Variáveis para mocks e a instância do executor
  let mockLlmAdapter: DeepMockProxy<ILLMAdapter>;
  let mockToolRegistryService: DeepMockProxy<IToolRegistryService>;
  let mockJobRepository: DeepMockProxy<IJobRepository>;
  let mockAgentInternalStateRepository: DeepMockProxy<IAgentInternalStateRepository>;
  let mockLogger: DeepMockProxy<ILogger>;
  let executor: GenericAgentExecutor;

  // Variáveis para instâncias mock/reais de Job e Agent
  let mockJob: Job;
  let mockAgent: Agent;
  let mockPersonaTemplate: AgentPersonaTemplate;
  // let mockLlmProviderConfig: LLMProviderConfig; // Apenas para tipagem, não precisa de implementação completa se Agent.create for robusto

  beforeEach(() => {
    mockLlmAdapter = mock<ILLMAdapter>();
    mockToolRegistryService = mock<IToolRegistryService>();
    mockJobRepository = mock<IJobRepository>();
    mockAgentInternalStateRepository = mock<IAgentInternalStateRepository>();
    mockLogger = mock<ILogger>();

    // Configurar retornos padrão para o logger para evitar erros de undefined
    mockLogger.info.mockReturnValue();
    mockLogger.warn.mockReturnValue();
    mockLogger.error.mockReturnValue();
    mockLogger.debug.mockReturnValue();

    executor = new GenericAgentExecutor(
      mockLlmAdapter,
      mockToolRegistryService,
      mockJobRepository,
      mockAgentInternalStateRepository,
      mockLogger
    );

    mockPersonaTemplate = AgentPersonaTemplate.create({
        id: PersonaId.generate(),
        name: PersonaName.create('Test Persona').unwrap(),
        role: PersonaRole.create('Conceptual Tester').unwrap(),
        goal: PersonaGoal.create('To test conceptually').unwrap(),
        backstory: PersonaBackstory.create('Created for testing').unwrap(),
        toolNames: ToolNames.create([]).unwrap(),
    }).unwrap();

    mockAgent = Agent.create({
        id: AgentId.generate(),
        personaTemplate: mockPersonaTemplate,
        llmProviderConfigId: LLMProviderConfigId.generate(),
        temperature: AgentTemperature.create(0.5).unwrap(),
        maxIterations: MaxIterations.create(5).unwrap(),
    }).unwrap();

    mockJob = Job.create({
      name: JobName.create('Initial Test Job').unwrap(),
      payload: { initialPrompt: 'Test the executor setup.' },
      targetAgentRole: TargetAgentRole.create('TestAgent').unwrap(),
    });

    mockJobRepository.save.mockResolvedValue(ok(mockJob));
    // Simular que moveToActive funciona e é permitido
    vi.spyOn(mockJob, 'moveToActive').mockReturnValue(true);
    // Simular que o status inicial permite a transição para active
     vi.spyOn(mockJob, 'status', 'get').mockReturnValue(JobStatus.pending());


  });

  // Testes virão aqui
});
```

---

### 5. Teste de Inicialização

*   **Descrição:** Verificar se uma instância de `GenericAgentExecutor` pode ser criada com sucesso quando todas as dependências mockadas são fornecidas.

*   **Arrange:**
    *   A configuração do `beforeEach` já instancia o `executor`.

*   **Act:**
    *   Nenhuma ação adicional é necessária além da instanciação no `beforeEach`.

*   **Assert:**
    ```typescript
    it('should be created successfully with mocked dependencies', () => {
      expect(executor).toBeInstanceOf(GenericAgentExecutor);
    });
    ```

---

**Considerações Adicionais:**
*   Este plano assume o uso de `vitest` e `vitest-mock-extended` (para `mock<T>()` e `DeepMockProxy<T>`). Se `vitest-mock-extended` não estiver no projeto, os mocks precisarão ser criados manualmente com `vi.fn()` para cada método.
*   A criação de `mockJob` e `mockAgent` deve ser feita de forma a produzir instâncias válidas.
*   Este é apenas o setup inicial. As próximas sub-tarefas adicionarão mais casos de teste dentro deste `describe` block.
*   Adicionado `vi.spyOn(mockJob, 'moveToActive').mockReturnValue(true);` e `vi.spyOn(mockJob, 'status', 'get').mockReturnValue(JobStatus.pending());` para garantir que a chamada inicial a `job.moveToActive()` dentro de `executor.executeJob()` não cause problemas no setup do teste, assumindo que o job pode ser movido para active.
*   Importações adicionais como `LLMProviderConfigId` e VOs da Persona foram adicionadas para a criação do `mockAgent`.
*   O mock do logger foi configurado para que seus métodos retornem `undefined` (comportamento padrão de `vi.fn()`) para evitar erros se forem chamados sem um mock de retorno específico.
---
