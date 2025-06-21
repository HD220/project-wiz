# Sub-tarefa: Conectar TaskFactory, Tasks e Adapters

## Descrição:

Implementar a lógica no `TaskFactory` para instanciar as Tasks concretas e injetar as dependências dos Adapters de Infraestrutura (Tools e LLMs) nelas.

## Contexto:

O `TaskFactory` é responsável por criar instâncias de Tasks. As Tasks, por sua vez, precisam de acesso às implementações concretas das Tools e LLMs (os Adapters de Infraestrutura) para realizar suas operações. Esta sub-tarefa foca em conectar o `TaskFactory` com as Tasks e os Adapters, garantindo que as dependências sejam injetadas corretamente durante a criação da Task.

## Specific Instructions:

1. Abra o arquivo da classe `TaskFactory` (`src/core/application/factories/task.factory.ts`).
2. Injete as dependências dos Adapters de Infraestrutura necessários no construtor do `TaskFactory`. Isso pode incluir instâncias dos LLM Adapters e Tool Adapters (ex: `OpenAILLMAdapter`, `FileSystemToolAdapter`, `TerminalToolAdapter`).
3. No método `createTask(taskName: string): Task`, ao instanciar uma Task específica, passe as dependências dos Adapters relevantes para o construtor da Task.
4. Certifique-se de que o `TaskFactory` tenha conhecimento de quais Adapters cada Task requer e injete apenas as dependências apropriadas.
5. Adicione comentários no código explicando a injeção de dependências dos Adapters nas Tasks.
6. Não crie testes nesta fase.

## Expected Deliverable:

Arquivo `src/core/application/factories/task.factory.ts` modificado para injetar as dependências dos Adapters de Infraestrutura e passá-las para as Tasks durante a criação.