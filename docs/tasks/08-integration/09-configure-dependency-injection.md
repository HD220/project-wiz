# Sub-tarefa: Configurar injeção de dependência

## Descrição:

Configurar um contêiner de injeção de dependência (DI) para gerenciar a criação e resolução das dependências entre os componentes do sistema de agentes, workers e filas.

## Contexto:

Para garantir que os componentes sigam os princípios da Clean Architecture e dependam apenas de interfaces, é essencial utilizar um contêiner de injeção de dependência. O contêiner será responsável por criar as instâncias concretas dos Adapters, Repositórios e Serviços, e injetá-las nos construtores dos componentes que delas necessitam.

## Specific Instructions:

1. Escolha uma biblioteca de injeção de dependência apropriada para o projeto (se ainda não houver uma definida).
2. Crie um módulo ou arquivo de configuração central para o contêiner de DI (ex: `src/infrastructure/di/container.ts`).
3. Registre todos os componentes do sistema no contêiner de DI:
    *   Entidades e Value Objects (não precisam ser registrados se forem criados diretamente ou por Factories).
    *   Interfaces (Ports) e suas implementações concretas (Adapters, Repositórios, Serviços).
    *   Serviços da camada de Aplicação (`QueueService`, `WorkerPool`, `ProcessJobService`, `AutonomousAgent`, `IAgentService` concreta).
    *   Factories (`TaskFactory`).
    *   Tasks concretas.
    *   Adapters de Infraestrutura (LLM, Tools).
4. Configure as dependências para que o contêiner possa resolver e injetar as implementações corretas ao criar as instâncias dos componentes.
5. Garanta que a configuração do DI reflita a estrutura de dependência definida pela Clean Architecture (camadas internas não dependem de camadas externas).
6. Adicione comentários no código explicando a configuração do DI e o registro de cada componente.
7. Não crie testes nesta fase.

## Expected Deliverable:

Um módulo ou arquivo de configuração central para o contêiner de injeção de dependência, com todos os componentes do sistema registrados e suas dependências configuradas corretamente.