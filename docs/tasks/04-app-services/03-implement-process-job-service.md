# Sub-tarefa: Implementar ProcessJobService

## Descrição:

Implementar a classe `ProcessJobService` na camada de Aplicação, responsável por ser o ponto de entrada para a criação de novas Jobs/Activities.

## Contexto:

O `ProcessJobService` é o serviço que a interface do usuário ou outros componentes externos usarão para solicitar a execução de uma nova tarefa. Ele encapsula a lógica de criação da entidade `Job`/`Activity` e sua adição à fila, garantindo que o processo de criação de Jobs seja consistente e siga as regras de domínio.

## Specific Instructions:

1. Crie um novo arquivo para o `ProcessJobService` (ex: `src/core/application/services/process-job.service.ts`).
2. Defina a classe `ProcessJobService`.
3. Injete as dependências necessárias, como a interface `JobQueue.interface.ts` e quaisquer outras interfaces ou fábricas necessárias para criar a entidade `Job`/`Activity`.
4. Implemente um método público (ex: `execute(payload: any): Promise<void>`) que receba o payload inicial da tarefa.
5. Dentro do método, utilize as entidades e Value Objects do Domínio (Tarefa 02) para criar uma nova instância da entidade `Job`/`Activity` a partir do payload.
6. Adicione a nova `Job`/`Activity` criada à fila utilizando a interface `JobQueue.interface.ts`.
7. Aplique rigorosamente os princípios de Object Calisthenics na implementação da classe e seus métodos.
8. Não crie testes nesta fase.

## Expected Deliverable:

Um novo arquivo (`src/core/application/services/process-job.service.ts`) contendo a implementação da classe `ProcessJobService`, responsável por criar e adicionar novas Jobs/Activities à fila, sem testes.