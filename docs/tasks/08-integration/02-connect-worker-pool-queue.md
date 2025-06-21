# Sub-tarefa: Conectar WorkerPool e Queue

## Descrição:

Implementar a lógica no `WorkerPool` para monitorar a `Queue` e obter Jobs/Activities para distribuir aos workers.

## Contexto:

O `WorkerPool` é responsável por garantir que os workers estejam ocupados processando Jobs da fila. Ele precisa interagir com a `Queue` para obter as próximas Jobs disponíveis para processamento. Esta sub-tarefa foca em conectar o `WorkerPool` com a interface da fila.

## Specific Instructions:

1. Abra o arquivo da classe `WorkerPool` (`src/core/application/services/worker-pool.service.ts`).
2. Injete a dependência da interface `JobQueue.interface.ts` no construtor do `WorkerPool`.
3. Implemente a lógica no `WorkerPool` para periodicamente (ou através de um mecanismo de notificação da fila) chamar o método apropriado na `JobQueue.interface.ts` (ex: `getNextJob`) para obter a próxima Job a ser processada.
4. Adicione lógica para lidar com o caso em que a fila está vazia.
5. Adicione comentários no código explicando a injeção de dependência e a interação com a fila.
6. Não crie testes nesta fase.

## Expected Deliverable:

Arquivo `src/core/application/services/worker-pool.service.ts` modificado para injetar a dependência da `JobQueue.interface.ts` e implementar a lógica para obter Jobs da fila.