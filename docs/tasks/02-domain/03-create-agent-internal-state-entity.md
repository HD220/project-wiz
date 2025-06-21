# Tarefa Pai: Criar/Refatorar entidade AgentInternalState

## Descrição:

Esta tarefa pai coordena a criação ou refatoração da entidade de domínio `AgentInternalState` para representar o estado global de negócio de um agente autônomo, separada do contexto de atividades individuais.

## Contexto:

O `AgentInternalState` armazena informações de alto nível sobre o agente, como o projeto atual, meta geral, notas gerais e promessas feitas. Este estado é persistido e carregado pelo agente para manter a continuidade do seu foco e conhecimento global, distinto do contexto específico de cada atividade que ele processa. Esta tarefa foi decomposta em sub-tarefas mais granulares para realizar a criação/refatoração passo a passo.

## Sub-tarefas:

Esta tarefa pai é composta pelas seguintes sub-tarefas:

*   [02.03.01 - Abrir/Criar arquivo da entidade AgentInternalState](03-create-agent-internal-state-entity/01-open-create-agent-state-file.md)
*   [02.03.02 - Definir estrutura e campos da entidade AgentInternalState](03-create-agent-internal-state-entity/02-define-entity-structure.md)
*   [02.03.03 - Aplicar Object Calisthenics na entidade AgentInternalState](03-create-agent-internal-state-entity/03-apply-object-calisthenics.md)

## Expected Deliverable:

A conclusão de todas as sub-tarefas listadas acima, resultando na entidade `AgentInternalState` criada ou refatorada e aderindo aos princípios de Object Calisthenics.