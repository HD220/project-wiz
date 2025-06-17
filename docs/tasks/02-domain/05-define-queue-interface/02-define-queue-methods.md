# Sub-sub-tarefa: Definir métodos da interface de domínio JobQueue

## Descrição:

Definir os métodos essenciais na interface de domínio `JobQueue` que representam as operações para gerenciar Jobs/Activities pela fila.

## Contexto:

A interface `JobQueue` define o contrato que qualquer implementação de fila deve seguir. É necessário especificar os métodos que a camada de Aplicação usará para interagir com a fila, como adicionar Jobs, obter a próxima Job, atualizar status, etc., utilizando as entidades e Value Objects de domínio apropriados. Esta sub-sub-tarefa depende da sub-sub-tarefa 02.05.01.

## Specific Instructions:

1.  No arquivo `src/core/domain/ports/job-queue.interface.ts` (criado na sub-sub-tarefa anterior), defina a interface `JobQueue`.
2.  Adicione as assinaturas dos métodos essenciais que a Queue deve suportar, com base nos Use Cases e na arquitetura:
    *   `add(job: Job): Promise<void>`
    *   `getNext(workerId: WorkerId): Promise<Job | null>` (ou similar, para um worker obter uma job)
    *   `updateStatus(jobId: JobId, status: JobStatus, details?: any): Promise<void>`
    *   `findById(jobId: JobId): Promise<Job | null>`
    *   *(Outros métodos conforme necessário para gerenciar retentativas, dependências, etc.)*
3.  Utilize as entidades e Value Objects definidos anteriormente (ex: `Job`, `JobId`, `JobStatus`, `WorkerId`) nas assinaturas dos métodos.
4.  Garanta que a interface defina apenas o "o quê" (operações) e não o "como" (implementação).

## Expected Deliverable:

O arquivo `src/core/domain/ports/job-queue.interface.ts` com a interface `JobQueue` definida e contendo as assinaturas dos métodos essenciais para o gerenciamento de Jobs/Activities.