# Sub-sub-tarefa: Definir método execute da interface de domínio Task

## Descrição:

Definir o método principal `execute` na interface de domínio `Task`, que será o ponto de entrada para a lógica de execução de qualquer Task concreta.

## Contexto:

A interface `Task` define o contrato que todas as Tasks concretas devem seguir. O método `execute` é o método central deste contrato, especificando como a Task recebe os dados necessários (o contexto da atividade) e o que ela retorna (o resultado da execução). Esta sub-sub-tarefa depende da sub-sub-tarefa 02.06.01.

## Specific Instructions:

1.  No arquivo `src/core/domain/ports/task.interface.ts` (criado na sub-sub-tarefa anterior), adicione a assinatura do método `execute`.
2.  Defina a assinatura do método `execute` para receber o contexto necessário e retornar um resultado. A assinatura recomendada é `execute(context: ActivityContext): Promise<any>`.
3.  Utilize o Value Object ou interface `ActivityContext` (definido na sub-tarefa 02.02) como tipo para o parâmetro de contexto.
4.  O tipo de retorno deve ser genérico (`any` ou `unknown`) ou um tipo `Result<T>` para encapsular sucesso ou falha.
5.  Garanta que a interface defina apenas o contrato de execução, sem detalhes de implementação.

## Expected Deliverable:

O arquivo `src/core/domain/ports/task.interface.ts` com a interface `Task` definida e contendo a assinatura do método `execute` que recebe o contexto da atividade.