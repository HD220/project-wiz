# Sub-tarefa: Implementar atualização de contexto no AutonomousAgent

## Descrição:

Implementar a lógica para atualizar o `ActivityContext` da `Job` e o `AgentInternalState` com base no raciocínio do LLM e nos resultados das ações executadas pelo `AutonomousAgent`.

## Contexto:

Após cada iteração do loop de raciocínio, o `AutonomousAgent` precisa atualizar o `ActivityContext` da `Job` para refletir o progresso, novas informações ou mudanças de estado. Além disso, o `AgentInternalState` pode precisar ser atualizado com informações relevantes para futuras iterações ou outras atividades do agente.

## Specific Instructions:

1. Abra o arquivo da classe `AutonomousAgent` (`src/core/application/services/autonomous-agent.service.ts`).
2. Dentro do método `processActivity`, adicione a lógica para atualizar o `ActivityContext` da `Job`. Isso pode incluir adicionar novas entradas ao histórico de atividades, atualizar o status da atividade, ou armazenar resultados intermediários.
3. Adicione a lógica para atualizar o `AgentInternalState` (utilizando a dependência do repositório). Determine quais informações do `ActivityContext` ou do raciocínio do LLM devem ser persistidas no estado interno do agente.
4. Certifique-se de que as atualizações do `ActivityContext` e do `AgentInternalState` sejam feitas de forma imutável, criando novas instâncias dos Value Objects/Entidades modificados.
5. Utilize os métodos apropriados das entidades e Value Objects para realizar as atualizações.
6. Adicione comentários no código explicando a lógica de atualização do contexto e do estado interno.
7. Não crie testes nesta fase.

## Expected Deliverable:

Arquivo `src/core/application/services/autonomous-agent.service.ts` com a lógica de atualização do `ActivityContext` da `Job` e do `AgentInternalState` implementada no método `processActivity`.