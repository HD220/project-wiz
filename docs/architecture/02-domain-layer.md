# 02: Camada de Domínio

A camada de Domínio é o coração do software. Ela contém a lógica de negócios pura e é completamente independente de qualquer detalhe de infraestrutura ou UI. As dependências de código fonte só podem apontar para dentro desta camada; nada no domínio pode saber sobre as camadas externas.

## 2.1. Entidades (`src/domain/entities/`)

Representam os objetos de negócio fundamentais do sistema, encapsulando tanto o estado (atributos) quanto o comportamento (métodos) que opera sobre esse estado. São persistentes e seguem os princípios de Object Calisthenics. Utilizam Value Objects para atributos primitivos.

### 2.1.1. Entidade `Job` (Exemplo Detalhado)

A entidade `Job` representa uma unidade de trabalho genérica a ser processada pelo sistema de filas. Ela é agnóstica ao domínio específico da aplicação que a utiliza; dados específicos da tarefa são armazenados em `props.payload`, e dados internos do processador do job em `props.data`. Seus métodos (`updateData`, `prepareForDelay`, `startProcessing`, etc.) manipulam apenas seu estado em memória. A persistência dessas alterações é orquestrada pelo `Worker` através do `QueueClient`, que utiliza o `IQueueRepository`.

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
  // backoffOptions: BackoffOptions; // Configuração de backoff pode estar aqui
}
```

**Classe `Job` (Métodos Chave - Foco em Estado em Memória):**
```typescript
// src/domain/entities/job.entity.ts
// (Importações omitidas por brevidade)
// Assume-se a existência de JobStatusVO e crypto.randomUUID globalmente ou importado.
export class Job {
  public props: JobProps;

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
    // backoffOptions?: BackoffOptions;
  }): Job {
    const now = new Date();
    const id = params.id || crypto.randomUUID();
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
      processedAt: undefined,
      finishedAt: undefined,
      result: undefined,
      error: undefined
      // backoffOptions: params.backoffOptions || { type: 'exponential', delay: 1000 },
    });
  }

  get id(): string { return this.props.id; }
  get status(): string { return this.props.status.value; }
  // Outros getters...

  public startProcessing(): void {
    // Validações de estado podem ser adicionadas
    this.props.status = JobStatusVO.create('ACTIVE');
    this.props.attempts += 1;
    this.props.processedAt = new Date();
    this.props.updatedAt = new Date();
  }

  public complete(result: any): void {
    this.props.status = JobStatusVO.create('COMPLETED');
    this.props.result = result;
    this.props.finishedAt = new Date();
    this.props.updatedAt = new Date();
  }

  public fail(error: string): void {
    this.props.status = JobStatusVO.create('FAILED');
    this.props.error = error;
    this.props.finishedAt = new Date();
    this.props.updatedAt = new Date();
  }

  public canRetry(): boolean {
    return this.props.status.is('FAILED') && this.props.attempts < this.props.maxAttempts;
  }

  public markAsPendingRetry(): void {
    this.props.status = JobStatusVO.create('PENDING');
    this.props.updatedAt = new Date();
    this.props.error = undefined;
    this.props.result = undefined;
    this.props.finishedAt = undefined;
    this.props.processedAt = undefined;
  }

  public updateJobData(newData: any): void {
    this.props.data = { ...(this.props.data || {}), ...newData };
    this.props.updatedAt = new Date();
  }

  public prepareForDelay(delayTargetTimestamp: Date): void {
    if (!this.props.status.is('ACTIVE')) { // Ou outro estado válido para adiar
      // throw new Error('Job must be ACTIVE to be prepared for delay.');
    }
    this.props.status = JobStatusVO.create('DELAYED');
    this.props.delayUntil = delayTargetTimestamp;
    this.props.updatedAt = new Date();
  }

  public prepareToWaitForChildren(): void {
    if (!this.props.status.is('ACTIVE')) {
      // throw new Error('Job must be ACTIVE to be prepared to wait for children.');
    }
    this.props.status = JobStatusVO.create('WAITING_CHILDREN');
    this.props.updatedAt = new Date();
  }
}
```

**Interação do `jobProcessor` com Estado e Persistência do `Job`:**

A entidade `Job` (detalhada acima) gerencia seu estado exclusivamente em memória através de seus métodos. A persistência e as operações de fila autorizadas são coordenadas pelo `Worker`, utilizando o `QueueClient` (que, por sua vez, usa o `IQueueRepository` e o `workerToken` apropriado). O `jobProcessor` interage apenas com a instância do `Job` que lhe é passada.

1.  **Manipulação de `job.props.data` (Dados Internos do Job) pelo `jobProcessor`:**
    *   O `jobProcessor` atualiza os dados internos do job (ex: progresso, resultados parciais, histórico de conversa) chamando `job.updateJobData(novosDados);`. Isso modifica `job.props.data` exclusivamente em memória.
    *   O `jobProcessor` **não** chama diretamente nenhum método do `QueueClient` ou `IQueueRepository` para persistir `job.props.data` durante sua execução.
    *   Se a persistência de `job.props.data` for necessária *antes* da conclusão do job (ex: salvar progresso antes de uma etapa longa ou potencialmente falha), o `jobProcessor` deveria:
        1. Chamar `job.updateJobData(dadosCriticos);`
        2. Lançar um erro customizado específico (ex: `IntermediateStateSaveRequiredError`) que o `Worker` possa capturar.
    *   O `Worker`, ao capturar tal erro, seria responsável por chamar `await queueClient.updateJobData(job.id, job.props.data, workerToken);` e então decidir como continuar o processamento do job (ex: re-enfileirar para uma próxima etapa ou terminar). Este cenário de persistência intermediária de `data` é um fluxo avançado.
    *   Normalmente, `job.props.data` é persistido como parte da operação final de `completeJob` ou `failJob` pelo `Worker`.

2.  **Sinalizando Mudanças de Estado da Fila (Delay, Wait for Children) pelo `jobProcessor`:**
    *   Quando o `jobProcessor` determina que um job precisa ser adiado ou aguardar outros jobs:
        1.  Ele chama o método correspondente na instância do `Job` para alterar seu estado *em memória*:
            *   `job.prepareForDelay(timestampDesejado);` (altera `job.props.status` para `DELAYED`, define `job.props.delayUntil`)
            *   `job.prepareToWaitForChildren();` (altera `job.props.status` para `WAITING_CHILDREN`)
            *   Pode também chamar `job.updateJobData()` para garantir que quaisquer dados relevantes sejam associados a este estado preparado.
        2.  Imediatamente após, o `jobProcessor` lança um erro específico (`DelayedError` ou `WaitingChildrenError`).
    *   O `Worker` é responsável por capturar estes erros. A instância do `Job` que o `Worker` possui (a mesma que o `jobProcessor` manipulou) já reflete o estado e os dados preparados em memória.
    *   O `Worker` então chama o método apropriado no `QueueClient` para persistir esta mudança de estado:
        *   Para `DelayedError`: `await queueClient.requestMoveToDelayed(job.id, workerToken, job.props.delayUntil!.getTime());` (O `IQueueRepository` persistirá todo o `job.props`, incluindo `data`).
        *   Para `WaitingChildrenError`: `await queueClient.requestMoveToWaitingChildren(job.id, workerToken);` (Similarmente, persistirá todo `job.props`).
    *   Estes métodos do `QueueClient` utilizam os métodos correspondentes do `IQueueRepository`, que validam o `workerToken`, atualizam o estado completo do job na base de dados (incluindo `data`) e liberam o lock do job.

3.  **Persistência do Estado Final (Completed, Failed) e Ativação Inicial pelo `Worker`:**
    *   **Ativação:** Ao obter um novo job, o `Worker` chama `job.startProcessing()` (em memória) e então `await queueClient.markJobActive(job.id, job.props.attempts, job.props.processedAt!, workerToken);`.
    *   **Conclusão Normal:** Se o `jobProcessor` retorna um resultado, o `Worker` chama `job.complete(resultado)` (em memória) e então `await queueClient.completeJob(job.id, job.props.result, workerToken);`.
    *   **Falha Genérica:** Se o `jobProcessor` lança uma exceção não específica, o `Worker` chama `job.fail(errorMsg)` (em memória) e então `await queueClient.failJob(job.id, job.props.error!, job.props.attempts, job.props.maxAttempts, job.props.backoffOptions, workerToken);`. O `IQueueRepository.failJob` lida com a lógica de retentativas/backoff.

Esta separação de responsabilidades garante que a entidade `Job` permaneça focada em seu estado e regras de negócio intrínsecas (em memória), enquanto o `Worker` e o `QueueClient` (utilizando `IQueueRepository`) gerenciam a complexidade da persistência, concorrência (locks), e as transições de estado autorizadas dentro do sistema de filas.

### 2.1.2. Entidade `AIAgent` (Exemplo Detalhado - Configuração/DTO)
(Conteúdo existente da AIAgent como DTO/Configuração)

### 2.1.3. Value Objects (`src/domain/entities/value-objects/`)
(Conteúdo existente)

## 2.2. Casos de Uso (Use Cases / Interactors) (`src/domain/use-cases/`)
(Conteúdo existente)

### 2.2.1. `EnqueueJobUseCase` (Exemplo Detalhado)
(Conteúdo existente, mas garantir que use `IQueueRepository.add(job)`)

### 2.2.2. `CreateProjectUseCase` (Exemplo Detalhado)
(Conteúdo existente)

## 2.3. Interfaces de Repositório (Ports) (`src/domain/repositories/`)

Definem os contratos (interfaces TypeScript) para as operações de persistência de dados, permitindo que os Casos de Uso e Serviços de Domínio permaneçam independentes das tecnologias de banco de dados.

### 2.3.1. `IQueueRepository` (Interface de Fila e Persistência de Jobs)

Esta é a interface central para todas as interações com a persistência da fila de jobs. Ela define como os jobs são adicionados, recuperados e, crucialmente, como seus estados são salvos e gerenciados, incluindo a lógica de locks para processamento concorrente seguro.

```typescript
// src/domain/repositories/i-queue.repository.ts
import { Job } from '../entities/job.entity';
// JobStatusVO e BackoffOptions seriam usados internamente pela implementação,
// mas não precisam ser expostos diretamente em todos os métodos da interface aqui
// se 'save' for suficientemente inteligente.

export interface IQueueRepository {
  /**
   * Adiciona um novo job à persistência.
   * Usado principalmente pelo EnqueueJobUseCase para jobs recém-criados.
   * @param job A entidade Job a ser adicionada.
   */
  add(job: Job): Promise<void>;

  /**
   * Busca um job pelo seu ID.
   * @param jobId O ID do job a ser buscado.
   * @returns O Job encontrado ou null.
   */
  findById(jobId: string): Promise<Job | null>;

  /**
   * Encontra o próximo job pendente (status PENDING ou DELAYED com delayUntil passado)
   * para uma fila específica. Aplica um lock no job encontrado (registrando workerId
   * e um novo lockToken na persistência com um tempo de expiração) e retorna o
   * job e o lockToken. Se nenhum job estiver disponível, retorna null.
   * @param queueName O nome da fila a ser verificada.
   * @param workerId O ID do worker que está solicitando o job (para fins de lock).
   * @returns Um objeto com o Job e o lockToken, ou null se nenhum job estiver disponível.
   */
  findNextPending(queueName: string, workerId: string): Promise<{ job: Job; lockToken: string } | null>;

  /**
   * Salva o estado atual de uma instância de Job. Este é o método principal
   * para persistir todas as mudanças de estado e dados do job após ele ter sido
   * pego por um Worker.
   * A implementação deste método é responsável por:
   *  - Validar o `lockToken` se o job estava previamente ativo.
   *  - Persistir todas as propriedades do `job` (status, data, attempts, result, error, delayUntil, etc.).
   *  - Lidar com a lógica de transição de estado final na persistência (ex: se job.props.status
   *    é FAILED e job.props.attempts < job.props.maxAttempts, pode aplicar backoff
   *    e salvar como PENDING/DELAYED com novo delayUntil).
   *  - Liberar o lock se o job atingir um estado terminal (COMPLETED, FAILED sem retentativas)
   *    ou se for re-enfileirado (DELAYED, PENDING para retentativa).
   * @param job A entidade Job com seu estado atualizado em memória.
   * @param lockToken O token de lock que o Worker possui para este job. Essencial para autorizar a atualização.
   */
  save(job: Job, lockToken: string): Promise<void>;
}
```
**Nota sobre `IQueueRepository`:**
Com esta definição, o método `save` torna-se o ponto central para atualizar o estado de um job que já está sendo processado ou foi processado. Ele encapsula a lógica de persistir o job em diferentes estados (`ACTIVE` inicial - chamado pelo Worker após `job.startProcessing()`, `COMPLETED`, `FAILED` com ou sem retentativa/backoff, `DELAYED` por intenção do `jobProcessor`, `WAITING_CHILDREN`). O `add` é usado para a inserção inicial de jobs. O `findNextPending` é o ponto de entrada para um `Worker` obter um job e o `lockToken` necessário para modificações subsequentes através do `save`. Métodos mais granulares como `markJobActive`, `completeJob`, `failJob`, `requestMoveToDelayed`, `updateJobData` que existiam anteriormente na interface foram consolidados na responsabilidade do método `save` e na interação entre `Worker`, `jobProcessor` e a entidade `Job` em memória.

### 2.3.2. Outras Interfaces de Repositório
(Conteúdo existente)

## 2.4. Serviços de Domínio (`src/domain/services/`)
(Conteúdo existente, garantindo que referencie `04-ai-agent-execution.md` para `AIAgentExecutionService`)
