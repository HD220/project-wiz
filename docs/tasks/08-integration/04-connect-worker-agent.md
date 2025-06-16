# Sub-tarefa: Conectar Worker e Agent

## Descrição:

Implementar a lógica no código do processo worker para obter uma instância do `AutonomousAgent` e chamar seu método `processActivity`.

## Contexto:

O processo worker é o ambiente onde o `AutonomousAgent` será executado para processar uma Job/Activity específica. O código do worker precisa ser capaz de obter uma instância do `AutonomousAgent` com suas dependências resolvidas e invocar o método principal de processamento.

## Specific Instructions:

1. Abra o arquivo do código do processo worker (`src/infrastructure/workers/job-processor.worker.ts`).
2. Implemente a lógica para obter uma instância do `AutonomousAgent`. Isso provavelmente envolverá um mecanismo de injeção de dependência ou uma forma de obter o agente através de um canal de comunicação inter-processos (IPC) se o agente residir no processo principal.
3. Uma vez obtida a instância do `AutonomousAgent`, chame o método `processActivity(job)` passando a Job obtida da fila.
4. Adicione tratamento de erros para a obtenção da instância do agente e a chamada do método `processActivity`.
5. Adicione comentários no código explicando como a instância do agente é obtida e como o método `processActivity` é chamado.
6. Não crie testes nesta fase.

## Expected Deliverable:

Arquivo `src/infrastructure/workers/job-processor.worker.ts` modificado para obter uma instância do `AutonomousAgent` e chamar seu método `processActivity` com a Job atual.