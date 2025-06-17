# Sub-tarefa: Conectar ProcessJobService e Queue

## Descrição:

Implementar a lógica no `ProcessJobService` para utilizar a interface `JobQueue.interface.ts` e adicionar novas Jobs/Activities à fila.

## Contexto:

O `ProcessJobService` é o ponto de entrada para a criação de novas Jobs. Ele precisa interagir com o sistema de fila para enfileirar as Jobs recém-criadas. Esta sub-tarefa foca em conectar o `ProcessJobService` com a interface da fila.

## Specific Instructions:

1. Abra o arquivo da classe `ProcessJobService` (`src/core/application/services/process-job.service.ts`).
2. Injete a dependência da interface `JobQueue.interface.ts` no construtor do `ProcessJobService`.
3. No método de execução do `ProcessJobService` (ex: `execute`), após criar a entidade `Job`/`Activity`, utilize a dependência da `JobQueue.interface.ts` para chamar o método apropriado (ex: `addJob`) e adicionar a Job à fila.
4. Adicione comentários no código explicando a injeção de dependência e a interação com a fila.
5. Não crie testes nesta fase.

## Expected Deliverable:

Arquivo `src/core/application/services/process-job.service.ts` modificado para injetar a dependência da `JobQueue.interface.ts` e utilizar seus métodos para adicionar Jobs à fila.