# Sub-sub-tarefa: Definir estrutura e campos da entidade Worker

## Descrição:

Definir a estrutura e os campos da entidade de domínio `Worker` para representar um worker capaz de processar Jobs/Activities.

## Contexto:

A entidade `Worker` na camada de domínio representa o conceito de uma unidade de processamento. É necessário definir os atributos essenciais e o estado conceitual de um worker, incluindo seu ID e status, com base na documentação de arquitetura. Esta sub-sub-tarefa depende da conclusão das sub-sub-tarefas 02.04.01 e 02.04.02.

## Specific Instructions:

1.  No arquivo da entidade `Worker` (aberto ou criado na sub-sub-tarefa 02.04.01), defina a estrutura da classe.
2.  Adicione campos privados `readonly` para representar os atributos essenciais do worker. Inclua campos como um identificador único (`workerId`, utilizando um Value Object apropriado como `Identity<string>`) e um status (`status`, utilizando o Value Object `WorkerStatus` da sub-sub-tarefa 02.04.02).
3.  Adicione getters públicos para acessar o valor desses campos.
4.  Implemente o construtor para inicializar esses campos.
5.  Garanta que a entidade `Worker` seja independente de qualquer lógica de infraestrutura (ex: comunicação entre processos, gerenciamento de threads).

## Expected Deliverable:

O arquivo da entidade `Worker` com sua estrutura e campos definidos, incluindo getters e construtor, e utilizando o Value Object `WorkerStatus`, aderindo aos princípios de encapsulamento do domínio.