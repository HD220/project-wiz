# Sub-tarefa: Implementar notificação Worker -> Queue

## Descrição:

Implementar a lógica no código do processo worker para notificar a `Queue` sobre o desfecho do processamento de uma Job/Activity.

## Contexto:

Após o `AutonomousAgent` processar uma Job/Activity e retornar um resultado (sucesso, falha, ou necessidade de re-agendamento), o processo worker precisa comunicar esse resultado de volta para a `Queue`. A `Queue` usará essa informação para atualizar o status da Job no sistema de persistência e gerenciar o fluxo (ex: marcar como concluída, falhada, ou re-enfileirar com atraso).

## Specific Instructions:

1. Abra o arquivo do código do processo worker (`src/infrastructure/workers/job-processor.worker.ts`).
2. Injete a dependência da interface `JobQueue.interface.ts` no código do worker (se ainda não estiver injetada).
3. Após a chamada ao método `processActivity(job)` do `AutonomousAgent` e a obtenção do resultado, adicione a lógica para:
    *   Verificar o resultado retornado pelo agente.
    *   Com base no resultado, chamar o método apropriado na `JobQueue.interface.ts` para notificar a fila (ex: `markJobAsCompleted(jobId, result)`, `markJobAsFailed(jobId, error)`, `delayJob(jobId, delay)`).
    *   Certifique-se de passar o ID da Job e quaisquer dados relevantes (resultado em caso de sucesso, erro em caso de falha) para os métodos de notificação da fila.
4. Adicione tratamento de erros para a notificação da fila.
5. Adicione comentários no código explicando a lógica de notificação da fila com base no resultado do agente.
6. Não crie testes nesta fase.

## Expected Deliverable:

Arquivo `src/infrastructure/workers/job-processor.worker.ts` modificado para notificar a `Queue` sobre o desfecho do processamento da Job/Activity utilizando a interface `JobQueue.interface.ts`.