# Tarefa Pai: Refatorar entidade Job para incluir ActivityContext

## Descrição:

Esta tarefa pai coordena a modificação da entidade de domínio `Job` existente para incluir um campo que armazenará o `ActivityContext`, conforme definido na nova arquitetura.

## Contexto:

A entidade `Job` serve como a representação persistida da `Activity` do agente. Para suportar o design orientado a atividades, ela precisa ser capaz de armazenar o contexto específico da atividade (histórico, notas, plano, etc.) de forma flexível. Este contexto será armazenado em um novo campo, geralmente tipado como JSON ou um tipo flexível. Esta tarefa foi decomposta em sub-tarefas mais granulares para realizar a refatoração passo a passo.

## Sub-tarefas:

Esta tarefa pai é composta pelas seguintes sub-tarefas:

*   [02.01.01 - Abrir arquivo da entidade Job](01-refactor-job-entity/01-open-job-entity-file.md)
*   [02.01.02 - Adicionar/Refatorar campo para ActivityContext na entidade Job](01-refactor-job-entity/02-add-activity-context-field.md)
*   [02.01.03 - Atualizar construtor e métodos da entidade Job](01-refactor-job-entity/03-update-constructor-methods.md)
*   [02.01.04 - Aplicar Object Calisthenics na entidade Job](01-refactor-job-entity/04-apply-object-calisthenics.md)

## Expected Deliverable:

A conclusão de todas as sub-tarefas listadas acima, resultando na entidade `Job` refatorada para incluir o campo `ActivityContext` e aderir aos princípios de Object Calisthenics.