# Sub-tarefa: Implementar código do processo Worker

## Descrição:

Implementar o código que será executado por cada processo worker individual na camada de Infraestrutura.

## Contexto:

Os workers são processos separados que executam as Jobs/Activities. O código do processo worker é o ponto de entrada para a execução de uma Job específica. Ele precisa obter a Job da fila, interagir com o `AutonomousAgent` para processá-la e notificar a fila sobre o resultado.

## Specific Instructions:

1. Crie um novo arquivo para o código do processo worker (ex: `src/infrastructure/workers/job-processor.worker.ts`).
2. Este arquivo será o ponto de entrada para o processo worker. Ele deve conter a lógica principal que será executada quando um novo worker for iniciado.
3. Dentro deste código, implemente a lógica para:
    *   Obter uma instância da `Queue` (utilizando a interface `JobQueue.interface.ts`) para obter a Job a ser processada. A forma como a instância da fila é obtida dependerá do mecanismo de comunicação entre o processo principal e os workers (IPC).
    *   Obter uma instância do `AutonomousAgent` (serviço da camada de Aplicação). A forma como a instância do agente é obtida também dependerá do mecanismo de injeção de dependência e comunicação entre processos.
    *   Entrar em um loop (ou usar um mecanismo baseado em eventos) para obter Jobs da fila.
    *   Para cada Job obtida, chamar o método `processActivity(job)` do `AutonomousAgent`.
    *   Com base no resultado retornado pelo `AutonomousAgent` (resultado final, `undefined` para re-agendar, ou exceção), notificar a `Queue` (utilizando a interface `JobQueue.interface.ts`) para atualizar o status da `Job` (finished, failed, delayed).
    *   Implementar tratamento de erros para o processamento da Job e a interação com o agente.
4. Adicione comentários no código explicando a lógica principal do worker.
5. Não crie testes nesta fase.

## Expected Deliverable:

Um novo arquivo (`src/infrastructure/workers/job-processor.worker.ts`) contendo o código do processo worker, responsável por obter Jobs da fila, processá-las com o `AutonomousAgent` e notificar a fila sobre o resultado.