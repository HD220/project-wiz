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
*   **Locks de Job e `workerToken`:** Para garantir que um job ativo seja processado por apenas um worker por vez, o sistema utiliza locks gerenciados pelo `IJobRepository` e identificados por um `workerToken`.
*   **Jobs Filhos (Parent/Child):** Suporte para estruturar tarefas hierarquicamente.

## 3.2. Componentes Principais do Subsistema de Filas

### 3.2.1. Entidade `Job` (Referência)

A unidade de trabalho no sistema de filas é a entidade `Job`. Ela é um objeto de domínio que encapsula os dados da tarefa, seu estado atual na fila, e metadados de processamento.
*   **Definição Detalhada:** Veja [`02-domain-layer.md#211-entidade-job-exemplo-detalhado`](./02-domain-layer.md#211-entidade-job-exemplo-detalhado).
*   **Papel no Subsistema de Filas:**
    *   A entidade `Job` (instância em memória) é modificada pelo `jobProcessor` para refletir o progresso e o estado desejado (ex: chamando `job.updateData()`, `job.prepareForDelay()`).
    *   O `Worker` então persiste essas modificações através do `QueueClient.saveJob()`.

### 3.2.2. Interface `IJobRepository` (Porta de Persistência)

Esta interface é o contrato para todas as operações de persistência e gerenciamento de estado de baixo nível dos `Job`s na fila, utilizando SQLite.
*   **Definição Detalhada:** Veja [`02-domain-layer.md#231-ijobrepository-exemplo-detalhado`](./02-domain-layer.md#231-ijobrepository-exemplo-detalhado).
*   **Responsabilidades Chave no Contexto da Fila:**
    *   `add(job: Job)`: Adicionar novos jobs à persistência.
    *   `save(job: Job, lockToken?: string)`: Atualizar jobs existentes. Valida `lockToken` para jobs ativos. Persiste todas as propriedades do `Job` (status, data, delayUntil, attempts, etc.). Lida com a lógica de backoff para retentativas (movendo para `PENDING` ou `DELAYED`). Libera o lock se o job atingir estado terminal.
    *   `findById(jobId: string)`: Buscar jobs.
    *   `findNextPending(queueName: string, workerId: string)`: Encontra o próximo job, aplica um lock (registrando `workerId` e `lockToken`), e retorna o `Job` e o `lockToken`.

### 3.2.3. `QueueClient` (Fachada para uma Fila Específica)

Para simplificar a interação do `Worker` com sua fila dedicada e para encapsular a lógica de acesso ao `IJobRepository` para um `queueName` específico, introduzimos o `QueueClient`. Uma instância de `QueueClient` representa uma conexão operacional a uma única fila nomeada.

**Localização Conceitual da Implementação:** `infrastructure/persistence/queue/queue.client.ts`

**Interface `IQueueClient` (Exemplo):**
```typescript
// domain/interfaces/i-queue.client.ts (ou similar)
import { Job } from '@/domain/entities/job.entity';

export interface IQueueClient {
  readonly queueName: string;

  // Método para o Worker obter o próximo job e um lockToken
  getNextJob(workerId: string): Promise<{ job: Job; lockToken: string } | null>;

  // Método para o Worker persistir o estado final/atualizado do Job
  // Este método usará o IJobRepository.save(job, workerToken) internamente.
  saveJob(job: Job, workerToken: string): Promise<void>;
}
```

**Implementação Conceitual (`QueueClient`):**
```typescript
// infrastructure/persistence/queue/queue.client.ts
import { IQueueClient } from '@/domain/interfaces/i-queue.client'; // Ajustar caminho
import { IJobRepository } from '@/domain/repositories/i-job.repository';
import { Job } from '@/domain/entities/job.entity';

export class QueueClient implements IQueueClient {
  public readonly queueName: string;
  private jobRepository: IJobRepository;

  constructor(
    queueName: string,
    jobRepository: IJobRepository
  ) {
    this.queueName = queueName;
    this.jobRepository = jobRepository;
  }

  async getNextJob(workerId: string): Promise<{ job: Job; lockToken: string } | null> {
    return this.jobRepository.findNextPending(this.queueName, workerId);
  }

  async saveJob(job: Job, workerToken: string): Promise<void> {
    await this.jobRepository.save(job, workerToken);
  }
}
```
O `AgentLifecycleService` (ou similar) seria responsável por criar uma instância de `QueueClient` para cada agente/fila e passá-la para o `Worker` correspondente.

### 3.2.4. `Worker` Genérico (Executor de Jobs)

Um `Worker` é um componente da camada de infraestrutura (`infrastructure/workers/`) responsável por processar jobs de **uma única e específica `queueName`**, através do `QueueClient` que lhe é fornecido. Ele é configurado com esta instância de `QueueClient` e uma função `jobProcessor` genérica no momento de sua instanciação.

**Dependências do `Worker` (Fornecidas na Construção):**
*   `workerId`: `string` (Um identificador único para esta instância do worker)
*   `queueClient`: `IQueueClient` (Instância configurada para a fila específica)
*   `jobProcessor`: `(job: Job) => Promise<any>` (A função que contém a lógica de processamento do job. Não recebe `workerToken` nem `queueClient`.)
*   `LoggerService`: Para logging.

**Responsabilidades do `Worker`:**
1.  **Monitoramento e Retirada de Jobs da Fila Dedicada:**
    *   Executar um loop contínuo para verificar sua `IQueueClient` designada por novos `Job`s.
    *   Chamar `this.queueClient.getNextJob(this.workerId)` para obter o próximo `Job` pendente e um `lockToken` associado.
2.  **Início do Processamento do Job:**
    *   Uma vez que um `Job` e seu `lockToken` são obtidos:
        a.  O `Worker` chama `job.startProcessing()` na instância do `Job`.
        b.  O `Worker` persiste este estado inicial: `await this.queueClient.saveJob(job, lockToken);`.
3.  **Execução do `jobProcessor`:**
    *   Invocar a função `jobProcessor` configurada, passando apenas a instância do `Job`.
4.  **Tratamento de Resultado/Erro Pós-`jobProcessor` e Persistência Final:**
    *   Após a execução do `jobProcessor`:
        *   **Se `DelayedError` foi lançado:** O `Worker` captura. O `job` já foi preparado em memória por `job.prepareForDelay()`. O `Worker` chama `await this.queueClient.saveJob(job, lockToken);`.
        *   **Se `WaitingChildrenError` foi lançado:** Similar ao `DelayedError`. O `Worker` chama `await this.queueClient.saveJob(job, lockToken);`.
        *   **Se Nenhuma Exceção Especial (Conclusão Normal):** O `Worker` chama `job.complete(resultFromProcessor)`. Então, `await this.queueClient.saveJob(job, lockToken);`.
        *   **Se Outra Exceção (Falha Real):** O `Worker` chama `job.fail(error.message)`. Verifica `job.canRetry()`. Se sim, `job.markAsPendingRetry()`; se precisar de backoff, `job.prepareForDelay(timestampBackoff)`. Então, `await this.queueClient.saveJob(job, lockToken);`.
5.  **Liberação de Lock:** A implementação de `this.queueClient.saveJob()` (que chama `IJobRepository.save()`) é responsável por liberar o lock se o job atingir um estado terminal ou for re-enfileirado.
6.  **Ciclo de Vida:** Deve ser iniciado e parado graciosamente.

## 3.3. Fluxo de Vida de um Job no Sistema de Filas (Resumido)

1.  **Enfileiramento:** `EnqueueJobUseCase` -> `Job.create()` -> `IJobRepository.add(job)`.
2.  **Obtenção:** `Worker` -> `queueClient.getNextJob()` (que usa `IJobRepository.findNextPending()` e aplica lock).
3.  **Ativação:** `Worker` -> `job.startProcessing()` -> `queueClient.saveJob(job, lockToken)`.
4.  **Processamento:** `Worker` -> `jobProcessor(job)`.
    *   `jobProcessor` -> `job.updateData()` (em memória).
    *   `jobProcessor` -> `job.prepareForDelay()` -> `throw new DelayedError()`.
5.  **Finalização:** `Worker` (após resultado ou erro do `jobProcessor`) -> `job.complete()/fail()/prepareFor...()` -> `queueClient.saveJob(job, lockToken)`.

## 3.4. Gerenciamento de Workers e Filas

A instanciação e o gerenciamento do ciclo de vida dos `Worker`s e dos `QueueClient`s associados são tipicamente responsabilidade de um serviço de nível mais alto na inicialização da aplicação (ex: um `AgentLifecycleService` para workers de agentes, ou um `QueueServiceManager` mais genérico).

*   **Configuração dos Agentes (`AIAgent`):** A entidade `AIAgent` contém o `queueName` da fila de jobs dedicada a este agente.
*   **Inicialização dos Workers:**
    *   Um serviço como `AgentLifecycleService` (no processo principal do Electron):
        1.  Carrega as configurações ativas de `AIAgent`.
        2.  Para cada `AIAgent`:
            a.  Obtém a instância de `IJobRepository` do container DI.
            b.  Cria uma instância de `QueueClient`, passando o `queueName` do agente e o `IJobRepository`.
            c.  Obtém a instância do `IAIAgentExecutionService` do container DI.
            d.  Chama um método no `IAIAgentExecutionService` (ex: `getJobProcessorForAgent(agentIdOuConfig)`) para obter a função `jobProcessor` específica.
            e.  Cria (instancia) um `Worker`, passando um `workerId` único, a instância de `QueueClient`, a função `jobProcessor`, e o `LoggerService` (de DI).
            f.  Inicia o `Worker`.
*   **Criação de Filas:** As "filas" são conceituais, representadas pelos `Job`s no banco de dados com um `queueName` específico. Ao criar um `AIAgent`, um `queueName` único é associado.
```
