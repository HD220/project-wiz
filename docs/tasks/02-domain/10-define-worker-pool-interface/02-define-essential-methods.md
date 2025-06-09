# Sub-tarefa: Definir métodos essenciais da interface WorkerPool

## Descrição:

Definir os métodos essenciais na interface `WorkerPool` para gerenciar o ciclo de vida do pool e a distribuição de Jobs.

## Contexto:

A interface `WorkerPool` precisa expor métodos que permitam iniciar e parar o pool de workers, bem como enviar Jobs para execução. Estes são os métodos fundamentais para a interação da camada de Aplicação com o pool.

## Specific Instructions:

1. Abra o arquivo `src/core/application/ports/worker-pool.interface.ts`.
2. Adicione as assinaturas dos métodos `start(): Promise<void>`, `stop(): Promise<void>` e `distributeJob(job: Job): Promise<void>`.
3. Certifique-se de importar a entidade `Job` (definida na sub-tarefa 02.01).
4. Adicione comentários JSDoc básicos explicando o propósito de cada método.
5. Não implemente a lógica dos métodos nesta fase.
6. Não crie testes nesta fase.

## Expected Deliverable:

Arquivo `src/core/application/ports/worker-pool.interface.ts` com as assinaturas dos métodos `start`, `stop` e `distributeJob` definidas e documentadas com JSDoc básico.