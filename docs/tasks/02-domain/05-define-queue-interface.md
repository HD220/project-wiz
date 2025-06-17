# Tarefa Pai: Definir interface de domínio Queue

## Descrição:

Esta tarefa pai coordena a definição da interface na camada de domínio que representa o contrato para o gerenciamento de Jobs/Activities pela Queue.

## Contexto:

A interface `JobQueue` (ou similar) na camada de domínio define as operações essenciais que qualquer implementação de fila deve fornecer (adicionar Job, obter próxima Job, atualizar status, etc.). Definir esta interface no domínio garante que a lógica da aplicação que interage com a fila seja independente da implementação concreta da fila (que estará na Infraestrutura). Esta tarefa foi decomposta em sub-tarefas mais granulares para criar o arquivo da interface e definir seus métodos.

## Sub-tarefas:

Esta tarefa pai é composta pelas seguintes sub-tarefas:

*   [02.05.01 - Criar arquivo da interface de domínio JobQueue](05-define-queue-interface/01-create-queue-interface-file.md)
*   [02.05.02 - Definir métodos da interface de domínio JobQueue](05-define-queue-interface/02-define-queue-methods.md)

## Expected Deliverable:

A conclusão de todas as sub-tarefas listadas acima, resultando na interface de domínio `JobQueue` definida com os métodos essenciais para o gerenciamento de Jobs/Activities.