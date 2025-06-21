# Sub-tarefa: Refinar métodos e adicionar outros à interface WorkerPool

## Descrição:

Refinar os métodos essenciais da interface `WorkerPool` e adicionar quaisquer outros métodos necessários para um gerenciamento robusto do pool de workers.

## Contexto:

Além dos métodos básicos de iniciar, parar e distribuir Jobs, a interface `WorkerPool` pode precisar de métodos adicionais para lidar com cenários como notificação de conclusão de Job por workers, gerenciamento de workers individuais, ou recuperação de status do pool. Esta sub-tarefa foca em completar a definição da interface.

## Specific Instructions:

1. Abra o arquivo `src/core/application/ports/worker-pool.interface.ts`.
2. Revise as assinaturas dos métodos `start`, `stop` e `distributeJob`, ajustando tipos de retorno ou parâmetros conforme necessário com base nos requisitos da aplicação.
3. Adicione quaisquer outros métodos que sejam essenciais para a interação da camada de Aplicação com o pool de workers (ex: `onJobCompleted(callback: (jobId: string, result: any) => void): void`, `getWorkerStatus(workerId: string): WorkerStatus`).
4. Certifique-se de importar quaisquer novas entidades ou Value Objects necessários (ex: `WorkerStatus`).
5. Adicione comentários JSDoc completos para todos os métodos, explicando seus parâmetros, retornos e propósito.
6. Não implemente a lógica dos métodos nesta fase.
7. Não crie testes nesta fase.

## Expected Deliverable:

Arquivo `src/core/application/ports/worker-pool.interface.ts` com a interface `WorkerPool` completa, incluindo métodos essenciais refinados e quaisquer métodos adicionais necessários, todos com documentação JSDoc completa.