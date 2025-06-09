# Sub-sub-tarefa: Definir métodos da interface de domínio AgentStateRepository

## Descrição:

Definir os métodos essenciais na interface de domínio `AgentStateRepository` que representam as operações de persistência para a entidade `AgentInternalState`.

## Contexto:

A interface `AgentStateRepository` define o contrato que qualquer implementação de repositório de estado de agente deve seguir. É necessário especificar os métodos que a camada de Aplicação usará para persistir e recuperar o estado global do agente, como salvar e buscar por ID do agente, utilizando as entidades e Value Objects de domínio apropriados. Esta sub-sub-tarefa depende da sub-sub-tarefa 02.08.03.

## Specific Instructions:

1.  No arquivo `src/core/domain/ports/agent-state-repository.interface.ts` (criado na sub-sub-tarefa anterior), defina a interface `AgentStateRepository`.
2.  Adicione as assinaturas dos métodos essenciais para gerenciar entidades `AgentInternalState`:
    *   `save(state: AgentInternalState): Promise<void>`
    *   `findByAgentId(agentId: AgentId): Promise<AgentInternalState | null>`
3.  Utilize as entidades e Value Objects definidos anteriormente (ex: `AgentInternalState`, `AgentId`) nas assinaturas dos métodos.
4.  Garanta que a interface defina apenas as operações de persistência de alto nível, sem detalhes de implementação de banco de dados.

## Expected Deliverable:

O arquivo `src/core/domain/ports/agent-state-repository.interface.ts` com a interface `AgentStateRepository` definida e contendo as assinaturas dos métodos essenciais para a persistência do estado do agente.