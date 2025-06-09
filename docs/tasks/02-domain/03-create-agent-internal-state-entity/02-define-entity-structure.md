# Sub-sub-tarefa: Definir estrutura e campos da entidade AgentInternalState

## Descrição:

Definir a estrutura e os campos da entidade de domínio `AgentInternalState` para representar o estado global de negócio de um agente autônomo.

## Contexto:

A entidade `AgentInternalState` armazena informações de alto nível sobre o agente que persistem entre as execuções de atividades. É necessário definir os campos que compõem este estado, como ID do agente, projeto atual, meta geral, notas, etc., com base na documentação de arquitetura. Esta sub-sub-tarefa depende da sub-sub-tarefa 02.03.01.

## Specific Instructions:

1.  No arquivo da entidade `AgentInternalState` (aberto ou criado na sub-sub-tarefa anterior), defina a estrutura da classe.
2.  Adicione campos privados `readonly` para representar o estado global do agente. Inclua campos como `agentId` (utilizando o VO `AgentId`),`generalNotes`, `promisesMade`, entre outros que representem o estado global do agente conforme a documentação.
3.  Adicione getters públicos para acessar o valor desses campos.
4.  Implemente o construtor para inicializar esses campos.
5.  Garanta que a entidade seja independsente de qualquer lógica de persistência ou infraestrutura.

## Expected Deliverable:

O arquivo da entidade `AgentInternalState` com sua estrutura e campos definidos, incluindo getters e construtor, aderindo aos princípios de encapsulamento do domínio.
