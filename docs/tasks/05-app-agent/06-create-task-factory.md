# Sub-tarefa: Criar TaskFactory

## Descrição:

Criar a classe `TaskFactory` na camada de Aplicação, responsável por instanciar Tasks concretas com suas dependências injetadas.

## Contexto:

O `AutonomousAgent` precisa de uma maneira de obter instâncias de Tasks para executar as ações decididas pelo LLM. A `TaskFactory` centraliza a lógica de criação de Tasks, garantindo que cada Task seja instanciada corretamente com todas as suas dependências (como interfaces de Tools ou LLMs). Isso segue o princípio de Inversão de Controle e mantém o `AutonomousAgent` desacoplado das implementações concretas das Tasks.

## Specific Instructions:

1. Crie um novo arquivo para a classe `TaskFactory` (ex: `src/core/application/factories/task.factory.ts`).
2. Defina a classe `TaskFactory`.
3. Adicione um construtor que receba as dependências necessárias para criar as diferentes Tasks. Isso pode incluir interfaces de Tools (`ToolInterface.interface.ts`), interfaces de LLMs (`LLMInterface.interface.ts`), ou outras dependências que as Tasks possam precisar.
4. Implemente um método público (ex: `createTask(taskName: string): Task`) que receba o nome da Task como string e retorne uma instância da `Task` correspondente.
5. Dentro do método `createTask`, utilize uma estrutura condicional (ex: `if/else if` ou `switch`) ou um mapa para mapear o `taskName` string para a lógica de criação da instância da Task apropriada.
6. Ao instanciar uma Task, injete as dependências que ela requer, utilizando as dependências recebidas no construtor da `TaskFactory`.
7. Certifique-se de que a `TaskFactory` dependa apenas de interfaces (Ports) e outras abstrações, não de implementações concretas de Infraestrutura.
8. Adicione comentários JSDoc explicando o propósito da classe, do construtor e do método `createTask`.
9. Não crie testes nesta fase.

## Expected Deliverable:

Um novo arquivo (`src/core/application/factories/task.factory.ts`) contendo a implementação da classe `TaskFactory` com o método `createTask` para instanciar Tasks com suas dependências.