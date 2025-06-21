# Sub-sub-tarefa: Criar/Refatorar Value Object ActivityType

## Descrição:

Criar ou refatorar o Value Object `ActivityType` na camada de domínio para representar os diferentes tipos de atividades que um agente pode processar.

## Contexto:

O tipo da atividade é um atributo importante do `ActivityContext` e da entidade `Job`. Representá-lo como um Value Object garante que ele tenha um tipo forte e encapsule qualquer lógica relacionada aos tipos de atividade.

## Specific Instructions:

1.  Verifique se já existe um Value Object ou Enum para tipos de atividade em `src/core/domain/entities/job/value-objects/activity-type.vo.ts` ou similar. Se existir, refatore-o. Se não, crie um novo arquivo.
2.  Defina o Value Object `ActivityType` com os tipos de atividade necessários (ex: `USER_REQUEST`, `AGENT_REQUEST`, `PLANNING`, `EXECUTION`, etc., conforme listado na documentação de arquitetura).
3.  Garanta que o Value Object seja imutável.
4.  Considere adicionar métodos de fábrica ou validação básica se apropriado para garantir a criação de tipos válidos.
5.  Aplique os princípios de Object Calisthenics na criação/refatoração.
6.  **Não crie testes** nesta fase.

## Expected Deliverable:

O arquivo de código-fonte para o Value Object `ActivityType` na camada de domínio, representando os tipos de atividade e aderindo aos princípios de Object Calisthenics.