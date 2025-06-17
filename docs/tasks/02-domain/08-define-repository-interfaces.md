# Tarefa Pai: Definir interfaces de domínio para Repositórios (Job e AgentState)

## Descrição:

Esta tarefa pai coordena a definição das interfaces na camada de domínio que representam os contratos para os repositórios de `Job`/`Activity` e `AgentInternalState`.

## Contexto:

As interfaces de repositório na camada de domínio definem as operações de persistência que a lógica de aplicação precisa (salvar, buscar por ID, etc.). Definir essas interfaces no domínio garante que a camada de Aplicação seja independente da tecnologia de persistência subjacente (Drizzle/SQLite na Infraestrutura). Esta tarefa foi decomposta em sub-tarefas mais granulares para criar os arquivos das interfaces e definir seus métodos.

## Sub-tarefas:

Esta tarefa pai é composta pelas seguintes sub-tarefas:

*   [02.08.01 - Criar arquivo da interface de domínio JobRepository](08-define-repository-interfaces/01-create-job-repository-interface-file.md)
*   [02.08.02 - Definir métodos da interface de domínio JobRepository](08-define-repository-interfaces/02-define-job-repository-methods.md)
*   [02.08.03 - Criar arquivo da interface de domínio AgentStateRepository](08-define-repository-interfaces/03-create-agent-state-repository-interface-file.md)
*   [02.08.04 - Definir métodos da interface de domínio AgentStateRepository](08-define-repository-interfaces/04-define-agent-state-repository-methods.md)

## Expected Deliverable:

A conclusão de todas as sub-tarefas listadas acima, resultando nas interfaces de domínio para `JobRepository` e `AgentStateRepository` definidas com os métodos essenciais.