# 03: Subsistema de Fila de Jobs Genérico

Este documento detalha a arquitetura do subsistema de fila de jobs local, customizado e genérico, que é um componente de infraestrutura fundamental no "project-wiz". Ele é projetado para ser independente do domínio da aplicação principal, permitindo o processamento assíncrono de qualquer tipo de tarefa.

## 3.1. Visão Geral e Princípios

O sistema de filas local é uma peça central da infraestrutura da aplicação, permitindo que tarefas sejam executadas de forma assíncrona e desacoplada dos solicitantes. Sua implementação será customizada, utilizando SQLite (via Drizzle ORM) para persistência, e não dependerá de sistemas de mensageria externos como Redis, RabbitMQ ou BullMQ. Embora seja uma implementação interna, seu design e funcionalidades serão fortemente inspirados pelo BullMQ para oferecer robustez e capacidades avançadas.

Este subsistema é fundamentalmente agnóstico ao domínio. Ele gerencia `Job`s genéricos, e qualquer parte da aplicação pode utilizá-lo. Um exemplo primário de uso será o `AIAgentExecutionService`, que enfileirará tarefas para serem processadas por Agentes de IA, mas o sistema de filas em si não terá conhecimento da natureza dessas tarefas. Cada fila nomeada será processada por um `Worker` dedicado, sendo que cada `Worker` é responsável por monitorar e processar jobs de uma única fila específica.

**Funcionalidades Chave Inspiradas no BullMQ:**
*   **Jobs como Unidade de Trabalho:** A entidade `Job` transporta o `payload` da tarefa e metadados de processamento.
*   **Filas Nomeadas (`queueName`):** Permitem categorizar jobs e dedicar workers a tipos específicos de tarefas.
*   **Workers Dedicados:** Componentes que monitoram uma fila e executam a lógica de processamento.
*   **Gerenciamento Avançado de Estado do Job:** Suporte a estados como `PENDING`, `ACTIVE`, `COMPLETED`, `FAILED`, `DELAYED`, `WAITING_CHILDREN`.
*   **Modificação de Dados do Job em Execução:** O `jobProcessor` pode modificar a propriedade `data` da entidade `Job` (em memória), que é então persistida.
*   **Operações de Fila Controladas:** O `jobProcessor` pode sinalizar a necessidade de adiar um job (`DelayedError`) ou esperar por jobs filhos (`WaitingChildrenError`) após preparar a entidade `Job` em memória. O `Worker` então orquestra a persistência desse estado via `QueueClient`.
*   **Opções de Job Configuráveis:** `attempts` (tentativas), `backoff` (estratégias de adiamento entre tentativas), `priority`, `delay` inicial.
*   **Locks de Job e `workerToken`:** Para garantir que um job ativo seja processado por apenas um worker por vez, o sistema utiliza locks gerenciados pelo `IQueueRepository` e identificados por um `workerToken`.
*   **Jobs Filhos (Parent/Child):** Suporte para estruturar tarefas hierarquicamente.

## 3.2. Componentes Principais do Subsistema de Filas

### 3.2.1. Entidade `Job` (Referência)

A unidade de trabalho no sistema de filas é a entidade `Job`. Ela é um objeto de domínio que encapsula os dados da tarefa, seu estado atual na fila, e metadados de processamento.
*   **Definição Detalhada:** Veja [`02-domain-layer.md#211-entidade-job-exemplo-detalhado`](./02-domain-layer.md#211-entidade-job-exemplo-detalhado).
*   **Papel no Subsistema de Filas:**
    *   A entidade `Job` (instância em memória) é modificada pelo `jobProcessor` para refletir o progresso e o estado desejado (ex: chamando `job.updateData()`, `job.prepareForDelay()`).
    *   O `Worker` então persiste essas modificações através do `QueueClient.saveJob()`.

### 3.2.2. Interface `IQueueRepository` (Porta de Persistência de Fila e Jobs)

Esta interface é o contrato para todas as operações de persistência e gerenciamento de estado de baixo nível dos `Job`s na fila, utilizando SQLite. Ela é central para o subsistema de filas.
*   **Definição Detalhada:** Veja [`02-domain-layer.md#231-iqueuerepository-interface-de-fila-e-persistência-de-jobs`](./02-domain-layer.md#231-iqueuerepository-interface-de-fila-e-persistência-de-jobs).
*   **Responsabilidades Chave no Contexto da Fila (conforme definido em `02-domain-layer.md`):**
    *   `add(job: Job)`: Adicionar novos jobs.
    *   `findById(jobId: string)`: Buscar jobs.
    *   `findNextPending(queueName: string, workerId: string)`: Encontrar o próximo job pendente, aplicar um lock, e retornar o job e o `lockToken`.
    *   `markJobActive(jobId: string, attempts: number, processedAt: Date, workerToken: string)`: Persistir o estado ATIVO de um job.
    *   `updateJobData(jobId: string, data: JobData, workerToken: string)`: Atualizar o campo `data` de um job ativo.
    *   `requestMoveToDelayed(jobId: string, workerToken: string, delayUntilTimestamp: number)`: Mover um job ativo para o estado DELAYED.
    *   `requestMoveToWaitingChildren(jobId: string, workerToken: string)`: Mover um job ativo para WAITING_CHILDREN.
    *   `completeJob(jobId: string, result: any, workerToken: string)`: Marcar um job ativo como COMPLETED.
    *   `failJob(...)`: Marcar um job ativo como FAILED ou re-enfileirá-lo com backoff.

### 3.2.3. `QueueClient` (Fachada para uma Fila Específica)

Para simplificar a interação do `Worker` com sua fila dedicada e para encapsular a lógica de acesso ao `IQueueRepository` para um `queueName` específico, introduzimos o `QueueClient`. Uma instância de `QueueClient` representa uma conexão operacional a uma única fila nomeada.

**Localização Conceitual da Implementação:** `infrastructure/persistence/queue/queue.client.ts`

**Interface `IQueueClient` (Exemplo):**
```typescript
// domain/interfaces/i-queue.client.ts (ou localização similar para interfaces de fachada da infra)
import { Job } from '@/domain/entities/job.entity';
// As interfaces JobData, BackoffOptions não são mais necessárias aqui, pois IQueueRepository.save() lida com isso.

export interface IQueueClient {
  readonly queueName: string;

  /**
   * Obtém o próximo job disponível da fila associada, aplicando um lock.
   * @param workerId O ID do worker que está solicitando o job.
   * @returns Uma promessa para o job e seu lockToken, ou null se nenhum job estiver disponível.
   */
  getNextJob(workerId: string): Promise<{ job: Job; lockToken: string } | null>;

  /**
   * Salva o estado atual completo do Job na persistência.
   * Este método é usado pelo Worker para todas as atualizações de estado de um job
   * que já foi pego (ex: após job.startProcessing(), job.complete(), job.fail(),
   * ou após o jobProcessor preparar o job para DELAYED/WAITING_CHILDREN e lançar um erro).
   * Ele delega para IQueueRepository.save(job, workerToken).
   * @param job A entidade Job com seu estado atualizado em memória.
   * @param workerToken O token de lock que o Worker possui para este job.
   */
  saveJobState(job: Job, workerToken: string): Promise<void>;
}
```

**Implementação Conceitual (`QueueClient`):**
```typescript
// infrastructure/persistence/queue/queue.client.ts
import { IQueueClient } from '@/domain/interfaces/i-queue.client'; // Ajustar caminho
import { IQueueRepository } from '@/domain/repositories/i-queue.repository';
import { Job } from '@/domain/entities/job.entity';

export class QueueClient implements IQueueClient {
  public readonly queueName: string;
  private queueRepository: IQueueRepository;

  constructor(
    queueName: string,
    queueRepository: IQueueRepository
  ) {
    this.queueName = queueName;
    this.queueRepository = queueRepository;
  }

  async getNextJob(workerId: string): Promise<{ job: Job; lockToken: string } | null> {
    return this.queueRepository.findNextPending(this.queueName, workerId);
  }

  async saveJobState(job: Job, workerToken: string): Promise<void> {
    // Este método chama o IQueueRepository.save, que é responsável por toda a lógica
    // de persistência, validação de token, transição de estado (incluindo backoff), e liberação de lock.
    return this.queueRepository.save(job, workerToken);
  }
}
```
O `AgentLifecycleService` (ou similar) seria responsável por criar uma instância de `QueueClient` para cada agente/fila e passá-la para o `Worker` correspondente.

### 3.2.4. `Worker` Genérico (Executor de Jobs)

Um `Worker` é um componente da camada de infraestrutura (`infrastructure/workers/`) responsável por processar jobs de **uma única e específica `queueName`**, através do `QueueClient` que lhe é fornecido. Ele é configurado com esta instância de `QueueClient` e uma função `jobProcessor` genérica no momento de sua instanciação.

**Dependências do `Worker` (Fornecidas na Construção):**
*   `workerId`: `string` (Um identificador único para esta instância do worker)
*   `queueClient`: `IQueueClient` (Instância configurada para a fila específica)
*   `jobProcessor`: `(job: Job) => Promise<any>` (A função que contém a lógica de processamento do job. **Importante:** Não recebe `queueClient` nem `workerToken`.)
*   `LoggerService`: Para logging.

**Responsabilidades do `Worker`:**
1.  **Monitoramento e Retirada de Jobs:**
    *   Chama `this.queueClient.getNextJob(this.workerId)` para obter um `Job` e `lockToken`.
2.  **Início do Processamento:**
    *   Após obter `job` e `lockToken`, chama `job.startProcessing()` (para atualizar o estado do `Job` em memória: status `ACTIVE`, `attempts` incrementado, `processedAt` setado).
    *   Então, persiste este estado inicial chamando `await this.queueClient.saveJobState(job, lockToken);`.
3.  **Execução do `jobProcessor`:**
    *   Invoca `jobProcessor(job)`.
    *   O `jobProcessor`:
        *   Executa a lógica da tarefa, modificando o estado do `Job` *em memória* (ex: chamando `job.updateData(newData)`).
        *   **Não interage diretamente com o `QueueClient` ou `IQueueRepository` para persistência.**
        *   Se precisar adiar, chama `job.prepareForDelay(timestamp)` (em memória) e então lança `DelayedError` para sinalizar ao `Worker`.
        *   Se precisar esperar por jobs filhos, chama `job.prepareToWaitForChildren()` (em memória) e então lança `WaitingChildrenError`.
        *   Retorna um resultado (sucesso) ou lança uma exceção padrão (falha).
4.  **Tratamento de Resultado/Erro e Persistência Final:**
    *   Após a execução do `jobProcessor` (seja qual for o resultado: retorno normal, `DelayedError`, `WaitingChildrenError`, ou outra exceção):
        *   Se `DelayedError` foi lançado: O `job` (que o `Worker` possui) já foi preparado em memória por `job.prepareForDelay()` (chamado pelo `jobProcessor`).
        *   Se `WaitingChildrenError` foi lançado: O `job` já foi preparado em memória por `job.prepareToWaitForChildren()`.
        *   Se conclusão normal (com `processingResult`): O `Worker` chama `job.complete(processingResult)` (atualiza o `job` em memória).
        *   Se outra falha (com `jobProcessingError`): O `Worker` chama `job.fail(jobProcessingError.message)` (atualiza o `job` em memória).
    *   Em **todos** esses casos, o `Worker` chama `await this.queueClient.saveJobState(job, lockToken);` para persistir o estado final/atualizado do `Job`. A implementação de `IQueueRepository.save()` lidará com a lógica de backoff, liberação de lock, etc., com base no estado do `job` passado.
5.  **Liberação de Lock:** A implementação de `IQueueRepository.save()` (chamada via `queueClient.saveJobState()`) é responsável por liberar o lock se o job atingir um estado terminal ou for re-enfileirado.
6.  **Ciclo de Vida:** Deve ser iniciado e parado graciosamente.

## 3.3. Fluxo de Vida de um Job no Sistema de Filas (Resumido)

1.  **Enfileiramento:** `EnqueueJobUseCase` -> `Job.create()` -> `IQueueRepository.add(job)`.
2.  **Obtenção:** `Worker` -> `queueClient.getNextJob(workerId)`.
3.  **Ativação:** `Worker` -> `job.startProcessing()` -> `queueClient.saveJobState(job, lockToken)`.
4.  **Processamento:** `Worker` -> `jobProcessor(job)`.
    *   `jobProcessor` -> `job.updateData()` (em memória).
    *   `jobProcessor` -> `job.prepareForDelay()` -> `throw new DelayedError()`.
    *   `jobProcessor` -> `job.prepareToWaitForChildren()` -> `throw new WaitingChildrenError()`.
5.  **Finalização:** `Worker` (após resultado ou erro do `jobProcessor`) -> (chama `job.complete()`, `job.fail()`, ou o job já está em estado preparado pela entidade `Job` devido ao erro específico) -> `queueClient.saveJobState(job, lockToken)`.

## 3.4. Gerenciamento de Workers e Filas

A instanciação e o gerenciamento do ciclo de vida dos `Worker`s e dos `QueueClient`s associados são tipicamente responsabilidade de um serviço de nível mais alto na inicialização da aplicação (ex: um `AgentLifecycleService` para workers de agentes, ou um `QueueServiceManager` mais genérico).

*   **Configuração dos Agentes (`AIAgent`):** A entidade `AIAgent` contém o `queueName` da fila de jobs dedicada a este agente.
*   **Inicialização dos Workers:**
    *   Um serviço como `AgentLifecycleService` (no processo principal do Electron):
        1.  Carrega as configurações ativas de `AIAgent`.
        2.  Para cada `AIAgent`:
            a.  Obtém a instância de `IQueueRepository` do container DI.
            b.  Cria uma instância de `QueueClient`, passando o `queueName` do agente e o `IQueueRepository`.
            c.  Obtém a instância do `IAIAgentExecutionService` do container DI.
            d.  Chama um método no `IAIAgentExecutionService` (ex: `getJobProcessorForAgent(agentIdOuConfig)`) para obter a função `jobProcessor` específica.
            e.  Cria (instancia) um `Worker`, passando um `workerId` único, a instância de `QueueClient`, a função `jobProcessor`, e o `LoggerService` (de DI).
            f.  Inicia o `Worker`.
*   **Criação de Filas:** As "filas" são conceituais, representadas pelos `Job`s no banco de dados com um `queueName` específico. Ao criar um `AIAgent`, um `queueName` único é associado.
```
