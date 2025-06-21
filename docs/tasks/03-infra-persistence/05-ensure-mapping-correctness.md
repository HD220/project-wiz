# Sub-tarefa: Garantir a correção do mapeamento entre entidades de domínio e objetos Drizzle

## Descrição:

Revisar e garantir que o mapeamento entre as entidades de domínio (`Job`, `AgentInternalState`) e os objetos do schema Drizzle correspondentes nos repositórios de infraestrutura (`JobDrizzleRepository`, `AgentStateDrizzleRepository`) esteja correto e robusto.

## Contexto:

A camada de Infraestrutura deve ser responsável por traduzir entre as representações de dados do domínio e as representações de dados da persistência. É crucial garantir que essa tradução (mapeamento) seja feita corretamente nos repositórios para evitar perda de dados ou inconsistências ao salvar e carregar entidades.

## Specific Instructions:

1. Abra os arquivos dos repositórios `JobDrizzleRepository` (`src/infrastructure/repositories/job-drizzle.repository.ts`) e `AgentStateDrizzleRepository` (`src/infrastructure/repositories/agent-state-drizzle.repository.ts`).
2. Revise a lógica de mapeamento dentro de cada método de persistência e recuperação.
3. Certifique-se de que todos os campos relevantes das entidades de domínio estão sendo corretamente mapeados para os campos correspondentes nos schemas Drizzle e vice-versa.
4. Preste atenção especial à serialização e desserialização do `ActivityContext` e `AgentInternalState`, garantindo que os Value Objects sejam reconstruídos corretamente após a leitura do banco de dados.
5. Verifique se há tratamento adequado para casos onde os dados do banco de dados podem estar ausentes ou em um formato inesperado durante a desserialização.
6. Adicione comentários no código onde o mapeamento é complexo para explicar a lógica.
7. Não crie testes nesta fase.

## Expected Deliverable:

Os repositórios `JobDrizzleRepository` e `AgentStateDrizzleRepository` revisados, com a lógica de mapeamento entre entidades de domínio e objetos Drizzle verificada e corrigida para garantir a integridade dos dados.