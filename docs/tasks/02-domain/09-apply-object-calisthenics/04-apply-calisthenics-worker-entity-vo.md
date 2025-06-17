# Sub-sub-tarefa: Aplicar Object Calisthenics na entidade Worker e Value Object WorkerStatus

## Descrição:

Revisar e refatorar o código da entidade `Worker` e do Value Object `WorkerStatus` para garantir a aderência rigorosa aos princípios de Object Calisthenics.

## Contexto:

Esta sub-sub-tarefa foca em aplicar os princípios de Object Calisthenics especificamente à entidade `Worker` e seu Value Object de status após sua criação/refatoração. Isso garante que eles sejam limpos, modulares e fáceis de entender, encapsulando o conceito de worker e seu estado de forma apropriada. Esta sub-sub-tarefa depende da conclusão da tarefa pai 02.04.

## Specific Instructions:

1.  Abra os arquivos da entidade `Worker` (`src/core/domain/entities/worker/worker.entity.ts` ou similar) e do Value Object `WorkerStatus` (`src/core/domain/entities/worker/value-objects/worker-status.vo.ts` ou similar).
2.  Revise o código de cada classe e seus métodos.
3.  Verifique a aderência aos princípios de Object Calisthenics: Um nível de indentação por método, não usar `else`, encapsular primitivos/strings (se aplicável), First-Class Collections (se aplicável), um ponto por linha, não abreviar, classes/métodos pequenos, no máximo duas variáveis de instância, métodos descrevem o que faz, evitar comentários.
4.  Refatore o código conforme necessário para corrigir quaisquer violações dos princípios.
5.  **Não crie testes** nesta fase.

## Expected Deliverable:

O código-fonte da entidade `Worker` e do Value Object `WorkerStatus` revisado e refatorado, demonstrando alta aderência aos princípios de Object Calisthenics.