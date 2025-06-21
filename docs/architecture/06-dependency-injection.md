# 06: Injeção de Dependência (DI) com InversifyJS

A Injeção de Dependência (DI) é um padrão de design crucial que promove o desacoplamento entre os componentes do software. Em vez de um objeto criar suas próprias dependências ou buscá-las ativamente, as dependências são fornecidas (injetadas) de uma fonte externa (um container de DI). Neste projeto, utilizaremos a biblioteca **InversifyJS**.

Os principais benefícios que buscamos com InversifyJS são:
- **Desacoplamento:** Classes não precisam conhecer as implementações concretas de suas dependências, apenas suas interfaces.
- **Testabilidade:** Facilita a substituição de dependências por mocks ou stubs em testes unitários.
- **Configuração Centralizada:** As "ligações" (bindings) entre interfaces e suas implementações concretas são definidas em um local central.
- **Gerenciamento do Ciclo de Vida:** InversifyJS pode gerenciar o ciclo de vida dos objetos que cria (ex: singleton, transitório).

## 6.1. Configuração do Container (`src/infrastructure/ioc/inversify.config.ts`)

O coração do InversifyJS é o `Container`. Um arquivo, localizado em `src/infrastructure/ioc/inversify.config.ts`, será responsável por criar e configurar este container.

**Exemplo de Estrutura (`inversify.config.ts`):**
```typescript
import 'reflect-metadata'; // Deve ser importado uma vez no ponto de entrada da aplicação
import { Container } from 'inversify';
import { TYPES } from './types';

// --- Interfaces de Repositório (Domínio) ---
import { IJobRepository } from '@/domain/repositories/i-job.repository';
import { IAIAgentRepository } from '@/domain/repositories/i-ai-agent.repository';
// import { IProjectRepository } from '@/domain/repositories/i-project.repository';

// --- Implementações de Repositório (Infraestrutura) ---
import { DrizzleJobRepository } from '@/infrastructure/persistence/drizzle/repositories/job.repository'; // Path e nome da classe revertidos
import { InMemoryAIAgentRepository } from '@/infrastructure/persistence/in-memory/ai-agent.repository'; // Exemplo de In-Memory
// import { DrizzleProjectRepository } from '@/infrastructure/persistence/drizzle/repositories/project.repository';

// --- Interfaces de Serviços de Domínio/Aplicação ---
import { IAIAgentExecutionService } from '@/domain/services/agent/i-ai-agent-execution.service';
// import { IProjectService } from '@/domain/services/project/i-project.service';

// --- Implementações de Serviços de Domínio/Aplicação ---
import { AIAgentExecutionService } from '@/domain/services/agent/ai-agent-execution.service';
// import { ProjectService } from '@/domain/services/project/project.service';

// --- Interfaces de Serviços de Infraestrutura ---
import { ILLMService } from '@/domain/services/i-llm.service'; // Assumindo que a interface está no domínio
import { IToolRegistry } from '@/domain/services/i-tool-registry.service'; // Assumindo que a interface está no domínio
import { ILoggerService } from '@/domain/services/i-logger.service'; // Exemplo

// --- Implementações de Serviços de Infraestrutura ---
import { DeepSeekLLMService } from '@/infrastructure/services/llm/deepseek.service';
import { ToolRegistry } from '@/infrastructure/services/tool-registry/tool-registry'; // Exemplo
import { ConsoleLoggerService } from '@/infrastructure/services/logging/console-logger.service'; // Exemplo

// --- Casos de Uso ---
import { EnqueueJobUseCase } from '@/domain/use-cases/job/enqueue-job.use-case';
import { CreateProjectUseCase } from '@/domain/use-cases/project/create-project.use-case';


// Criação do Container
const container = new Container({ defaultScope: 'Singleton' }); // Default para Singleton pode ser útil

// --- Bindings para Repositórios ---
container.bind<IJobRepository>(TYPES.IJobRepository).to(DrizzleJobRepository); //.inSingletonScope(); é o default
container.bind<IAIAgentRepository>(TYPES.IAIAgentRepository).to(InMemoryAIAgentRepository); // Exemplo com In-Memory

// --- Bindings para Serviços de Domínio/Aplicação ---
container.bind<IAIAgentExecutionService>(TYPES.IAIAgentExecutionService).to(AIAgentExecutionService);

// --- Bindings para Serviços de Infraestrutura ---
container.bind<ILLMService>(TYPES.ILLMService).to(DeepSeekLLMService);
container.bind<IToolRegistry>(TYPES.IToolRegistry).to(ToolRegistry);
container.bind<ILoggerService>(TYPES.ILoggerService).to(ConsoleLoggerService);

// --- Bindings para Casos de Uso ---
// Casos de Uso geralmente são melhores como transitórios ou request-scoped se tiverem estado,
// mas podem ser singletons se forem puramente stateless e suas dependências também.
// Para simplificar, podemos usar o default do container ou especificar.
container.bind<EnqueueJobUseCase>(TYPES.EnqueueJobUseCase).to(EnqueueJobUseCase).inTransientScope();
container.bind<CreateProjectUseCase>(TYPES.CreateProjectUseCase).to(CreateProjectUseCase).inTransientScope();

export { container };
```

**Principais Pontos da Configuração:**
*   **`reflect-metadata`:** Importado uma vez (geralmente no `electron/main.ts` antes de usar o container).
*   **`Container`:** Instância principal. `defaultScope: 'Singleton'` pode ser configurado.
*   **`bind<Interface>(TYPE).to(Implementation).inScope()`:** Como as dependências são registradas.
    *   `inSingletonScope()`: Uma única instância reutilizada.
    *   `inTransientScope()`: Nova instância a cada resolução.

**Nota sobre Workers e QueueClients:**
Os `AgentWorker`s (da camada de infraestrutura, ex: `infrastructure/workers/generic.worker.ts`) e os `QueueClient`s (ex: `infrastructure/persistence/queue/queue.client.ts`) são tipicamente instanciados e configurados programaticamente pelo `AgentLifecycleService` (ver [`03-queue-subsystem.md`](./03-queue-subsystem.md#34-gerenciamento-de-workers-e-filas)), que é parte da lógica de inicialização no processo principal do Electron.

O `AgentLifecycleService` obteria as seguintes dependências do container DI:
1.  `IJobRepository`: Para passar ao construtor de cada `QueueClient`.
2.  `IAIAgentExecutionService`: Para obter a função `jobProcessor` específica para cada agente.
3.  `ILoggerService` (e quaisquer outras dependências diretas do Worker).

Em seguida, para cada `AIAgent` configurado, o `AgentLifecycleService`:
a. Cria uma instância de `QueueClient`, passando o `queueName` do agente e a instância de `IJobRepository`.
b. Obtém a função `jobProcessor` do `IAIAgentExecutionService` (ex: `agentExecutionService.getJobProcessorForAgent(agentId)`).
c. Cria uma instância de `AgentWorker`, passando o `workerId`, a instância de `QueueClient`, a função `jobProcessor`, e o `ILoggerService`.

## 6.2. Definição de Tipos/Símbolos (`src/infrastructure/ioc/types.ts`)

Para identificar unicamente as dependências (especialmente interfaces), usamos símbolos.

**Exemplo de Estrutura (`types.ts`):**
```typescript
const TYPES = {
  // Repositórios
  IJobRepository: Symbol.for('IJobRepository'),
  IAIAgentRepository: Symbol.for('IAIAgentRepository'),
  IProjectRepository: Symbol.for('IProjectRepository'),

  // Serviços de Domínio/Aplicação
  IAIAgentExecutionService: Symbol.for('IAIAgentExecutionService'),
  IProjectService: Symbol.for('IProjectService'),

  // Serviços de Infraestrutura
  ILLMService: Symbol.for('ILLMService'),
  IToolRegistry: Symbol.for('IToolRegistry'),
  ILoggerService: Symbol.for('ILoggerService'),
  // IQueueClient não é globalmente injetado, mas instanciado com parâmetros.

  // Casos de Uso
  EnqueueJobUseCase: Symbol.for('EnqueueJobUseCase'),
  CreateProjectUseCase: Symbol.for('CreateProjectUseCase'),

  // Outras dependências específicas
  // DatabaseConnection: Symbol.for('DatabaseConnection'),
};

export { TYPES };
```

## 6.3. Exemplos de Uso (`@injectable`, `@inject`)

Com o container configurado e os tipos definidos, as classes podem ser marcadas como `@injectable()` e suas dependências injetadas via construtor usando `@inject(TYPES.NomeDoSimbolo)`.

**Exemplo com `AIAgentExecutionService`:**
Este serviço é central para a execução da lógica dos agentes de IA.

```typescript
// src/domain/services/agent/ai-agent-execution.service.ts
import { injectable, inject } from 'inversify';
import { TYPES } from '@/infrastructure/ioc/types'; // Ajustar caminho
import { IAIAgentRepository } from '@/domain/repositories/i-ai-agent.repository';
import { ILLMService } from '@/domain/services/i-llm.service'; // Interface no domínio
import { IToolRegistry } from '@/domain/services/i-tool-registry.service'; // Interface no domínio
import { Job } from '@/domain/entities/job.entity';
// import { AIAgent } from '@/domain/entities/ai-agent.entity'; // A entidade de configuração
// import { IQueueClient } from '@/domain/interfaces/i-queue.client'; // Não injetado aqui

export interface IAIAgentExecutionService {
  getJobProcessorForAgent(agentId: string): (job: Job) => Promise<any>;
}

@injectable()
export class AIAgentExecutionService implements IAIAgentExecutionService {
  constructor(
    @inject(TYPES.IAIAgentRepository) private aiAgentRepository: IAIAgentRepository,
    @inject(TYPES.ILLMService) private llmService: ILLMService,
    @inject(TYPES.IToolRegistry) private toolRegistry: IToolRegistry
    // Note: IJobRepository e IQueueClient não são injetados aqui diretamente.
    // O QueueClient é instanciado pelo AgentLifecycleService e recebe IJobRepository.
    // O jobProcessor fornecido por este serviço não interage diretamente com o QueueClient.
  ) {}

  public getJobProcessorForAgent(agentId: string): (job: Job) => Promise<any> {
    return async (job: Job): Promise<any> => {
      const agentProfile = await this.aiAgentRepository.findById(agentId);
      if (!agentProfile) {
        throw new Error(`AIAgent profile ${agentId} not found for job ${job.id}.`);
      }
      // Lógica do jobProcessor (interação com LLM, ferramentas, modificar job em memória, lançar erros)
      // ...usando this.llmService, this.toolRegistry, agentProfile...
      // Exemplo:
      // if (conditionToDelay) {
      //   job.prepareForDelay(new Date(Date.now() + delayDuration));
      //   throw new DelayedError('Job processing delayed by agent logic.');
      // }
      // return finalResult;
      return `Job ${job.id} processed by agent ${agentProfile.props.name}`; // Simulado
    };
  }
}
```
**Exemplo de Implementação de Repositório (`DrizzleJobRepository`):**
```typescript
// src/infrastructure/persistence/drizzle/repositories/job.repository.ts
import { injectable, inject } from 'inversify';
import { TYPES } from '@/infrastructure/ioc/types'; // Ajustar caminho
import { IJobRepository } from '@/domain/repositories/i-job.repository';
import { Job } from '@/domain/entities/job.entity';
import { JobStatusVO } from '@/domain/entities/value-objects/job-status.vo'; // Pode ser útil para a lógica interna de 'save'

@injectable()
export class DrizzleJobRepository implements IJobRepository {
  // constructor(@inject(TYPES.DrizzleDb) private db: DrizzleDb) {} // Exemplo de injeção do cliente DB

  async add(job: Job): Promise<void> {
    console.log(`[DrizzleJobRepository] Adicionando job: ${job.id} à fila ${job.props.queueName}`);
    // TODO: Implementar lógica de inserção com Drizzle.
  }

  async findById(jobId: string): Promise<Job | null> {
    console.log(`[DrizzleJobRepository] Buscando job: ${jobId}`);
    // TODO: Implementar lógica de busca com Drizzle.
    return null; // Simulado
  }

  async findNextPending(queueName: string, workerId: string): Promise<{ job: Job; lockToken: string } | null> {
    console.log(`[DrizzleJobRepository] Buscando próximo job pendente para fila ${queueName} por worker ${workerId}`);
    // TODO: Implementar lógica de busca e lock com Drizzle.
    return null; // Simulado
  }

  async save(job: Job, lockToken: string): Promise<void> {
    console.log(`[DrizzleJobRepository] Salvando job: ${job.id} com status ${job.status}. Token: ${lockToken.substring(0,8)}`);
    // TODO: Implementar lógica de atualização completa com Drizzle.
    // Esta implementação deve:
    // 1. Validar o lockToken.
    // 2. Persistir todas as propriedades relevantes de job.props.
    // 3. Lidar com a lógica de transição de estado (ex: FAILED com retentativas -> DELAYED/PENDING com backoff).
    // 4. Liberar o lock para estados terminais ou re-enfileirados.
  }
}
```
Isto demonstra como os serviços e repositórios são construídos e conectados usando InversifyJS, e como eles são então utilizados pela lógica de inicialização da aplicação para montar componentes mais dinâmicos como os `Worker`s.
