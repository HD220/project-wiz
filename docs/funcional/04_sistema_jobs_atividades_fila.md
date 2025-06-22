# Sistema de Jobs, Atividades e Fila

O Project Wiz utiliza um sistema robusto de Jobs (que representam Atividades ou Tarefas) e Filas para gerenciar o trabalho executado pelos Agentes de IA. Este sistema é inspirado em conceitos de bibliotecas como BullMQ e é persistido em SQLite.

## Funcionalidades Principais:

1.  **Definição de Job/Atividade:**
    *   Um `Job` é a unidade fundamental de trabalho.
    *   Atributos de um Job incluem:
        *   `id`: Identificador único.
        *   `queueName`: O nome da fila específica do Agente à qual este Job pertence.
        *   `jobName`: Um nome ou tipo para o Job, usado para associá-lo a uma função processadora específica do Agente.
        *   `payload`/`data`: Os dados ou informações de entrada necessários para executar o Job.
        *   `status`: O estado atual do Job no seu ciclo de vida (ex: `pending`, `active`, `completed`, `failed`, `delayed`, `waiting`, `waiting_children`).
        *   `priority`: Nível de prioridade do Job.
        *   `dependsOnJobIds`: Lista de IDs de outros Jobs dos quais este Job depende.
        *   `parentJobId`: ID do Job pai, caso este seja um Sub-Job.
        *   `opts`: Opções de execução (ex: número máximo de tentativas, política de backoff para retentativas).
        *   `createdAt`, `updatedAt`, `startedAt`, `completedAt`, `failedAt`, `delayedUntil`: Timestamps para rastreamento.
        *   `result`: Resultado da execução do Job.
        *   `activityContext`: (Ou referência a ele) O contexto detalhado da atividade associada ao Job.

2.  **Criação e Enfileiramento de Jobs:**
    *   Agentes IA criam Jobs para si mesmos e os submetem a uma `queueName` específica (sua fila dedicada).
    *   Casos de uso (`EnqueueJobUseCase`) e serviços (`QueueService`) lidam com a adição de novos Jobs à fila e sua persistência.

3.  **Gerenciamento de Múltiplas Filas Nomeadas:**
    *   O sistema suporta múltiplas filas, cada uma identificada por um `queueName`.
    *   Tipicamente, cada Agente/Persona opera sobre sua própria `queueName` dedicada.

4.  **Ciclo de Vida e Transições de Estado:**
    *   Jobs progridem por um ciclo de vida definido por seus status.
    *   O `QueueService` e a lógica do Agente gerenciam as transições de estado válidas.

5.  **Processamento de Jobs por Workers (Agentes):**
    *   Agentes atuam como "Workers" para suas próprias filas.
    *   Eles solicitam à `QueueService` o próximo Job elegível de sua `queueName`.
    *   Um `JobProcessor` (parte da lógica do Agente) é responsável por executar a lógica específica do `jobName`.

6.  **Priorização de Jobs:**
    *   Jobs podem ser priorizados, e a `QueueService` entrega Jobs de maior prioridade primeiro (dentre outras condições como dependências).

7.  **Gerenciamento de Dependências:**
    *   Um Job não se torna elegível para processamento até que todos os Jobs listados em `dependsOnJobIds` estejam `completed`.
    *   Um Job pai pode entrar no estado `waiting_children` até que todos os seus Sub-Jobs (identificados por `parentJobId`) estejam `completed`.

8.  **Mecanismo de Retentativa (Retry):**
    *   Jobs que falham podem ser automaticamente reagendados para retentativa.
    *   Suporta configuração de número máximo de tentativas e estratégias de backoff (ex: exponencial) para o delay entre tentativas.

9.  **Jobs Atrasados (Delayed Jobs):**
    *   Jobs podem ser agendados para execução futura ou explicitamente movidos para um estado `delayed` durante o processamento, com um timestamp `delayedUntil`. Eles só se tornam elegíveis após esse timestamp.

10. **Persistência:**
    *   Todos os Jobs, seus atributos, status e `ActivityContext` associado são persistidos em um banco de dados SQLite, utilizando Drizzle ORM para a interação.

11. **Monitoramento (Básico):**
    *   O sistema deve permitir o acompanhamento do status dos Jobs e o desempenho da fila (ex: número de jobs em cada estado).

12. **Opções Padrão por Fila e Específicas por Job:**
    *   Cada `queueName` (fila de Agente) pode ter `defaultJobOptions` (ex: tentativas padrão).
    *   Jobs individuais podem sobrescrever essas opções padrão com `JobSpecificOptions` ao serem criados.

Este sistema de Jobs e Filas é fundamental para a operação organizada, confiável e escalável dos Agentes IA no Project Wiz.
