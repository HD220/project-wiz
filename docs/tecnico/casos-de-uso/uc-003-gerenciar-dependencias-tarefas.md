# UC-003: Gerenciar Dependências de Tarefas

**ID:** UC-003
**Nome:** Gerenciar Dependências de Tarefas (Jobs/Activities)
**Ator Primário:** IJobQueue (componente do sistema).
**Resumo:** Descreve como o sistema assegura que uma Job com dependências só seja processada após a conclusão bem-sucedida de todas as suas Jobs predecessoras.

## Pré-condições
- Uma Job (`Job-A`) é criada com uma lista de `dependsOn` contendo IDs de outras Jobs (`Job-Dep1`, `Job-Dep2`).

## Fluxo Principal (Sucesso)
1. Quando `Job-A` é adicionada à `IJobQueue` (e.g., via `CreateJobUseCase` ou `UpdateJobUseCase`):
   a. A `IJobQueue` verifica o status de cada Job listada em `Job-A.dependsOn` utilizando `IJobRepository`.
   b. Se qualquer `Job-DepX` não estiver com status `FINISHED`, a `IJobQueue` define o status de `Job-A` como `WAITING`.
   c. Se todas as `Job-DepX` já estiverem `FINISHED`, a `IJobQueue` define o status de `Job-A` como `PENDING`.
2. Quando uma Job qualquer no sistema (`Job-DepX`) transita para o status `FINISHED`:
   a. A `IJobQueue` identifica todas as Jobs que dependem de `Job-DepX` (i.e., Jobs que têm `Job-DepX.id` em seu campo `dependsOn` e estão com status `WAITING`).
   b. Para cada uma dessas Jobs dependentes (e.g., `Job-A`):
       i. A `IJobQueue` reavalia todas as suas dependências.
       ii. Se todas as Jobs em `Job-A.dependsOn` agora estão com status `FINISHED`, a `IJobQueue` transita o status de `Job-A` de `WAITING` para `PENDING`.
       iii. O `WorkerPool` é notificado sobre a nova Job `PENDING`.
3. Opcionalmente, os resultados das Jobs dependentes podem ser agregados e injetados no `payload` ou `ActivityContext` da Job que estava aguardando, antes de ser movida para `PENDING`. (Esta lógica residiria na `IJobQueue` ou em um serviço de aplicação coordenado).

## Pós-condições
- Jobs com dependências apenas são movidas para o estado `PENDING` (e, portanto, elegíveis para processamento) após todas as suas Jobs predecessoras terem sido concluídas com sucesso.

## Fluxos Alternativos e Exceções
- **FA-003.1 (Dependência Falha ou Cancelada):** Se uma Job da qual `Job-A` depende transitar para `FAILED` ou `CANCELLED`, `Job-A` não poderá ser executada. O sistema deve definir uma política para este cenário (e.g., marcar `Job-A` como `FAILED_DEPENDENCY`, ou similar, ou alertar um administrador).
