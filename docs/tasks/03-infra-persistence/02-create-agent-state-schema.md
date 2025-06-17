# Sub-tarefa: Criar schema Drizzle para AgentInternalState

## Descrição:

Criar um novo schema Drizzle para a tabela que armazenará o estado interno dos agentes (`agent_internal_state`).

## Contexto:

O estado interno do agente (`AgentInternalState`) precisa ser persistido para que o agente possa retomar seu trabalho de onde parou, mesmo após reinícios ou interrupções. Uma nova tabela no banco de dados, gerenciada pelo Drizzle, é necessária para armazenar essa informação.

## Specific Instructions:

1. Crie um novo arquivo de schema Drizzle para o estado interno do agente (ex: `src/infrastructure/services/drizzle/schemas/agent-internal-state.ts`).
2. Defina a tabela `agent_internal_state` com os seguintes campos:
    *   Um campo para o ID do agente (chave primária, referenciando a entidade Agent).
    *   Um campo para armazenar os dados do estado interno do agente (provavelmente como JSON, similar ao campo `data` na tabela `jobs`).
3. Adicione quaisquer outros campos necessários para gerenciar o estado do agente (ex: timestamp da última atualização).
4. Adicione comentários no schema explicando o propósito da tabela e de cada campo.
5. Não crie testes nesta fase.

## Expected Deliverable:

Um novo arquivo de schema Drizzle (`src/infrastructure/services/drizzle/schemas/agent-internal-state.ts`) definindo a tabela `agent_internal_state` com campos apropriados para persistir o estado interno do agente.