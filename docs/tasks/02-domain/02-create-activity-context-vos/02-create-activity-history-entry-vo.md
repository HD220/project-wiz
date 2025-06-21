# Sub-sub-tarefa: Criar/Refatorar Value Object ActivityHistoryEntry

## Descrição:

Criar ou refatorar o Value Object `ActivityHistoryEntry` na camada de domínio para representar uma única entrada no histórico de conversa de uma atividade.

## Contexto:

O `activityHistory` é um componente crucial do `ActivityContext`, armazenando as interações passadas relacionadas a uma atividade específica. Cada interação (mensagem do usuário, resposta do agente, resultado de ferramenta) será representada por um `ActivityHistoryEntry`. Representá-lo como um Value Object garante imutabilidade e encapsula os dados de uma entrada.

## Specific Instructions:

1.  Verifique se já existe um Value Object para entradas de histórico em `src/core/domain/entities/job/value-objects/activity-history-entry.vo.ts` ou similar. Se existir, refatore-o. Se não, crie um novo arquivo.
2.  Defina o Value Object `ActivityHistoryEntry` com campos essenciais como `role` (ex: 'user', 'agent', 'tool') e `content` (o texto da mensagem ou um resumo do resultado da ferramenta).
3.  Garanta que o Value Object seja imutável.
4.  Considere adicionar validação básica para os campos.
5.  Aplique os princípios de Object Calisthenics na criação/refatoração.
6.  **Não crie testes** nesta fase.

## Expected Deliverable:

O arquivo de código-fonte para o Value Object `ActivityHistoryEntry` na camada de domínio, representando uma entrada no histórico de atividade e aderindo aos princípios de Object Calisthenics.