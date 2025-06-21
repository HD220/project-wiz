# UC-002: Processar Tarefa com Agente

**ID:** UC-002
**Nome:** Processar Tarefa com Agente
**Ator Primário:** Worker (componente do sistema).
**Atores Secundários:** AutonomousAgent, IJobQueue, IJobRepository, IAgentStateRepository, ITaskFactory, ITool, ILLM.
**Resumo:** Descreve como um Worker obtém uma Job da fila e a entrega a um AutonomousAgent para processamento, ativando o ciclo de raciocínio e ação do agente.

## Pré-condições
- Jobs com status `PENDING` existem na `IJobQueue`.
- Workers estão disponíveis no `IWorkerPool`.
- O `AutonomousAgent` (Persona) associado à Job está configurado.

## Fluxo Principal (Sucesso)
1. Um `Worker` disponível (gerenciado pelo `IWorkerPool` na Camada de Infraestrutura) solicita uma Job da `IJobQueue` (Camada de Aplicação).
2. A `IJobQueue` seleciona uma Job `PENDING` apropriada (considerando prioridade, etc.) e a retorna ao `Worker`, atualizando o status da Job para `EXECUTING` (via `IJobRepository`).
3. O `Worker` invoca o serviço `AutonomousAgent` (Camada de Aplicação) com a `Job` obtida.
4. O `AutonomousAgent` inicia seu ciclo de processamento para a `Job`:
   a. Carrega seu estado global (`AgentInternalState` - Domínio) utilizando `IAgentStateRepository` (Domínio/Infraestrutura).
   b. Carrega o contexto da Job (`ActivityContext` - Domínio), que está contido na entidade `Job`.
   c. Utiliza uma implementação de `ILLM` (Porta da Aplicação, implementada na Infraestrutura), fornecendo o `AgentInternalState` e o `ActivityContext`, para analisar a tarefa e decidir a próxima ação (e.g., qual `ITask` executar ou qual `ITool` usar diretamente).
   d. Atualiza o `ActivityContext` com notas, passos planejados, ou histórico da interação com o LLM.
   e. Se uma `ITask` específica é necessária, o `AutonomousAgent` utiliza `ITaskFactory` (Camada de Aplicação) para instanciar a `ITask` apropriada.
   f. A `ITask` é executada. Durante sua execução, a `ITask` pode:
       i. Interagir com uma ou mais `ITool`s (Portas da Aplicação, implementadas na Infraestrutura).
       ii. Interagir novamente com `ILLM` para sub-passos ou geração de conteúdo.
   g. O resultado da execução da `ITask` (ou da ação direta do Agente) é obtido.
   h. O `AutonomousAgent` atualiza o `ActivityContext` da `Job` com o resultado e quaisquer reflexões.
   i. O `AutonomousAgent` determina se a `Job` (Activity) está completa para este ciclo ou se necessita de processamento adicional (e.g., mais passos, aguardar algo).
5. O `AutonomousAgent` retorna um resultado ao `Worker`. Este resultado indica se a Job foi concluída com sucesso, se falhou, ou se deve ser adiada/re-enfileirada.
6. O `Worker` notifica a `IJobQueue` sobre o desfecho:
   a. Se sucesso: `IJobQueue` atualiza o status da `Job` para `FINISHED` (via `IJobRepository`).
   b. Se falha (e sem mais retentativas): `IJobQueue` atualiza para `FAILED`.
   c. Se necessita re-agendamento/delay (e.g., falha com retentativas restantes, ou tarefa de longa duração): `IJobQueue` atualiza para `DELAYED` ou `PENDING` (após delay).
7. A `Job` (e seu `ActivityContext`) é persistida com seu novo estado via `IJobRepository`.

## Pós-condições
- O status da `Job` é atualizado na `IJobQueue` e persistido.
- O `ActivityContext` da `Job` é atualizado com os resultados e histórico do processamento.
- O `AgentInternalState` pode ter sido atualizado e persistido.

## Fluxos Alternativos e Exceções
- **FA-002.1 (Nenhuma Job Disponível):** Se não houver Jobs `PENDING` na fila (passo 2), o `Worker` aguarda ou o `IWorkerPool` gerencia seu estado ocioso.
- **FA-002.2 (Falha ao Carregar AgentInternalState):** Se o `AutonomousAgent` não conseguir carregar seu estado (passo 4a), a Job é marcada como falha e o erro é registrado.
- **FA-002.3 (Erro na Execução da Task/Tool):** Se uma `ITask` ou `ITool` lançar uma exceção (passo 4f), o `AutonomousAgent` captura o erro. A Job pode ser marcada para retentativa (se aplicável) ou `FAILED`.
- **FA-002.4 (LLM Indisponível ou Erro):** Se a interação com `ILLM` falhar (passos 4c, 4f.ii), a Job é tratada como uma falha e pode ser re-agendada ou marcada como `FAILED`.
