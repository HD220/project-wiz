# Tarefa Pai: Definir interface de domínio Task

## Descrição:

Esta tarefa pai coordena a definição da interface base na camada de domínio para representar o contrato de uma Task, a unidade de lógica de execução acionável.

## Contexto:

A interface `Task` define o contrato que todas as Tasks concretas devem seguir. Ela especifica o método principal para executar a lógica da Task, recebendo os dados necessários (que virão do `ActivityContext` da Job) e retornando um resultado. Definir esta interface no domínio garante que o `AutonomousAgent` e o `TaskFactory` possam trabalhar com Tasks de forma genérica, independentemente da lógica específica de cada Task. Esta tarefa foi decomposta em sub-tarefas mais granulares para criar o arquivo da interface e definir seus métodos.

## Sub-tarefas:

Esta tarefa pai é composta pelas seguintes sub-tarefas:

*   [02.06.01 - Criar arquivo da interface de domínio Task](06-define-task-interface/01-create-task-interface-file.md)
*   [02.06.02 - Definir método execute da interface de domínio Task](06-define-task-interface/02-define-execute-method.md)

## Expected Deliverable:

A conclusão de todas as sub-tarefas listadas acima, resultando na interface de domínio `Task` definida com o método `execute` que recebe o contexto da atividade.