# 02: Camada de Domínio

A camada de Domínio é o coração do software. Ela contém a lógica de negócios pura e é completamente independente de qualquer detalhe de infraestrutura ou UI. As dependências de código fonte só podem apontar para dentro desta camada; nada no domínio pode saber sobre as camadas externas.

## 2.1. Entidades (`src/domain/entities/`)

Representam os objetos de negócio fundamentais do sistema, encapsulando tanto o estado (atributos) quanto o comportamento (métodos) que opera sobre esse estado. São persistentes e seguem os princípios de Object Calisthenics. Utilizam Value Objects para atributos primitivos.

### 2.1.1. Entidade `Job` (Exemplo Detalhado)

A entidade `Job` representa uma unidade de trabalho genérica a ser processada pelo sistema de filas. Ela é agnóstica ao domínio específico da aplicação que a utiliza; dados específicos da tarefa são armazenados em `props.payload`, e dados internos do processador do job em `props.data`.

**Localização:** `src/domain/entities/job.entity.ts` (com VOs em `value-objects/`)

**Value Object Exemplo (`JobStatusVO`):**
```typescript
// src/domain/entities/value-objects/job-status.vo.ts
export class JobStatusVO {
  private static readonly VALID_STATUSES = [
    'PENDING', 'ACTIVE', 'COMPLETED', 'FAILED',
    'DELAYED', 'WAITING_CHILDREN'
  ] as const;
  readonly value: typeof JobStatusVO.VALID_STATUSES[number];

  private constructor(status: typeof JobStatusVO.VALID_STATUSES[number]) {
    this.value = status;
  }

  static create(status: string): JobStatusVO {
    if (!JobStatusVO.VALID_STATUSES.includes(status as any)) {
      throw new Error(`Invalid job status: ${status}`);
    }
    return new JobStatusVO(status as any);
  }

  is(status: string): boolean {
    return this.value === status;
  }
}
```

**Interface `JobProps`:**
```typescript
// src/domain/entities/job.entity.ts
// import { JobStatusVO } from './value-objects/job-status.vo';
// import { JobIdVO } from './value-objects/job-id.vo'; // Exemplo

export interface JobProps {
  id: string; // Deveria ser JobIdVO
  name: string; // Tipo de job, usado para rotear para o jobProcessor correto
  queueName: string; // Nome da fila à qual o job pertence
  payload: any; // Dados específicos da tarefa, fornecidos pelo cliente da fila
  data?: any; // Dados internos do jobProcessor, atualizáveis durante a execução
  status: JobStatusVO;
  attempts: number;
  maxAttempts: number;
  priority?: number;
  delayUntil?: Date;
  processedAt?: Date;
  finishedAt?: Date;
  result?: any;
  error?: string;
  parentId?: string; // JobIdVO - Para jobs filhos
  createdAt: Date;
  updatedAt: Date;
}
```

**Classe `Job` (Métodos Chave):**
```typescript
// src/domain/entities/job.entity.ts
// (Importações omitidas por brevidade)
// Assume-se a existência de JobStatusVO e crypto.randomUUID globalmente ou importado.
export class Job {
  public props: JobProps; // Exposto para o Worker/QueueClient lerem para persistência

  private constructor(props: JobProps) {
    this.props = props;
  }

  public static create(params: {
    id?: string;
    name: string;
    queueName: string;
    payload: any;
    maxAttempts?: number;
    priority?: number;
    delayUntil?: Date;
    parentId?: string;
    initialData?: any;
  }): Job {
    const now = new Date();
    const id = params.id || crypto.randomUUID(); // Usar UUID real
    return new Job({
      id,
      name: params.name,
      queueName: params.queueName,
      payload: params.payload,
      status: JobStatusVO.create('PENDING'),
      attempts: 0,
      maxAttempts: params.maxAttempts || 3,
      priority: params.priority || 10,
      delayUntil: params.delayUntil,
      parentId: params.parentId,
      data: params.initialData,
      createdAt: now,
      updatedAt: now,
      processedAt: undefined, // Inicializado como undefined
      finishedAt: undefined,  // Inicializado como undefined
      result: undefined,      // Inicializado como undefined
      error: undefined        // Inicializado como undefined
    });
  }

  get id(): string { return this.props.id; }
  get status(): string { return this.props.status.value; }
  // Outros getters conforme necessário (name, queueName, payload, data, attempts, etc.)

  public startProcessing(): void {
    if (!this.props.status.is('PENDING') && !this.props.status.is('DELAYED')) {
      // Considerar lançar um erro se o estado não permitir o início
      console.warn(`Job ${this.id} está sendo iniciado de um estado não ideal: ${this.props.status.value}`);
    }
    this.props.status = JobStatusVO.create('ACTIVE');
    this.props.attempts += 1;
    this.props.processedAt = new Date();
    this.props.updatedAt = new Date();
  }

  public complete(result: any): void {
    if (!this.props.status.is('ACTIVE')) {
      // Considerar lançar um erro
    }
    this.props.status = JobStatusVO.create('COMPLETED');
    this.props.result = result;
    this.props.finishedAt = new Date();
    this.props.updatedAt = new Date();
  }

  public fail(error: string): void {
    // Não verifica o status aqui, pois um job pode falhar mesmo que não esteja ACTIVE (ex: erro ao tentar locar)
    this.props.status = JobStatusVO.create('FAILED');
    this.props.error = error;
    this.props.finishedAt = new Date();
    this.props.updatedAt = new Date();
  }

  public canRetry(): boolean {
    return this.props.status.is('FAILED') && this.props.attempts < this.props.maxAttempts;
  }

  public markAsPendingRetry(): void {
    if (!this.props.status.is('FAILED')) {
        // Idealmente, só se re-enfileira um job que falhou
    }
    this.props.status = JobStatusVO.create('PENDING');
    this.props.updatedAt = new Date();
    this.props.error = undefined;
    this.props.result = undefined;
    this.props.finishedAt = undefined;
    this.props.processedAt = undefined; // Limpa para a nova tentativa
    // A lógica de backoff (setar delayUntil) é feita pelo Worker/QueueClient antes de salvar
  }

  public updateJobData(newData: any): void {
    this.props.data = { ...(this.props.data || {}), ...newData };
    this.props.updatedAt = new Date();
  }

  public prepareForDelay(delayTargetTimestamp: Date): void {
    if (!this.props.status.is('ACTIVE')) {
      throw new Error('Job must be ACTIVE to be prepared for delay.');
    }
    this.props.status = JobStatusVO.create('DELAYED');
    this.props.delayUntil = delayTargetTimestamp;
    this.props.updatedAt = new Date();
  }

  public prepareToWaitForChildren(): void {
    if (!this.props.status.is('ACTIVE')) {
      throw new Error('Job must be ACTIVE to be prepared to wait for children.');
    }
    this.props.status = JobStatusVO.create('WAITING_CHILDREN');
    this.props.updatedAt = new Date();
  }
}
```

**Modificação do Estado do Job e Persistência via Worker/QueueClient:**

A entidade `Job` é responsável por manter seu estado e dados intrínsecos. Seus métodos permitem que o `jobProcessor` modifique este estado *em memória*. A persistência dessas alterações e a execução de operações de fila que requerem autorização (como adiar um job ou marcá-lo como esperando por filhos) são orquestradas pelo `Worker` através do `QueueClient`, utilizando o `workerToken`.

*   **`updateJobData(newData: any): void`**
    *   **Propósito:** Permitir que o `jobProcessor` modifique o campo `data` da instância do `Job` que está sendo processada (em memória) para salvar progresso ou resultados parciais.
    *   **Lógica na Entidade:** (Já mostrada acima)
    *   **Fluxo no `jobProcessor`:**
        1.  `job.updateJobData(meusNovosDados);`
        2.  O `jobProcessor` então chama `await queueClient.updateJobData(job.id, job.props.data, workerToken);` para persistir esta mudança específica, se necessário antes da conclusão do job.

*   **Sinalizando Intenção de Adiar ou Esperar:**
    O `jobProcessor` utiliza métodos na entidade `Job` para preparar o estado desejado em memória. Em seguida, lança um erro específico para sinalizar essa intenção ao `Worker`. O `Worker` então persiste o estado preparado do `Job` usando o `QueueClient`.

    *   **Método na Entidade `Job` (Exemplo para Adiar):** (`prepareForDelay` já mostrado acima)
    *   **Lógica no `jobProcessor`:**
        1.  Decide adiar o job e calcula `novoTimestamp`.
        2.  Chama `job.prepareForDelay(novoTimestamp);` (atualiza o `job` em memória).
        3.  Lança `new DelayedError("Job adiado pela lógica do processador");`.
    *   **Lógica no `Worker` (ao capturar `DelayedError`):**
        1.  `await this.queueClient.saveJob(job, lockToken);` (persiste o `job` que agora tem status `DELAYED` e `delayUntil` preenchidos).

    Um fluxo similar se aplica para `prepareToWaitForChildren()` e `WaitingChildrenError`.

Esta abordagem assegura que a entidade `Job` permaneça um objeto de domínio focado em seu estado, sem conhecimento de `workerToken`s ou da mecânica de persistência da fila. O `jobProcessor` manipula a instância do `Job` em memória, e o `Worker`, em coordenação com o `QueueClient`, gerencia a persistência e as operações de fila autorizadas.

### 2.1.2. Entidade `AIAgent` (Exemplo Detalhado - Configuração/DTO)

A entidade `AIAgent` representa o perfil e a configuração de um agente de Inteligência Artificial. Ela atua primariamente como um objeto de dados (DTO) que o `AIAgentExecutionService` utiliza para executar tarefas.

**Localização:** `src/domain/entities/ai-agent.entity.ts`

**Interface `AIAgentProps` e Classe `AIAgent`:**
```typescript
// src/domain/entities/ai-agent.entity.ts
// Supondo Value Objects como AIAgentIdVO, ModelProviderVO, LLMModelIdVO

export interface AIAgentProps {
  id: string; // AIAgentIdVO
  name: string;
  roleDescription: string; // Descrição para o prompt do sistema do LLM
  modelId: string; // LLMModelIdVO (ex: "deepseek:deepseek-chat")
  provider: string; // ModelProviderVO (ex: "deepseek")
  temperature: number;
  availableTools: string[]; // Array de IDs ou nomes de ferramentas que o agente pode usar
  isActive: boolean;
  // Outras configurações específicas do agente
}

export class AIAgent {
  public readonly props: AIAgentProps; // Exposto para leitura pela AIAgentExecutionService

  private constructor(props: AIAgentProps) {
    this.props = props;
  }

  public static create(params: {
    id?: string; // Opcional, pode ser gerado
    name: string;
    roleDescription: string;
    modelId: string;
    provider: string;
    temperature?: number;
    availableTools?: string[];
    isActive?: boolean;
  }): AIAgent {
    const id = params.id || crypto.randomUUID(); // Gerar ID
    return new AIAgent({
      id,
      name: params.name,
      roleDescription: params.roleDescription,
      modelId: params.modelId,
      provider: params.provider,
      temperature: params.temperature ?? 0.7,
      availableTools: params.availableTools || [],
      isActive: params.isActive ?? true,
    });
  }

  get id(): string { return this.props.id; }
  get name(): string { return this.props.name; }
  // Outros getters conforme necessário

  public updateConfiguration(updateData: Partial<Pick<AIAgentProps, 'temperature' | 'availableTools' | 'modelId' | 'roleDescription' | 'name' | 'isActive'>>): void {
    this.props = { ...this.props, ...updateData };
    // O chamador (um Caso de Uso, por exemplo) seria responsável por persistir esta entidade atualizada via IAIAgentRepository.
  }
}
```
**Considerações sobre a Entidade `AIAgent`:**
A entidade `AIAgent` é agora primariamente um objeto de dados/configuração. O `AIAgentExecutionService` (detalhado em [`04-ai-agent-execution.md`](./04-ai-agent-execution.md)) é responsável pela lógica de processamento de jobs usando o perfil deste `AIAgent`.

### 2.1.3. Value Objects (`src/domain/entities/value-objects/`)

São objetos imutáveis que representam um conceito descritivo do domínio, como um endereço de e-mail ou um status específico. Eles encapsulam a lógica de validação e o significado desses valores. Exemplos: `JobIdVO`, `EmailVO`, `JobStatusVO`.

## 2.2. Casos de Uso (Use Cases / Interactors) (`src/domain/use-cases/`)

Implementam as regras de negócio específicas da aplicação, orquestrando o fluxo de dados entre as entidades e os repositórios. Representam as ações que o sistema pode realizar e são independentes de frameworks e da UI.

### 2.2.1. `EnqueueJobUseCase` (Exemplo Detalhado)
```typescript
// src/domain/use-cases/job/enqueue-job.use-case.ts
import { injectable, inject } from 'inversify';
import { TYPES } from '@/infrastructure/ioc/types'; // Ajustar caminho se necessário
import { IJobRepository } from '@/domain/repositories/i-job.repository';
import { Job, JobProps } from '@/domain/entities/job.entity'; // JobProps importado para referência

export interface EnqueueJobInput {
  queueName: string;
  jobName: string;   // Tipo/nome do job (para Job.props.name)
  taskPayload: any;  // Dados específicos da tarefa para Job.props.payload
  priority?: number;
  delayUntil?: Date;
  maxAttempts?: number;
  parentId?: string;
  initialJobData?: any; // Dados iniciais para Job.props.data
}

export interface EnqueueJobOutput {
  jobId: string;
  status: string;
  queueName: string;
}

@injectable()
export class EnqueueJobUseCase {
  constructor(
    @inject(TYPES.IJobRepository) private jobRepository: IJobRepository
  ) {}

  async execute(input: EnqueueJobInput): Promise<EnqueueJobOutput> {
    if (!input.queueName || input.queueName.trim().length === 0) {
      throw new Error('Queue name must be provided.');
    }
    if (!input.jobName || input.jobName.trim().length === 0) {
      throw new Error('Job name must be provided.');
    }
    if (input.taskPayload === undefined) {
      throw new Error('Task payload must be provided.');
    }

    const job = Job.create({
      name: input.jobName,
      queueName: input.queueName,
      payload: input.taskPayload,
      priority: input.priority,
      delayUntil: input.delayUntil,
      maxAttempts: input.maxAttempts,
      parentId: input.parentId,
      initialData: input.initialJobData,
    });

    await this.jobRepository.add(job); // Usa IJobRepository.add()

    return {
      jobId: job.id,
      status: job.status,
      queueName: job.props.queueName,
    };
  }
}
```

### 2.2.2. `CreateProjectUseCase` (Exemplo Detalhado)
```typescript
// src/domain/use-cases/project/create-project.use-case.ts
import { injectable, inject } from 'inversify';
import { TYPES } from '@/infrastructure/ioc/types'; // Ajustar caminho
import { IProjectRepository } from '@/domain/repositories/i-project.repository'; // Supondo esta interface
import { Project } from '@/domain/entities/project.entity'; // Supondo esta entidade

export interface CreateProjectInput {
  name: string;
  description?: string;
  ownerUserId: string;
}

export interface CreateProjectOutput {
  projectId: string;
  name: string;
  ownerUserId: string;
  createdAt: Date;
}

@injectable()
export class CreateProjectUseCase {
  constructor(
    @inject(TYPES.IProjectRepository) private projectRepository: IProjectRepository
  ) {}

  async execute(input: CreateProjectInput): Promise<CreateProjectOutput> {
    if (!input.name || input.name.trim().length === 0) {
      throw new Error('Project name cannot be empty.');
    }

    const project = Project.create({
      name: input.name,
      description: input.description,
      ownerUserId: input.ownerUserId,
    });

    await this.projectRepository.save(project); // Supondo save no IProjectRepository

    return {
      projectId: project.id,
      name: project.props.name, // Usando props para acesso se getters não existirem
      ownerUserId: project.props.ownerUserId,
      createdAt: project.props.createdAt,
    };
  }
}
```

## 2.3. Interfaces de Repositório (Ports) (`src/domain/repositories/`)

Definem os contratos (interfaces TypeScript) para as operações de persistência de dados, permitindo que os Casos de Uso e Serviços de Domínio permaneçam independentes das tecnologias de banco de dados.

### 2.3.1. `IJobRepository` (Exemplo Detalhado)
```typescript
// src/domain/repositories/i-job.repository.ts
import { Job } from '../entities/job.entity';
import { JobStatusVO } from '../entities/value-objects/job-status.vo';

export interface JobData {
  [key: string]: any;
}

export interface BackoffOptions {
   type: 'exponential' | 'fixed';
   delay: number;
}

export interface IJobRepository {
  add(job: Job): Promise<void>;
  save(job: Job, lockToken?: string): Promise<void>;
  findById(jobId: string): Promise<Job | null>;
  findNextPending(queueName: string, workerId: string): Promise<{ job: Job; lockToken: string } | null>;
  // Métodos como updateJobData, requestMoveToDelayed etc. foram removidos daqui
  // pois a lógica agora é: jobProcessor modifica Job em memória, Worker chama IJobRepository.save().
}
```
**Nota sobre `IJobRepository.save`:** Este método é central. Ele persiste o estado atual do `Job`. Se `lockToken` é fornecido, ele valida o lock para jobs ativos. Internamente, ao salvar um job com status `FAILED` e tentativas restantes, ele aplica a lógica de backoff (calculando novo `delayUntil`) e pode reverter o status para `PENDING` ou `DELAYED`. Ele também libera o lock para jobs em estado terminal.

### 2.3.2. Outras Interfaces de Repositório

Exemplos incluem:
*   `IAIAgentRepository`: Para persistir e recuperar as configurações/perfis dos `AIAgent`s.
*   `IProjectRepository`: Para persistir e recuperar informações sobre Projetos.

## 2.4. Serviços de Domínio (`src/domain/services/`)

Contêm lógica de negócios significativa que não se encaixa naturalmente em uma única entidade ou que orquestra interações complexas entre múltiplas entidades. São stateless e suas dependências são injetadas.

Um exemplo proeminente de Serviço de Domínio neste sistema é o `AIAgentExecutionService`, que encapsula a lógica de como um Agente de IA processa uma tarefa. Ele será detalhado no documento [`04-ai-agent-execution.md`](./04-ai-agent-execution.md). Outros serviços de domínio podem surgir conforme a necessidade de encapsular regras de negócio complexas que transcendem uma única entidade.
```
