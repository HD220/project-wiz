# Conceito Chave: Activity

No contexto do sistema de agentes autônomos, a **Activity** representa a unidade fundamental de trabalho para o Agente. É a menor porção de uma tarefa ou objetivo que o Agente processa em um determinado momento.

A relação entre Activity e Job é que a **Job** é a representação persistida da Activity no sistema. Quando uma Activity é criada ou atualizada, suas informações são armazenadas em uma entidade Job na fila de processamento. A Job contém o `ActivityContext` dentro do seu campo `data`, garantindo que o estado e o histórico da Activity sejam preservados entre as iterações do Agente e em caso de falhas.

Os principais atributos de uma Activity, conforme definido na arquitetura, incluem:

- `id`: Um identificador único para a Activity.
- `type`: A categoria da Activity, indicando a natureza do trabalho (ex: `USER_REQUEST`, `PLANNING`, `EXECUTION`, `REFLECTION`).
- `description`: Uma breve descrição textual da tarefa que a Activity representa.
- `status`: O estado atual da Activity no ciclo de processamento (ex: `PENDING`, `IN_PROGRESS`, `COMPLETED`, `BLOCKED`).
- `priority`: Um valor numérico que define a urgência ou importância da Activity para fins de priorização pelo Agente.
- `createdAt` / `lastUpdatedAt`: Timestamps que registram quando a Activity foi criada e a última vez que foi atualizada.
- `context`: Um objeto crucial que armazena dados específicos da Activity. Este inclui informações como `activityNotes` (notas internas do Agente), e, fundamentalmente, o `activityHistory` (o histórico de mensagens e interações relacionadas exclusivamente a esta Activity).
- `parentId` / `relatedActivityIds`: Atributos usados para estabelecer relações hierárquicas (Activity pai e sub-Activities) ou de dependência entre Activities.

O `ActivityContext` é de suma importância para o raciocínio do Agente. Ao fornecer ao Large Language Model (LLM) o `activityHistory` específico da Activity que está sendo processada, o sistema garante que o LLM tenha o contexto relevante e isolado para tomar decisões e gerar respostas, evitando confusão com outras tarefas ou conversas. Ele permite que o Agente mantenha o foco e a coerência dentro de cada unidade de trabalho.
