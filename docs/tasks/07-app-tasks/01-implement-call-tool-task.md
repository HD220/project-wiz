# Sub-tarefa: Implementar CallToolTask

## Descrição:

Implementar a classe concreta `CallToolTask` na camada de Aplicação, responsável por executar uma Tool específica.

## Contexto:

A `CallToolTask` é um tipo fundamental de Task que o `AutonomousAgent` pode decidir executar. Ela encapsula a lógica de chamar uma Tool externa através de sua interface, passando os argumentos necessários e retornando o resultado.

## Specific Instructions:

1. Crie um novo arquivo para a classe `CallToolTask` (ex: `src/core/application/tasks/call-tool.task.ts`).
2. Defina a classe `CallToolTask` e faça com que ela implemente a interface base `Task`.
3. Adicione um construtor que receba as dependências necessárias, como a interface `ToolInterface.interface.ts` ou interfaces de Tools mais específicas se definidas (ex: `FileSystemTool.interface.ts`, `TerminalTool.interface.ts`).
4. Implemente o método de execução definido na interface `Task` (ex: `execute(context: ActivityContext, args: any): Promise<any>`).
5. Dentro do método de execução, utilize os argumentos recebidos (`args`) para determinar qual Tool chamar e com quais parâmetros.
6. Utilize a dependência da interface de Tool para invocar a Tool apropriada.
7. Processe o resultado retornado pela Tool e retorne-o como resultado da Task.
8. Adicione tratamento de erros para a execução da Tool.
9. Aplique rigorosamente os princípios de Object Calisthenics na implementação da classe e seus métodos.
10. Não crie testes nesta fase.

## Expected Deliverable:

Um novo arquivo (`src/core/application/tasks/call-tool.task.ts`) contendo a implementação da classe `CallToolTask`, aderindo à interface `Task` e utilizando interfaces de Tool para executar operações externas.