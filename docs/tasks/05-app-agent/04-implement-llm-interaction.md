# Sub-tarefa: Implementar interação com LLM no AutonomousAgent

## Descrição:

Implementar a lógica para interagir com o LLM (Large Language Model) dentro do método `processActivity` do `AutonomousAgent` para raciocinar e decidir a próxima ação.

## Contexto:

O LLM é o "cérebro" do agente, responsável por analisar o `ActivityContext` e o `AgentInternalState` para determinar o próximo passo na execução de uma atividade. Esta sub-tarefa foca em integrar a interação com o LLM através da interface `LLMInterface.interface.ts`.

## Specific Instructions:

1. Abra o arquivo da classe `AutonomousAgent` (`src/core/application/services/autonomous-agent.service.ts`).
2. Dentro do método `processActivity`, substitua o placeholder de interação com o LLM pela lógica real.
3. Utilize a dependência da interface `LLMInterface.interface.ts` para enviar um prompt ao LLM.
4. O prompt deve incluir o `ActivityContext` atual e o `AgentInternalState` para fornecer ao LLM todas as informações relevantes para o raciocínio.
5. A resposta do LLM deve ser processada para extrair a decisão sobre a próxima ação (ex: qual Tool usar, qual Task despachar, qual o resultado final). O formato esperado da resposta do LLM deve ser definido (pode ser JSON ou outro formato estruturado).
6. Adicione tratamento de erros para a interação com o LLM.
7. Adicione comentários no código explicando a lógica de interação com o LLM e o processamento da resposta.
8. Não crie testes nesta fase.

## Expected Deliverable:

Arquivo `src/core/application/services/autonomous-agent.service.ts` com a lógica de interação com o LLM implementada no método `processActivity`, incluindo o envio do prompt com contexto e o processamento da resposta.