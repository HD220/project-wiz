# Sub-sub-tarefa: Criar/Refatorar Value Object WorkerStatus

## Descrição:

Criar ou refatorar o Value Object `WorkerStatus` na camada de domínio para representar os possíveis estados de um worker.

## Contexto:

O status do worker é um atributo importante da entidade `Worker`. Representá-lo como um Value Object garante que ele tenha um tipo forte e encapsule qualquer lógica relacionada aos estados do worker.

## Specific Instructions:

1.  Verifique se já existe um Value Object ou Enum para status de worker em `src/core/domain/entities/worker/value-objects/worker-status.vo.ts` ou similar. Se existir, refatore-o. Se não, crie um novo arquivo.
2.  Defina o Value Object `WorkerStatus` com os estados necessários (ex: `Idle`, `Processing`, `Offline`, conforme a documentação de arquitetura).
3.  Garanta que o Value Object seja imutável.
4.  Considere adicionar métodos de fábrica ou validação básica se apropriado para garantir a criação de status válidos.
5.  Aplique os princípios de Object Calisthenics na criação/refatoração.
6.  **Não crie testes** nesta fase.

## Expected Deliverable:

O arquivo de código-fonte para o Value Object `WorkerStatus` na camada de domínio, representando os estados do worker e aderindo aos princípios de Object Calisthenics.