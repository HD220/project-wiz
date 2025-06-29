# Documento de Tarefas Pendentes - Implementação do Sistema de Filas

Este documento detalha as fases e tarefas restantes para a implementação do novo sistema de filas, baseado na arquitetura BullMQ-inspired e nas decisões tomadas.

## Resumo do Progresso Atual:

*   **Fase 0 (Limpeza Total do Repositório):** Concluída. Todos os arquivos do sistema de filas anterior foram removidos.
    *   Commit: `feat: Clear previous queue system implementation for fresh start` (branch `feat/queue-system-reset`)
*   **Fase 1 (Definição do Domínio Principal - `JobEntity` e VOs):** Concluída.
    *   Arquivos criados: `job-id.vo.ts`, `job-options.vo.ts`, `job.entity.ts`.
    *   Commit: `feat(job): Define core Job entity and value objects` (branch `feat/job-domain-entities`)
*   **Correção UUID:** Concluída. `JobIdVO` agora usa `node:crypto.randomUUID()`.
    *   Commit: `fix(job): Use node:crypto.randomUUID for JobIdVO and remove uuid lib` (branch `fix/job-id-crypto`)

## Itens Pendentes para Implementação:

### Fase 2: Interfaces de Aplicação e Persistência

*   **Status Atual:** Arquivos de interface e tipos criados.
    *   `src_refactored/core/application/ports/job-repository.interface.ts` (`IJobRepository`): **Criado.**
    *   `src_refactored/core/application/queue/abstract-queue.ts` (`AbstractQueue<P, R> extends EventEmitter`): **Criado.**
    *   `src_refactored/core/application/worker/worker.types.ts` (`ProcessorFunction<P, R>`, `WorkerOptions`): **Criado.**
*   **Tarefas Pendentes:**
    1.  **Lint dos arquivos criados:**
        *   `job-repository.interface.ts`
        *   `abstract-queue.ts`
        *   `worker.types.ts`
        *   (Esta etapa está atualmente adiada devido a problemas com a configuração global do Prettier/ESLint que afeta múltiplos arquivos ao tentar lintar individualmente).
    2.  **Commit da Fase 2:**
        *   Mensagem de Commit Sugerida: `feat(queue): Define application layer interfaces for queue, worker and job repository`
        *   Branch Sugerido: Continuar em `feat/job-domain-entities` ou criar um novo como `feat/queue-application-interfaces`.

### Fase 3: Implementação da Infraestrutura (Persistência Drizzle e QueueService)

*   **Tarefas Pendentes:**
    1.  **Criar Schema do Job:**
        *   Arquivo: `src_refactored/infrastructure/persistence/drizzle/schema/jobs.schema.ts`
        *   Conteúdo: Definir a tabela `jobsTable` com todas as colunas necessárias para persistir o `JobEntity` (incluindo serialização de `payload`, `options`, `logs`, `returnValue` como JSON/text ou blob).
    2.  **Configurar Drizzle:**
        *   Atualizar `src_refactored/infrastructure/persistence/drizzle/schema/index.ts` para exportar o novo `jobsTable`.
        *   Verificar `drizzle.config.ts`: garantir que `schema/index.ts` (ou o caminho direto para `jobs.schema.ts`) esteja incluído para a geração de migrações.
    3.  **Gerar Migração do Banco de Dados:**
        *   Comando: `npm run db:generate` (ou similar, para criar o arquivo de migração SQL).
    4.  **Aplicar Migração do Banco de Dados:**
        *   Comando: `npm run db:migrate` (ou similar, para executar a migração no banco de dados de desenvolvimento).
    5.  **Implementar `DrizzleJobRepository`:**
        *   Arquivo: `src_refactored/infrastructure/persistence/drizzle/job/drizzle-job.repository.ts`
        *   Conteúdo: Implementar todos os métodos da interface `IJobRepository` utilizando Drizzle ORM para interagir com a `jobsTable`. Realizar mapeamento cuidadoso entre `JobEntity` (e seus VOs) e o formato do schema do banco de dados.
    6.  **Implementar `QueueService`:**
        *   Arquivo: `src_refactored/infrastructure/queue/drizzle/queue.service.ts` (ou nome similar, ex: `drizzle-queue.service.ts`)
        *   Conteúdo: Classe `QueueService<P, R> extends AbstractQueue<P, R>`.
            *   Implementar todos os métodos abstratos de `AbstractQueue` utilizando a instância de `DrizzleJobRepository`.
            *   Lógica para aplicar `defaultJobOptions` ao adicionar jobs.
            *   Lógica para calcular `delayUntil`, `maxAttempts` ao criar jobs.
            *   Lógica em `fetchNextJobAndLock`: encontrar job `WAITING` ou `DELAYED` (cujo `delayUntil` passou), e tentar `acquireLock` no repositório.
            *   Lógica em `markJobAsFailed`: calcular backoff (se aplicável), atualizar status para `DELAYED` (se houver tentativas restantes e backoff) ou `FAILED`. Persistir erro, stacktrace, logs e progresso final.
            *   Lógica para `markJobAsCompleted`: persistir resultado, logs e progresso final.
            *   Lógica para `updateJobProgress` e `addJobLog`: persistir essas informações através do repositório.
            *   Implementar um timer/intervalo simples (ou usar um loop `async` com `setTimeout`) para a funcionalidade de `StalledJobsManager`. Este mecanismo deve:
                *   Ser iniciado por um método público (ex: `startMaintenance()`).
                *   Ser parado no método `close()` da `QueueService`.
                *   Periodicamente (ex: a cada 5-15 segundos):
                    *   Chamar `jobRepository.findStalledJobs(...)` para encontrar jobs com `lockUntil` expirado.
                    *   Para cada job parado, chamar `jobEntity.markAsStalled()`. Se retornar `true` (deve falhar permanentemente), atualizar o job no repositório para `FAILED`. Se `false`, decidir se o job volta para `WAITING` ou `DELAYED` (se tiver backoff configurado e for uma falha por stall). Atualizar o job no repositório.
    7.  **Lint dos arquivos criados** (adiado).
    8.  **Commit da Fase 3.**

### Fase 4: Implementação do WorkerService

*   **Tarefas Pendentes:**
    1.  **Implementar `WorkerService`:**
        *   Arquivo: `src_refactored/core/application/worker/worker.service.ts`
        *   Conteúdo: Classe `WorkerService<P, R> extends EventEmitter`.
            *   Construtor: `(protected readonly queue: AbstractQueue<P, R>, protected readonly processor: ProcessorFunction<P, R>, protected readonly opts: WorkerOptions)`. O `workerId` deve ser gerado internamente (ex: com `randomUUID()`).
            *   Método `run()`: Inicia o loop de processamento de jobs. Deve respeitar a `concurrency`.
            *   Método `close()`: Implementar shutdown gracioso (aguardar jobs ativos terminarem, parar de pegar novos jobs).
            *   Loop de Polling: Chamar `this.queue.fetchNextJobAndLock(this.workerId, this.opts.lockDuration)` para obter jobs.
            *   Gerenciamento de Concorrência: Não pegar mais jobs do que `opts.concurrency` permite.
            *   Execução Segura do `processorFn`: Envolver a chamada em `try/catch`.
            *   Pós-processamento:
                *   Sucesso: Chamar `this.queue.markJobAsCompleted(job.id, this.workerId, result, jobEntityInstance)` passando a instância do job que pode ter logs/progresso atualizados em memória.
                *   Falha: Chamar `this.queue.markJobAsFailed(job.id, this.workerId, error, jobEntityInstance)`.
            *   Renovação de Lock: Implementar lógica para chamar `this.queue.extendJobLock(...)` periodicamente para jobs ativos, antes que o `lockDuration` expire, usando `opts.lockRenewTimeBuffer`.
            *   **Mecanismo para `job.updateProgress` e `job.addLog` dentro do `processorFn`:**
                *   O `WorkerService` deve fornecer ao `JobEntity` (passado para o `processorFn`) uma forma de comunicar atualizações de progresso e logs de volta para a `AbstractQueue`.
                *   **Opção A (Recomendada):** O `WorkerService`, ao receber o `JobEntity` de `fetchNextJobAndLock`, o "decora" ou anexa um "contexto de execução" que inclui referências (bound functions) a `this.queue.updateJobProgress.bind(this.queue, currentJob.id, this.workerId)` e `this.queue.addJobLog.bind(this.queue, currentJob.id, this.workerId)`. Os métodos `job.updateProgress()` e `job.addLog()` na entidade chamariam essas funções do contexto.
                *   **Opção B:** O `JobEntity` apenas atualiza seu estado em memória. O `WorkerService`, após a conclusão (ou falha) do `processorFn`, lê os logs/progresso acumulados da instância do `JobEntity` e os envia para a `AbstractQueue` através de `markJobAsCompleted/Failed`. Isso é menos "em tempo real" para progresso/logs.
            *   Emissão de Eventos Locais do Worker: `worker.job.active`, `worker.job.processed`, `worker.job.errored`, `worker.error`.
    2.  **Lint do arquivo criado** (adiado).
    3.  **Commit da Fase 4.**

### Fase 5: Configuração de Inversão de Dependência (Inversify)

*   **Tarefas Pendentes:**
    1.  **Atualizar `src_refactored/infrastructure/ioc/inversify.config.ts`:**
        *   Registrar a implementação `DrizzleJobRepository` para a interface `IJobRepository` (usando `JOB_REPOSITORY_TOKEN`).
        *   Registrar a implementação `QueueService` para `AbstractQueue`. Isso pode ser feito de forma nomeada se houver múltiplas filas, ou com um token específico para a fila principal. Ex: `appContainer.bind<AbstractQueue<MyPayload, MyResult>>(getQueueServiceToken('emailQueue')).toDynamicValue(...)` ou similar.
    2.  **Commit da Fase 5.**

### Fase 6: Criação do Exemplo de Uso (`queue-usage-example.final.ts`)

*   **Tarefas Pendentes:**
    1.  **Criar Arquivo de Exemplo:**
        *   Demonstrar a obtenção/instanciação do `QueueService` (via Inversify ou diretamente).
        *   Definir uma `processorFn` de exemplo.
        *   Instanciar o `WorkerService` passando a instância da `QueueService` e a `processorFn`.
        *   Adicionar jobs à fila (simples, com delay, com opções de retentativa).
        *   Registrar listeners para eventos emitidos pela `QueueService` (ex: `job.completed`, `job.failed`) e pelo `WorkerService` (ex: `worker.job.active`).
        *   Iniciar o `WorkerService` (`worker.run()`).
        *   Incluir lógica para manter o script rodando por um tempo e depois chamar `worker.close()` e `queue.close()` para um shutdown gracioso.
    2.  **Lint do arquivo criado** (adiado).
    3.  **Commit da Fase 6.**

### Fase 7: Teste Manual e Validação

*   **Tarefas Pendentes:**
    1.  **Executar o Exemplo:** Rodar `queue-usage-example.final.ts`.
    2.  **Validar Funcionalidades:**
        *   Jobs são adicionados e processados.
        *   Jobs com `delay` são processados após o atraso.
        *   Jobs com `attempts` e `backoff` são retentados corretamente em caso de falha.
        *   Progresso e logs são registrados (verificar console ou, idealmente, se persistidos no `JobEntity`).
        *   Eventos da Fila e do Worker são emitidos como esperado.
        *   Funcionalidade de `StalledJobsManager` (se implementada na `QueueService`) move jobs parados.
        *   Shutdown gracioso do worker e da fila funciona.
    3.  **Commit Final:** Se tudo estiver OK, um commit final para esta etapa de implementação.

### Questões Gerais Pendentes:

1.  **Linting/Prettier:** Investigar e corrigir a configuração do ESLint/Prettier para permitir o linting de arquivos individuais sem afetar todo o projeto. Isso será necessário antes de finalizar cada fase idealmente, ou como uma tarefa separada antes do commit final.

Este documento representa o estado atual do planejamento e as tarefas pendentes. Ele será usado para guiar as próximas etapas de desenvolvimento.
