# Sub-tarefa: Implementar WorkerPool

## Descrição:

Implementar a classe `WorkerPool` na camada de Aplicação, responsável por gerenciar um pool de workers e distribuir Jobs entre eles.

## Contexto:

O `WorkerPool` é outro serviço base da camada de Aplicação. Ele atua como um orquestrador para os workers, mantendo um pool de workers disponíveis e distribuindo as Jobs que recebe do `QueueService`. Ele depende da interface `WorkerPool.interface.ts` e interage com as implementações concretas de workers na camada de Infraestrutura (embora a lógica de gerenciamento do pool esteja na Aplicação).

## Specific Instructions:

1. Crie um novo arquivo para o `WorkerPool` (ex: `src/core/application/services/worker-pool.service.ts`).
2. Defina a classe `WorkerPool` e faça com que ela implemente a interface `WorkerPool.interface.ts`.
3. Injete as dependências necessárias, como a interface para a criação de workers (a ser definida ou referenciada).
4. Implemente os métodos definidos na interface `WorkerPool.interface.ts`, incluindo a lógica para:
    *   Manter um pool de workers disponíveis (pode ser um array ou outra estrutura de dados).
    *   Distribuir Jobs/Activities para workers disponíveis (selecionar um worker e enviar a Job).
    *   Receber notificações dos workers sobre o desfecho do processamento (pode ser via callbacks ou eventos).
    *   Iniciar e parar o pool de workers.
5. Aplique rigorosamente os princípios de Object Calisthenics na implementação da classe e seus métodos.
6. Não crie testes nesta fase.

## Expected Deliverable:

Um novo arquivo (`src/core/application/services/worker-pool.service.ts`) contendo a implementação da classe `WorkerPool`, aderindo à interface `WorkerPool.interface.ts` e implementando a lógica de gerenciamento do pool de workers, sem testes.