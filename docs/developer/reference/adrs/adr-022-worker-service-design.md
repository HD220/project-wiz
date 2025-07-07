# ADR-022: Design e Concorrência do `WorkerService`

**Status:** Proposto (Considerado Aprovado Conforme Instrução)

**Contexto:**
O `WorkerService` (localizado em `src/core/application/worker/worker.service.ts`) é o componente responsável por retirar jobs da fila, processá-los utilizando uma função processadora específica, e gerenciar o ciclo de vida do job durante sua execução (locks, conclusão, falha). Esta ADR detalha seu design, responsabilidades e o modelo de concorrência atual.

**Decisão:**

Serão adotados os seguintes padrões e entendimentos para o `WorkerService`:

**1. Propósito e Responsabilidades Principais:**
    *   **Polling da Fila:** Consultar ativamente a `AbstractQueue` por jobs disponíveis que estão prontos para processamento.
    *   **Bloqueio de Job (Locking):** Obter um lock exclusivo no job antes de iniciar o processamento para prevenir que outros workers peguem o mesmo job (`AbstractQueue.fetchNextJobAndLock`).
    *   **Execução da Lógica do Job:** Invocar a `ProcessorFunction` fornecida, passando a `JobEntity` para que a lógica de negócios específica do job seja executada.
    *   **Gerenciamento do Ciclo de Vida do Job:**
        *   Reportar o sucesso à fila (`AbstractQueue.markJobAsCompleted`).
        *   Reportar a falha à fila, permitindo que a fila lide com retentativas/backoff (`AbstractQueue.markJobAsFailed`).
        *   Persistir atualizações de progresso e logs feitos pela `ProcessorFunction` através da `AbstractQueue`.
    *   **Renovação de Lock:** Estender periodicamente o lock do job enquanto ele estiver sendo processado para evitar que seja considerado "parado" (stalled) prematuramente.
    *   **Emissão de Eventos:** Emitir eventos sobre o estado do worker e o processamento de jobs.
    *   **Desligamento Gracioso (Graceful Shutdown):** Tentar permitir que jobs ativos completem antes de o worker ser finalizado.

**2. Construtor e Dependências:**
    *   **Padrão:** O construtor do `WorkerService` recebe:
        *   `queue: AbstractQueue<P, R>`: A instância da fila da qual os jobs serão consumidos.
        *   `processor: ProcessorFunction<P, R>`: A função que executa a lógica específica do job (conforme ADR-021).
        *   `opts?: WorkerOptions`: Opções de configuração do worker.
    *   **`WorkerOptions`:**
        *   `concurrency: number` (Padrão: 1. Ver Seção 6 sobre Concorrência).
        *   `lockDuration: number` (ms, Padrão: 30000): Duração do lock inicial obtido para um job.
        *   `lockRenewTimeBuffer: number` (ms, Padrão: `lockDuration / 2` ou um valor fixo como 5000ms): Buffer antes do fim do `lockDuration` para tentar a renovação do lock.
        *   `pollingIntervalMs: number` (ms, Padrão: 1000): Intervalo entre as tentativas de buscar novos jobs quando o worker está ocioso ou a fila está vazia.
    *   **Justificativa:** Injeção clara de dependências e configuração flexível do comportamento do worker.

**3. Loop de Polling e Busca de Jobs:**
    *   **Mecanismo:** O método `run()` inicia um loop de polling (`poll()`) assíncrono.
    *   Cada iteração (`_pollIteration()`) tenta buscar um job usando `this.queue.fetchNextJobAndLock()`.
    *   Se nenhum job for encontrado, o loop pausa pelo `pollingIntervalMs` antes de tentar novamente.
    *   Se um job é obtido, o worker tenta processá-lo.
    *   **Justificativa:** Mecanismo simples e eficaz para consumir jobs de uma fila de forma contínua.

**4. Orquestração da Execução do Job:**
    *   **Chamada ao Processador:** O método `processJob()` orquestra a execução. Ele chama a `this.processor(job)` fornecida.
    *   **Instrumentação da `JobEntity` (Padrão Crítico):**
        *   Antes de passar a `JobEntity` para a `ProcessorFunction`, o `WorkerService` (através do método privado `_instrumentJobForWorker`) sobrescreve temporariamente os métodos `job.updateProgress()` e `job.addLog()` na instância da entidade.
        *   As versões instrumentadas desses métodos fazem duas coisas:
            1.  Chamam a implementação original na `JobEntity` (para atualizar o estado em memória).
            2.  Chamam o método correspondente na `AbstractQueue` (e.g., `this.queue.updateJobProgress(job.id, this.workerId, progress)`), que por sua vez persiste essa mudança no banco de dados via `IJobRepository`.
        *   Após a conclusão (sucesso ou falha) do processador, os métodos originais são restaurados na instância `JobEntity`.
        *   **Justificativa:** Permite que a `ProcessorFunction` interaja com a `JobEntity` de forma natural para reportar progresso e logs, sem precisar conhecer a `AbstractQueue` ou o `workerId`. O `WorkerService` lida transparentemente com a persistência dessas atualizações. Este é um design poderoso, mas que precisa ser bem compreendido por quem escreve processadores.
    *   **Tratamento de Resultado/Erro do Processador:**
        *   Se a `Promise` da `ProcessorFunction` resolve, o `WorkerService` chama `this.queue.markJobAsCompleted(...)`.
        *   Se a `Promise` da `ProcessorFunction` rejeita (lança erro), o `WorkerService` chama `this.queue.markJobAsFailed(...)`.
    *   **Justificativa:** Separa a lógica de negócios (no processador) da lógica de gerenciamento do ciclo de vida do job e da infraestrutura da fila (no `WorkerService` e `AbstractQueue`).

**5. Gerenciamento de Lock (Bloqueio):**
    *   **Obtenção:** O lock é obtido atomicamente com a busca do job via `AbstractQueue.fetchNextJobAndLock()`.
    *   **Renovação Automática:**
        *   O método `setupLockRenewal()` inicia um `setInterval` que periodicamente chama `this.queue.extendJobLock()` antes que o lock atual expire.
        *   O intervalo de renovação é calculado como `opts.lockDuration - opts.lockRenewTimeBuffer`.
        *   `clearLockRenewal()` remove o timer quando o job é finalizado.
    *   **Justificativa:** Previne que jobs longos sejam considerados "parados" (stalled) e re-processados por outros workers enquanto ainda estão em execução válida. Garante que o worker mantenha o "direito" de processar o job.

**6. Modelo de Concorrência:**
    *   **Padrão Atual (Sequencial por Instância):** A implementação analisada do `WorkerService` processa **um job por vez por instância de `WorkerService`**.
        *   O `console.warn` sobre `opts.concurrency > 1` não ser suportado e a lógica em `_pollIteration` que aguarda se `_activeJobs !== 0` confirmam isso.
    *   **Escalabilidade:** Para processar múltiplos jobs em paralelo, múltiplas instâncias do `WorkerService` podem ser executadas (e.g., em diferentes processos ou "threads", se o ambiente permitir e for seguro para a `ProcessorFunction`).
    *   **Consideração Futura (Concorrência Interna):** Uma evolução poderia permitir que uma única instância de `WorkerService` gerenciasse um pool interno de execuções concorrentes da `ProcessorFunction` até o limite de `opts.concurrency`. Isso exigiria uma refatoração significativa do loop de polling e do gerenciamento de jobs ativos.
    *   **Justificativa (Atual):** O modelo sequencial é mais simples de implementar e gerenciar. A escalabilidade horizontal (múltiplas instâncias) é uma forma comum de alcançar concorrência.

**7. Emissão de Eventos:**
    *   **Padrão:** `WorkerService` estende `EventEmitter` e emite eventos para notificar sobre seu estado e o ciclo de vida dos jobs que processa.
    *   **Eventos Padrão:** `worker.error`, `worker.closed`, `worker.job.active`, `worker.job.processed`, `worker.job.errored`, `worker.job.interrupted`.
    *   **Justificativa:** Permite que outras partes da aplicação (e.g., monitoramento, UI, outros serviços) reajam a eventos do worker de forma desacoplada.

**8. Tratamento de Erros Internos do Worker:**
    *   **Padrão:** Erros que ocorrem dentro da lógica do `WorkerService` (e.g., falha ao buscar job, erro ao atualizar status na fila após instrumentação) são emitidos através do evento `worker.error`.
    *   A falha de uma `ProcessorFunction` é tratada especificamente (resultando em `markJobAsFailed`) e também pode gerar um evento `worker.job.errored`.
    *   **Justificativa:** Separa erros da lógica do worker de erros da lógica de negócios do job.

**9. Desligamento Gracioso (`close()`):**
    *   **Padrão:** O método `close()` sinaliza para o loop de polling parar de buscar novos jobs.
    *   Tenta aguardar (`_gracefulShutdown`) por um período (baseado no `lockDuration`) para que o job atualmente ativo complete seu processamento.
    *   Limpa todos os timers de renovação de lock.
    *   Emite `worker.closed`.
    *   **Justificativa:** Previne o término abrupto de jobs em processamento, permitindo um desligamento mais limpo.

**10. Configuração (`WorkerOptions`):**
    *   **Padrão:** As opções (`concurrency`, `lockDuration`, `lockRenewTimeBuffer`, `pollingIntervalMs`) devem ser configuráveis no momento da instanciação do `WorkerService`, permitindo ajuste fino do comportamento do worker para diferentes tipos de filas ou jobs.
    *   **Justificativa:** Flexibilidade.

**Consequências:**
*   Design claro e robusto para o processamento de jobs em segundo plano.
*   Separação eficaz entre a lógica de gerenciamento do worker e a lógica de negócios do job (ProcessorFunction).
*   Mecanismo de locking e renovação de lock confiável.
*   Extensibilidade para diferentes tipos de jobs através de diferentes ProcessorFunctions.
*   Modelo de concorrência atual bem definido (sequencial por instância).

---
**Notas de Implementação para LLMs:**
*   O `WorkerService` é o motor que executa a `ProcessorFunction` que você define para um tipo de job.
*   Ao escrever uma `ProcessorFunction`, você pode confiar que `job.updateProgress()` e `job.addLog()` funcionarão para persistir dados, pois o `WorkerService` os instrumenta.
*   Não se preocupe com a renovação de locks dentro da sua `ProcessorFunction`; o `WorkerService` cuida disso.
*   Lance erros da sua `ProcessorFunction` para indicar falha no job. Retorne o resultado para indicar sucesso.
*   Entenda que, por padrão, cada instância do `WorkerService` processa um job de cada vez.
