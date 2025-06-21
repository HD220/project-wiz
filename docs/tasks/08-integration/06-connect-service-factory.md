# Sub-tarefa: Conectar IAgentService e TaskFactory

## Descrição:

Implementar a classe concreta que implementa a interface `IAgentService.interface.ts` e utiliza o `TaskFactory` para criar e executar Tasks.

## Contexto:

A interface `IAgentService` é o contrato que o `AutonomousAgent` usa para despachar Tasks. A implementação concreta desta interface atua como um intermediário entre o Agente e o `TaskFactory`, recebendo a solicitação do Agente, utilizando o `TaskFactory` para obter a instância da Task apropriada e executando-a.

## Specific Instructions:

1. Crie um novo arquivo para a implementação concreta do Agent Service (ex: `src/core/application/services/agent.service.ts` ou `src/infrastructure/services/agent.service.ts` - a localização dependerá da decisão arquitetural sobre onde este serviço reside).
2. Defina a classe e faça com que ela implemente a interface `IAgentService.interface.ts`.
3. Injete a dependência do `TaskFactory` no construtor desta classe.
4. Implemente o método `executeTask(taskName: string, taskArgs: any): Promise<any>` definido na interface.
5. Dentro do método `executeTask`, utilize a dependência do `TaskFactory` para chamar o método `createTask(taskName)` e obter a instância da Task.
6. Uma vez obtida a instância da Task, chame o método de execução da Task (ex: `task.execute(context, args)`), passando o contexto e os argumentos apropriados. O contexto necessário para a execução da Task virá do `AutonomousAgent` através do `IAgentService`.
7. Retorne o resultado da execução da Task.
8. Adicione tratamento de erros para a criação e execução da Task.
9. Aplique rigorosamente os princípios de Object Calisthenics na implementação da classe e seus métodos.
10. Não crie testes nesta fase.

## Expected Deliverable:

Um novo arquivo contendo a implementação concreta da interface `IAgentService.interface.ts`, utilizando o `TaskFactory` para criar e executar Tasks.