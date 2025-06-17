# Sub-tarefa: Implementar QueueService

## Descrição:

Implementar a classe `QueueService` na camada de Aplicação, responsável por gerenciar a fila de Jobs/Activities.

## Contexto:

O `QueueService` é um dos serviços base da camada de Aplicação. Ele orquestra o ciclo de vida das Jobs na fila, interagindo com o repositório para persistência e recuperação, e gerenciando a lógica de prioridade, status, retentativas e dependências.

## Specific Instructions:

1. Crie um novo arquivo para o `QueueService` (ex: `src/core/application/services/queue.service.ts`).
2. Defina a classe `QueueService` e faça com que ela implemente a interface `JobQueue.interface.ts`.
3. Injete as dependências necessárias, como a interface `JobRepository.interface.ts`.
4. Implemente os métodos definidos na interface `JobQueue.interface.ts`, incluindo a lógica para:
    *   Adicionar novas Jobs/Activities à fila.
    *   Obter a próxima Job/Activity a ser processada (considerando prioridade, status, atrasos e dependências).
    *   Atualizar o status de uma Job/Activity.
    *   Gerenciar a lógica de retentativas e cálculo de atraso.
    *   Gerenciar dependências entre Jobs/Activities, liberando Jobs em status `waiting`.
5. Aplique rigorosamente os princípios de Object Calisthenics na implementação da classe e seus métodos.
6. Não crie testes nesta fase.

## Expected Deliverable:

Um novo arquivo (`src/core/application/services/queue.service.ts`) contendo a implementação da classe `QueueService`, aderindo à interface `JobQueue.interface.ts` e implementando a lógica de gerenciamento da fila, sem testes.