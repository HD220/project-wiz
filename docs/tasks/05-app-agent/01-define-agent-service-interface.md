# Sub-tarefa: Definir interface AgentService

## Descrição:

Definir a interface `IAgentService` na camada de Aplicação, que servirá como contrato para o despacho de Tasks pelo `AutonomousAgent`.

## Contexto:

O `AutonomousAgent` precisa de um mecanismo para solicitar a execução de Tasks sem ter conhecimento direto das implementações concretas das Tasks. A interface `IAgentService` atua como um Port de saída na camada de Aplicação, permitindo que o Agente "chame" a execução de Tasks através de um contrato bem definido.

## Specific Instructions:

1. Crie um novo arquivo para a interface do Agent Service (ex: `src/core/application/ports/agent-service.interface.ts`).
2. Defina a interface `IAgentService` com um método principal (ex: `executeTask(taskName: string, taskArgs: any): Promise<any>`) que o `AutonomousAgent` usará para despachar Tasks.
3. O método `executeTask` deve receber o nome da Task a ser executada e quaisquer argumentos necessários.
4. O tipo de retorno do método deve ser genérico (`Promise<any>`) ou mais específico se possível, refletindo o resultado da execução da Task.
5. Adicione comentários JSDoc básicos explicando o propósito da interface e do método.
6. Não crie testes nesta fase.

## Expected Deliverable:

Um novo arquivo (`src/core/application/ports/agent-service.interface.ts`) contendo a definição da interface `IAgentService` com o método `executeTask`.