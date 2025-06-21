# Sub-sub-tarefa: Criar/Refatorar Value Object/Interface ActivityContext

## Descrição:

Criar ou refatorar o Value Object ou interface `ActivityContext` na camada de domínio para encapsular todos os dados específicos de uma atividade do agente.

## Contexto:

O `ActivityContext` é o objeto principal que será armazenado no campo `data` da entidade `Job`. Ele agrega outros Value Objects e dados relevantes para o raciocínio e execução de uma atividade específica (histórico, notas, plano, etc.). Definir sua estrutura no domínio é essencial para a tipagem e o encapsulamento correto. Esta sub-sub-tarefa depende da conclusão das sub-sub-tarefas 02.02.01 a 02.02.03.

## Specific Instructions:

1.  Decida se o `ActivityContext` será um Value Object completo ou apenas uma interface. Um Value Object oferece imutabilidade e encapsulamento de lógica relacionada ao contexto como um todo. Uma interface pode ser suficiente se a lógica principal estiver nos VOs aninhados. **Recomenda-se um Value Object para maior aderência ao Object Calisthenics.**
2.  Crie um novo arquivo para o `ActivityContext` (ex: `src/core/domain/entities/job/value-objects/activity-context.vo.ts` ou `src/core/domain/entities/job/activity-context.interface.ts`).
3.  Defina a estrutura do `ActivityContext` para incluir campos como:
    *   `type: ActivityType` (utilizando o VO da sub-tarefa 02.02.01)
    *   `activityHistory: ActivityHistory` (utilizando o VO da sub-tarefa 02.02.03)
    *   `activityNotes: string[]` (ou um VO para notas)
    *   `plannedSteps: string[]` (ou um VO para o plano)
    *   `toolName?: string`
    *   `toolArgs?: any`
    *   `validationCriteria?: string[]`
    *   `validationResult?: 'PASSED' | 'FAILED' | 'PENDING'`
    *   `parentId?: JobId` (utilizando o VO JobId)
    *   `relatedActivityIds?: JobId[]`
    *   `blockingActivityId?: JobId`
    *   *(Outros campos conforme necessário com base na documentação de arquitetura)*
4.  Se for um Value Object, garanta a imutabilidade e adicione métodos relevantes (ex: para atualizar partes do contexto, retornando uma nova instância).
5.  Aplique os princípios de Object Calisthenics na criação/refatoração.
6.  **Não crie testes** nesta fase.

## Expected Deliverable:

O arquivo de código-fonte para o Value Object ou interface `ActivityContext` na camada de domínio, definindo a estrutura do contexto da atividade e aderindo aos princípios de Object Calisthenics (se for um VO).