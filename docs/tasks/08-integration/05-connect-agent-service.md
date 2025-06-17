# Sub-tarefa: Conectar Agent e IAgentService

## Descrição:

Implementar a lógica no `AutonomousAgent` para utilizar a interface `IAgentService.interface.ts` para despachar a execução de Tasks.

## Contexto:

O `AutonomousAgent` decide qual Task executar com base no raciocínio do LLM. Ele precisa de um mecanismo para solicitar a execução dessa Task. A interface `IAgentService` fornece esse mecanismo, permitindo que o Agente solicite a execução de Tasks sem ter conhecimento direto do `TaskFactory` ou das implementações concretas das Tasks.

## Specific Instructions:

1. Abra o arquivo da classe `AutonomousAgent` (`src/core/application/services/autonomous-agent.service.ts`).
2. Injete a dependência da interface `IAgentService.interface.ts` no construtor do `AutonomousAgent`.
3. Dentro do método `processActivity`, após o raciocínio do LLM e a decisão sobre a próxima ação, se a ação for executar uma Task, utilize a dependência da `IAgentService.interface.ts` para chamar o método apropriado (ex: `executeTask`), passando o nome da Task e os argumentos necessários.
4. Adicione tratamento de erros para a chamada do `IAgentService`.
5. Adicione comentários no código explicando a injeção de dependência e a interação com o `IAgentService`.
6. Não crie testes nesta fase.

## Expected Deliverable:

Arquivo `src/core/application/services/autonomous-agent.service.ts` modificado para injetar a dependência da `IAgentService.interface.ts` e utilizar seus métodos para despachar a execução de Tasks.