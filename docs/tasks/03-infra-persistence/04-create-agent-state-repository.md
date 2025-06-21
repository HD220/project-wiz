# Sub-tarefa: Criar AgentStateDrizzleRepository

## Descrição:

Criar a classe `AgentStateDrizzleRepository` para implementar a interface `AgentStateRepository.interface.ts` e lidar com a serialização/desserialização do `AgentInternalState`.

## Contexto:

O `AgentStateDrizzleRepository` será a implementação concreta do repositório de estado interno do agente para o Drizzle ORM. Ele será responsável por salvar e carregar o `AgentInternalState` no banco de dados, garantindo a conformidade com a interface definida na camada de Domínio/Aplicação e tratando a serialização/desserialização do estado.

## Specific Instructions:

1. Crie um novo arquivo para o repositório de estado do agente (ex: `src/infrastructure/repositories/agent-state-drizzle.repository.ts`).
2. Defina a classe `AgentStateDrizzleRepository` e faça com que ela implemente a interface `AgentStateRepository.interface.ts`.
3. Implemente os métodos definidos na interface (ex: `save`, `findById`).
4. Dentro dos métodos de implementação, lide com a serialização do `AgentInternalState` ao salvar no banco de dados (provavelmente para JSON).
5. Dentro dos métodos de recuperação, lide com a desserialização dos dados do banco de dados e reconstrua o Value Object `AgentInternalState`.
6. Garanta que o mapeamento entre a entidade de domínio `AgentInternalState` e o objeto do schema Drizzle seja tratado dentro deste repositório.
7. Adicione comentários JSDoc para explicar a lógica de serialização/desserialização e o mapeamento.
8. Não crie testes nesta fase.

## Expected Deliverable:

Um novo arquivo (`src/infrastructure/repositories/agent-state-drizzle.repository.ts`) contendo a classe `AgentStateDrizzleRepository` implementando `AgentStateRepository.interface.ts` e lidando corretamente com a serialização/desserialização do `AgentInternalState`.