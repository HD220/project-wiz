# Pesquisa sobre BullMQ

Este documento resume as principais funcionalidades e conceitos do BullMQ, com base na sua documentação oficial, para orientar a implementação do nosso sistema de filas.

## 1. Visão Geral e Componentes Principais

BullMQ é uma biblioteca robusta para Node.js, construída sobre o Redis, que permite a criação de sistemas de filas de jobs distribuídos e escaláveis. Ela oferece uma API rica para gerenciar o ciclo de vida dos jobs, desde a adição até a conclusão ou falha.

Os componentes principais são:

*   **`Queue`**: Representa uma fila específica. É usada para adicionar jobs à fila e para gerenciar configurações da fila.
    *   Exemplo: `const myQueue = new Queue('Paint');`
*   **`Worker`**: Processa os jobs de uma fila específica. Você define uma função processadora que contém a lógica para executar cada job.
    *   Exemplo: `const worker = new Worker('Paint', async job => { /* ... lógica do job ... */ });`
*   **`QueueScheduler`**: (Importante: **Deprecado a partir do BullMQ v2.0**). Anteriormente, era um componente separado necessário para gerenciar jobs atrasados (`delayed`), jobs parados (`stalled`), e a lógica de repetição de jobs e retentativas com backoff.
    *   **Nota Atual (BullMQ >= v2.0):** A funcionalidade do `QueueScheduler` foi internalizada. A documentação indica que **não é mais necessário instanciar um `QueueScheduler` separado** para que jobs atrasados, retentativas com backoff e jobs repetíveis funcionem corretamente. A própria `Queue` e o `Worker` agora lidam com essas mecânicas, simplificando a configuração. A documentação sobre `QueueScheduler` explicitamente menciona sua depreciação e que as informações são relevantes apenas para versões mais antigas.
*   **`QueueEvents`**: Usado para escutar eventos globais de uma fila que ocorrem em qualquer worker (ex: `completed`, `failed`, `progress`). Isso é útil para monitoramento centralizado ou lógicas que precisam reagir a eventos de jobs independentemente de qual worker os processou.
    *   Exemplo: `const queueEvents = new QueueEvents('Paint'); queueEvents.on('completed', ({ jobId }) => { /* ... */ });`

**Conexão com Redis:** Todas as classes (`Queue`, `Worker`, `QueueEvents`) precisam de detalhes de conexão com o Redis, que podem ser passados em seus construtores. Por padrão, tentam se conectar a `127.0.0.1:6379`.

## 2. Fluxo Básico de um Job

1.  **Adição à Fila:** Um job é adicionado a uma `Queue` com um nome (opcional, mas útil para processadores nomeados) e um payload (dados).
    ```typescript
    // Dentro de um produtor
    import { Queue } from 'bullmq';
    const myQueue = new Queue('email');

    await myQueue.add('sendWelcomeEmail', { userId: 123, email: 'user@example.com' });
    ```
2.  **Espera:** O job aguarda na fila (estado `waiting` ou `delayed` se programado para mais tarde).
3.  **Processamento pelo Worker:** Um `Worker` conectado à mesma fila pega o job (estado `active`). A função processadora do worker é executada.
    ```typescript
    // Dentro de um worker
    import { Worker, Job } from 'bullmq';

    const worker = new Worker('email', async (job: Job) => {
      if (job.name === 'sendWelcomeEmail') {
        const { userId, email } = job.data;
        console.log(`Sending welcome email to ${email} (User ID: ${userId})`);
        // Simula envio de email
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { status: 'sent', userId };
      }
    });
    ```
4.  **Conclusão/Falha:**
    *   Se a função processadora retorna com sucesso, o job é movido para o estado `completed`. O valor de retorno é salvo.
    *   Se a função processadora lança uma exceção, o job é movido para o estado `failed`. A informação do erro é salva.
5.  **Eventos:** Eventos são emitidos durante o ciclo de vida do job (ex: `active`, `completed`, `failed`, `progress`), que podem ser escutados no `Worker` (eventos locais) ou globalmente usando `QueueEvents`.

## 3. Principais Funcionalidades e Como Usá-las

### 3.1. Adicionando Jobs

*   **Job Simples:**
    ```typescript
    await queue.add('jobName', { data: 'payload' });
    ```
*   **Com Opções:**
    ```typescript
    await queue.add('jobName', { data: 'payload' }, {
      attempts: 3, // Número de tentativas
      delay: 5000, // Atraso em milissegundos antes do processamento
      priority: 2, // Jobs com prioridade menor (ex: 1) são processados antes
      removeOnComplete: true, // Remove o job do Redis ao completar
      removeOnFail: false,    // Mantém o job no Redis ao falhar
      jobId: 'custom-unique-id' // ID customizado para o job (para deduplicação ou referência)
    });
    ```
*   **Jobs em Massa (`addBulk`):**
    ```typescript
    await queue.addBulk([
      { name: 'job1', data: { id: 1 } },
      { name: 'job2', data: { id: 2 }, opts: { delay: 1000 } }
    ]);
    ```

### 3.2. Processando Jobs

A função processadora do `Worker` recebe um objeto `job`.

*   **Acessando Dados do Job:**
    ```typescript
    const worker = new Worker(queueName, async (job: Job) => {
      console.log(`Processing job ${job.id} with name ${job.name}`);
      console.log('Data:', job.data);
      // ...
    });
    ```
*   **Reportando Progresso (`job.updateProgress`):**
    ```typescript
    await job.updateProgress(50); // Progresso como número (0-100)
    await job.updateProgress({ stage: 'processing', percentage: 75 }); // Progresso como objeto
    ```
    O evento `progress` pode ser escutado no `Worker` ou `QueueEvents`.
*   **Adicionando Logs (`job.log`):** (Menos comum nos exemplos básicos, mas `job.updateData` pode ser usado para armazenar informações dinâmicas se necessário, ou logs podem ser externos). A documentação mais recente foca em `updateProgress`. BullMQ Pro tem `job.log`. Para a versão base, o progresso é o principal meio de comunicação durante a execução.
*   **Retornando Valores:** O valor retornado pela função processadora é salvo em `job.returnvalue` e emitido no evento `completed`.

### 3.3. Jobs Repetíveis (`repeat` options)

Jobs podem ser configurados para repetir com base em um padrão cron ou um intervalo.

**Importante:** A documentação sobre "Repeatable Jobs" (`queue.add` com `opts.repeat`) menciona que **a partir do BullMQ v5.16.0, essa API está depreciada em favor de "Job Schedulers"**. A nova API de "Job Schedulers" (guia separado na documentação) é agora a forma recomendada e mais robusta para lidar com jobs repetíveis.

No entanto, a funcionalidade original de `opts.repeat` (agora depreciada) era:
```typescript
// Exemplo da API depreciada (para entendimento histórico):
// Repetir a cada hora
await queue.add('hourlyReport', { data: '...' }, {
  repeat: {
    pattern: '0 * * * *', // Cron pattern
  }
});

// Repetir a cada 5 segundos, no máximo 10 vezes
await queue.add('frequentTask', { data: '...' }, {
  repeat: {
    every: 5000, // Milissegundos
    limit: 10
  }
});
```
A `Queue` (internamente, sem `QueueScheduler` explícito desde BullMQ v2.0) se encarregaria de adicionar as próximas ocorrências do job como jobs atrasados.

**Gerenciamento de Jobs Repetíveis (API depreciada):**
*   `queue.getRepeatableJobs()`: Listar configurações de jobs repetíveis.
*   `queue.removeRepeatableByKey(key)` ou `queue.removeRepeatable(name, repeatOptions)`: Remover configurações.

**Nova Abordagem (Job Schedulers - a partir de BullMQ v5.16.0):**
A documentação "Job Schedulers" descreve uma forma mais explícita e gerenciável de definir schedules para jobs, que parece substituir a antiga opção `repeat`.
```typescript
// Exemplo conceitual baseado na ideia de "Job Schedulers" (a API exata precisa ser verificada na seção "Job Schedulers")
// Esta é uma interpretação, pois a documentação de "Repeatable" aponta para "Job Schedulers"
// como a nova forma. A instância de JobScheduler é criada para uma fila.

// (A documentação de "Job Schedulers" precisa ser consultada para a sintaxe exata de adicionar schedules)
// A ideia é que um JobScheduler associado à fila gerencia essas repetições.
// O QueueScheduler (o antigo, agora depreciado) não é mais necessário para isso.
```
**Nota crucial sobre Jobs Repetíveis e o `QueueScheduler`:** A documentação sobre "Repeatable Jobs" e "Queues" afirma que o `QueueScheduler` **não é mais necessário desde BullMQ v2.0** para que jobs repetíveis (ou jobs atrasados) funcionem. A lógica foi internalizada. A página do `QueueScheduler` confirma sua depreciação.

### 3.4. Jobs Atrasados (`delay` option)

Jobs podem ser adicionados com um atraso antes de se tornarem disponíveis para processamento.
```typescript
await queue.add('delayedJob', { data: '...' }, { delay: 60000 }); // Atraso de 1 minuto
```
BullMQ (versões >= 2.0) lida com a promoção desses jobs para a lista de espera automaticamente, sem a necessidade de um `QueueScheduler` explícito.

### 3.5. Controle de Tentativas (`attempts` e `backoff` options)

Quando um job falha, ele pode ser automaticamente retentado.
```typescript
await queue.add('flakyJob', { data: '...' }, {
  attempts: 5, // Tentar até 5 vezes
  backoff: {
    type: 'exponential', // Estratégia de backoff: 'fixed' ou 'exponential'
    delay: 1000,         // Atraso base para backoff (ms)
  }
});
```
*   **Estratégias de Backoff:**
    *   `fixed`: Retenta após um atraso fixo.
    *   `exponential`: O atraso aumenta exponencialmente a cada tentativa (ex: 1s, 2s, 4s, ...).
    *   `jitter`: Pode ser adicionado a `fixed` ou `exponential` para introduzir aleatoriedade no delay, ajudando a evitar picos de carga.
*   **Backoff Customizado:** Pode ser definido nas configurações do `Worker`.
    ```typescript
    const worker = new Worker('myQueue', processor, {
      settings: {
        backoffStrategy: (attemptsMade, type, err, job) => {
          if (type === 'customType') return attemptsMade * 2000;
          return 1000; // default
        }
      }
    });
    await queue.add('jobWithCustomBackoff', {}, { attempts: 3, backoff: { type: 'customType' } });
    ```
*   Se a função `backoffStrategy` retornar `-1`, o job não será retentado e irá para o estado `failed`.
*   A lógica de retentativa e backoff é gerenciada internamente (desde BullMQ v2.0), não requerendo mais um `QueueScheduler` explícito.

### 3.6. Prioridades (`priority` option)

Jobs com um valor de prioridade menor são processados antes de jobs com valor de prioridade maior. O padrão é 0 se não especificado.
```typescript
await queue.add('highPriorityJob', { data: '...' }, { priority: 1 });
await queue.add('lowPriorityJob', { data: '...' }, { priority: 10 });
```

### 3.7. Eventos

BullMQ usa `EventEmitter` extensivamente.
*   **Eventos Locais (no `Worker` ou `Queue`):**
    *   `worker.on('completed', (job, returnValue) => { ... });`
    *   `worker.on('failed', (job, error) => { ... });`
    *   `worker.on('progress', (job, progress) => { ... });`
    *   `worker.on('active', (job) => { ... });` (Quando o worker começa a processar o job)
    *   `worker.on('drained', () => { ... });` (Quando a fila esvazia e não há mais jobs esperando ou ativos com `concurrency` > 1)
    *   `worker.on('error', (err) => { /* Erro no próprio worker */ });` (Importante para evitar exceções não tratadas)
    *   `queue.on('waiting', (jobId) => { ... });` (Quando um job entra no estado de espera, pode ser após um delay)
*   **Eventos Globais (com `QueueEvents`):**
    Permitem escutar eventos de todos os workers de uma fila em um único lugar. Usa Redis Streams para garantir a entrega.
    ```typescript
    import { QueueEvents } from 'bullmq';
    const queueEvents = new QueueEvents('Paint');

    queueEvents.on('completed', ({ jobId, returnvalue }) => { /* ... */ });
    queueEvents.on('failed', ({ jobId, failedReason }) => { /* ... */ });
    queueEvents.on('progress', ({ jobId, data }) => { /* ... */ });
    // Outros eventos: 'added', 'delayed', 'waiting', 'active', 'stalled', 'resumed', 'removed', 'cleaned', 'drained', 'paused'
    ```

### 3.8. Gerenciamento de Jobs e Filas

A classe `Queue` oferece vários métodos para gerenciar jobs:
*   `queue.getJob(jobId)`: Obter um job.
*   `queue.getJobs(types, start, end, asc)`: Obter múltiplos jobs por estado (ex: `['wait', 'active', 'delayed']`).
*   `job.remove()`: Remover um job.
*   `job.retry()`: Mover um job falhado para o estado de espera para ser retentado.
*   `queue.pause()` / `queue.resume()`: Pausar/Retomar o processamento de jobs pela fila.
*   `queue.clean(gracePeriod, limit, status)`: Limpar jobs antigos de certos estados.
*   `queue.obliterate()`: Remover completamente a fila e todos os seus jobs (ação destrutiva).
*   `queue.drain()`: Remove todos os jobs de todos os status.

### 3.9. Stalled Jobs (Jobs Parados)

Um job se torna `stalled` se um worker o pegou mas não o completou/falhou dentro de um tempo (`lockDuration` no Worker, padrão 30s) e não renovou o lock.
*   Workers tentam renovar o lock periodicamente enquanto processam um job.
*   Desde BullMQ v2.0, a detecção e o tratamento de jobs parados (movendo-os de volta para `waiting` ou `failed` após `maxStalledCount`) é uma funcionalidade gerenciada internamente, não necessitando mais de um `QueueScheduler` explícito.
*   O `Worker` tem opções como `lockDuration`, `lockRenewTime`, `maxStalledCount`.

## 4. O Papel do `QueueScheduler` (e sua Depreciação)

Conforme mencionado, a documentação do BullMQ (nas seções "Queues", "Repeatable Jobs", e "QueueScheduler") é clara:
*   **Antes do BullMQ v2.0:** Um `QueueScheduler` era uma classe separada e **necessária** para:
    *   Mover jobs atrasados (`delayed`) para a fila de espera (`waiting`) quando o tempo chegasse.
    *   Detectar e tratar jobs parados (`stalled`).
    *   Gerenciar a lógica de retentativas com backoff.
    *   Lidar com jobs repetíveis.
*   **A partir do BullMQ v2.0:** Essas funcionalidades foram **internalizadas**. **Não é mais necessário instanciar um `QueueScheduler`**. A `Queue` e o `Worker` cuidam dessas tarefas. A página de documentação do `QueueScheduler` explicitamente o marca como **deprecado** e afirma que as informações são relevantes apenas para versões mais antigas.

Isso simplifica significativamente a arquitetura necessária, pois não há mais um processo/componente separado para executar essas tarefas de manutenção da fila.

## 5. Conclusões e Pontos Chave para Nossa Implementação

1.  **Componentes Centrais:** Focaremos em `Queue` (para adicionar e gerenciar jobs) e `Worker` (para processar jobs). `QueueEvents` será útil para observabilidade e reações globais.
2.  **`QueueScheduler` Não é Necessário:** Não implementaremos um `QueueScheduler` separado, pois sua funcionalidade foi absorvida pela `Queue` e `Worker` nas versões recentes do BullMQ (>2.0) que devemos nos basear.
3.  **Jobs Repetíveis:**
    *   Se a funcionalidade de jobs repetíveis for necessária, devemos investigar a **nova API de "Job Schedulers"** mencionada na documentação do BullMQ (a partir da v5.16.0), em vez da antiga opção `opts.repeat` que está depreciada.
    *   Se a "nova" API de Job Schedulers ainda implicar em uma classe separada como `JobScheduler` (diferente do *antigo e depreciado* `QueueScheduler`), então precisaremos considerar esse componente. A documentação sobre "Repeatable" aponta para a seção "Job Schedulers" para a forma moderna. **Atualização após ler a seção "Job Schedulers":** A seção "Job Schedulers" na documentação do BullMQ (que substitui a API `opts.repeat` para jobs repetíveis) **não introduz uma nova classe chamada `JobScheduler` que o usuário precisa instanciar e gerenciar como o antigo `QueueScheduler`**. Em vez disso, parece ser uma API mais robusta dentro da própria `Queue` para definir, gerenciar e remover "job schedulers" (configurações de repetição). A lógica de quando adicionar a próxima instância do job repetível provavelmente ainda é tratada internamente pela `Queue` e/ou `Worker`, sem a necessidade de um processo externo como o antigo `QueueScheduler`. Isso está alinhado com a depreciação geral do `QueueScheduler` explícito.
4.  **Eventos:** Adotar `Queue` e `Worker` como `EventEmitter`s para eventos locais. Usar `QueueEvents` para eventos globais, conforme o padrão BullMQ.
5.  **Configurações de Job:** Implementar suporte para opções importantes como `attempts`, `backoff`, `delay`, `priority`, `removeOnComplete`, `removeOnFail`.
6.  **Persistência e Estado:** A lógica de como os jobs são armazenados e como seus estados são atualizados no Redis é gerenciada pelo BullMQ. Nosso `IJobRepository` será a abstração sobre a forma como *nossa aplicação* interage com a biblioteca de fila (BullMQ ou sua abstração).
7.  **Tratamento de Erros:** A função processadora do worker deve lançar `Error` para que o BullMQ mova o job para `failed` corretamente. O worker deve ter um listener para o evento `'error'` para capturar erros internos do worker.
8.  **Comunicação Worker -> Job:** `job.updateProgress()` é o método padrão para o worker atualizar o progresso de um job.

Esta pesquisa reforça a correção do usuário sobre o papel limitado da `Queue` (não processa jobs, não tem um scheduler ativo para mover jobs delayed/stalled por conta própria no sentido de ter um loop de polling explícito visível ao usuário) e a importância de um componente de scheduler (que no BullMQ moderno é internalizado, mas cujas *funções* ainda existem). Para jobs repetíveis, a nova API "Job Schedulers" é o caminho.

Este documento deve servir como uma boa base para o design da nossa implementação, alinhando-a com as práticas e capacidades do BullMQ.
