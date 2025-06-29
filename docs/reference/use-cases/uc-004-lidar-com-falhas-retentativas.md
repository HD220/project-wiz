# UC-004: Lidar com Falhas e Retentativas de Tarefas

**ID:** UC-004
**Nome:** Lidar com Falhas e Retentativas de Tarefas (Jobs/Activities)
**Ator Primário:** IJobQueue (notificada pelo Worker).
**Resumo:** Descreve como o sistema gerencia falhas durante o processamento de uma Job, aplicando uma política de retentativa.

## Pré-condições
- Uma Job está sendo processada por um `AutonomousAgent` (invocado por um `Worker`).
- A Job possui uma `RetryPolicy` definida (e.g., `maxAttempts`, `delayBetweenAttempts`).

## Fluxo Principal (Sucesso na Retentativa ou Falha Final)
1. O `AutonomousAgent` (ou uma `ITask`/`ITool` por ele invocada) encontra um erro durante a execução da Job.
2. O `AutonomousAgent` retorna um indicativo de falha ao `Worker`.
3. O `Worker` notifica a `IJobQueue` sobre a falha na execução da Job, fornecendo detalhes do erro se disponíveis.
4. A `IJobQueue` recupera a entidade `Job` (via `IJobRepository`) para verificar seu estado atual e `RetryPolicy`.
5. A `IJobQueue` incrementa o contador `attempts` da Job.
6. A `IJobQueue` verifica se `Job.attempts` excedeu `Job.retryPolicy.maxAttempts`:
   a. **Se `attempts < maxAttempts` (Retentativa Permitida):**
       i. A `IJobQueue` calcula o `delay` para a próxima tentativa (e.g., usando `Job.calculateBackoffDelay()` que considera a `RetryPolicy`).
       ii. A `IJobQueue` atualiza o status da Job para `DELAYED` e define o tempo até a próxima tentativa.
       iii. A Job é persistida com o novo status, contagem de tentativas e tempo de delay.
   b. **Se `attempts >= maxAttempts` (Sem Mais Retentativas):**
       i. A `IJobQueue` atualiza o status da Job para `FAILED`.
       ii. Detalhes do erro final são armazenados no `Job.result` ou `Job.data`.
       iii. A Job é persistida.
7. Após o período de `delay` (para Jobs em `DELAYED`), a `IJobQueue` automaticamente transita a Job de volta para `PENDING` (ou `WAITING` se ainda houver dependências não resolvidas).

## Pós-condições
- Se a retentativa for permitida, a Job é re-agendada (status `DELAYED`, depois `PENDING/WAITING`).
- Se não houver mais retentativas, a Job é marcada como `FAILED` e não será mais processada automaticamente.

## Fluxos Alternativos e Exceções
- **FA-004.1 (Job sem RetryPolicy):** Se a Job não tiver uma `RetryPolicy` definida, a `IJobQueue` pode tratar a primeira falha como final, movendo a Job diretamente para `FAILED`.
- **FA-004.2 (Erro Não Retentável):** O sistema pode definir certos tipos de erros como não retentáveis. Se tal erro ocorrer, a Job é movida para `FAILED` independentemente das tentativas restantes.
