# Sub-tarefa: Implementar LLMReasoningTask

## Descrição:

Implementar a classe concreta `LLMReasoningTask` na camada de Aplicação, responsável por realizar um passo de raciocínio com o LLM.

## Contexto:

A `LLMReasoningTask` é outro tipo fundamental de Task que o `AutonomousAgent` pode decidir executar. Ela encapsula a lógica de interagir com o LLM para realizar um passo específico de raciocínio, como analisar o contexto atual, gerar um plano, ou decidir a próxima ação.

## Specific Instructions:

1. Crie um novo arquivo para a classe `LLMReasoningTask` (ex: `src/core/application/tasks/llm-reasoning.task.ts`).
2. Defina a classe `LLMReasoningTask` e faça com que ela implemente a interface base `Task`.
3. Adicione um construtor que receba as dependências necessárias, como a interface `LLMInterface.interface.ts`.
4. Implemente o método de execução definido na interface `Task` (ex: `execute(context: ActivityContext, args: any): Promise<any>`).
5. Dentro do método de execução, utilize o `ActivityContext` e os argumentos recebidos (`args`) para construir o prompt apropriado para o LLM.
6. Utilize a dependência da interface `LLMInterface` para enviar o prompt ao LLM e obter a resposta.
7. Processe a resposta do LLM para extrair o resultado do raciocínio (ex: a próxima ação a ser tomada, uma atualização do estado).
8. Retorne o resultado do raciocínio como resultado da Task.
9. Adicione tratamento de erros para a interação com o LLM.
10. Aplique rigorosamente os princípios de Object Calisthenics na implementação da classe e seus métodos.
11. Não crie testes nesta fase.

## Expected Deliverable:

Um novo arquivo (`src/core/application/tasks/llm-reasoning.task.ts`) contendo a implementação da classe `LLMReasoningTask`, aderindo à interface `Task` e utilizando a interface `LLMInterface` para realizar raciocínio com o LLM.