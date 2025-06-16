# Sub-tarefa: Criar classe AutonomousAgent

## Descrição:

Criar a estrutura básica da classe `AutonomousAgent` na camada de Aplicação.

## Contexto:

O `AutonomousAgent` é o componente central que orquestra o raciocínio e a execução das atividades. Criar a estrutura básica da classe, incluindo seu construtor e as dependências necessárias, é o primeiro passo para implementar o loop do agente.

## Specific Instructions:

1. Crie um novo arquivo para a classe `AutonomousAgent` (ex: `src/core/application/services/autonomous-agent.service.ts`).
2. Defina a classe `AutonomousAgent`.
3. Adicione um construtor que receba as dependências necessárias como parâmetros. Com base na tarefa pai, as dependências incluem:
    *   Interface do Repositório de `AgentInternalState`.
    *   Interface de LLM (`LLMInterface.interface.ts`).
    *   Interface de Tool (`ToolInterface.interface.ts`).
    *   Interface `IAgentService.interface.ts`.
4. Armazene essas dependências em propriedades privadas `readonly` na classe.
5. Adicione comentários JSDoc básicos explicando o propósito da classe e do construtor.
6. Não implemente a lógica dos métodos nesta fase, apenas a estrutura da classe e o construtor.
7. Não crie testes nesta fase.

## Expected Deliverable:

Um novo arquivo (`src/core/application/services/autonomous-agent.service.ts`) contendo a estrutura básica da classe `AutonomousAgent` com seu construtor e dependências injetadas.