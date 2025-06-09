# Architectural Decision Records (ADRs): Sistema de Agentes Autônomos e Processamento de Jobs

Este documento registra as decisões arquiteturais significativas tomadas durante o design e a reescrita do sistema de agentes autônomos e processamento de jobs no `project-wiz`.

## 1. ADR 001: Unificação de Job e Activity

*   **Título:** Unificação das entidades Job e Activity.
*   **Status:** Aceito.
*   **Contexto:** O sistema existente possuía uma entidade `Job` para processamento assíncrono, enquanto o novo design de Agentes Autônomos introduziu o conceito de `Activity` como a unidade de trabalho do Agente com contexto e histórico próprios. Era necessário harmonizar esses conceitos para evitar duplicação e complexidade.
*   **Decisão:** A entidade `Job` existente será estendida e enriquecida para atuar como a representação persistida de uma `Activity`. O contexto específico da Activity (`activityHistory`, `activityNotes`, `plannedSteps`, etc.) será armazenado em um objeto dentro do campo `data` da entidade `Job`.
*   **Consequências:**
    *   Simplifica o modelo de dados ao ter uma única entidade persistida (`Job`) para representar as unidades de trabalho do sistema assíncrono e dos Agentes.
    *   Permite que a infraestrutura de Queue e Workers existente (com adaptações) gerencie o ciclo de vida das Activities do Agente.
    *   Requer adaptações na lógica da Queue e dos Workers para lidar com o novo `ActivityContext` dentro de `Job.data`.
    *   O `AutonomousAgent` precisará carregar e salvar o `ActivityContext` corretamente ao processar uma `Job`.

## 2. ADR 002: Distinção entre AgentInternalState e Activity Context

*   **Título:** Distinção clara entre AgentInternalState e Activity Context.
*   **Status:** Aceito.
*   **Contexto:** O Agente Autônomo precisa manter um estado global de negócio (ex: projeto atual, meta geral) e, ao mesmo tempo, raciocinar sobre o contexto específico da Activity que está processando (histórico daquela tarefa, notas relevantes apenas para ela). Misturar esses contextos levaria a prompts de LLM excessivamente longos e confusão no raciocínio do Agente.
*   **Decisão:** Será mantida uma distinção clara entre o `AgentInternalState` (estado global de negócio do Agente, persistido separadamente) e o `ActivityContext` (contexto específico de uma Activity, armazenado em `Job.data`). O LLM receberá ambos os contextos, mas será instruído a focar no `ActivityContext` para o raciocínio sobre a tarefa atual, usando o `AgentInternalState` como contexto de alto nível.
*   **Consequências:**
    *   Melhora a clareza e a relevância do contexto fornecido ao LLM, levando a um raciocínio mais focado e eficiente.
    *   Reduz o tamanho dos prompts do LLM ao isolar o histórico de conversa por Activity.
    *   Requer mecanismos separados para persistir e carregar o `AgentInternalState` e o `ActivityContext`.
    *   O `AutonomousAgent` deve gerenciar corretamente a passagem desses dois contextos para o LLM.

## 3. ADR 003: Abordagem para Gerenciamento de activityHistory Grande

*   **Título:** Estratégias para lidar com activityHistory grande.
*   **Status:** Em Andamento (Requer implementação e refinamento).
*   **Contexto:** O `activityHistory` dentro do `ActivityContext` pode crescer significativamente ao longo do processamento de uma Activity complexa, impactando o custo, a latência e a eficácia das chamadas ao LLM devido ao limite de tokens.
*   **Decisão:** Serão exploradas e implementadas estratégias para mitigar o problema do `activityHistory` grande. As abordagens iniciais incluem:
    *   **Sumarização Periódica:** O Agente pode gerar resumos do histórico de conversa em pontos chave do processo e armazená-los em `activityNotes` ou em um campo de resumo dedicado, permitindo que partes mais antigas do histórico original sejam truncadas ou movidas para memória de longo prazo.
    *   **Truncagem:** Implementar limites de tamanho para o `activityHistory` passado diretamente para o LLM, priorizando as interações mais recentes.
    *   **Memória de Longo Prazo:** Utilizar um mecanismo de memória de longo prazo para armazenar resumos ou informações cruciais de Activities concluídas ou partes antigas do histórico de Activities em andamento, que podem ser recuperadas quando relevante.
*   **Consequências:**
    *   Reduz o tamanho dos prompts do LLM, otimizando custo e latência.
    *   Melhora o foco do LLM nas interações mais recentes e relevantes.
    *   Requer lógica adicional no `AutonomousAgent` para gerenciar a sumarização, truncagem e interação com a memória de longo prazo.
    *   A eficácia das estratégias precisará ser avaliada e ajustada durante a implementação e testes.

## 4. ADR 004: Uso de Drizzle ORM para Persistência

*   **Título:** Utilização de Drizzle ORM com SQLite para persistência.
*   **Status:** Aceito.
*   **Contexto:** O projeto já utiliza Drizzle ORM e SQLite para persistência. Manter essa escolha para o sistema de Agentes, Workers e Queues garante consistência tecnológica e aproveita o conhecimento existente na equipe.
*   **Decisão:** A persistência das entidades `Job`/`Activity` e `AgentInternalState` será implementada utilizando Drizzle ORM com SQLite. Os repositórios na camada de Infraestrutura serão responsáveis por mapear as entidades do Domínio para os schemas do Drizzle e interagir com o banco de dados.
*   **Consequências:**
    *   Consistência com a stack tecnológica existente.
    *   Aproveitamento do conhecimento da equipe em Drizzle e SQLite.
    *   Requer a definição de schemas Drizzle para as novas entidades/estruturas (`Job` com `data` JSON, `AgentInternalState`).
    *   A performance e escalabilidade do SQLite devem ser monitoradas conforme o volume de Jobs/Activities aumenta.

## 5. ADR 005: Exclusão de Código e Testes Obsoletos

*   **Título:** Exclusão completa de código e testes da implementação anterior de Agentes, Workers e Queues.
*   **Status:** Aceito.
*   **Contexto:** A implementação existente de agentes, workers e filas não está alinhada com a nova arquitetura e contém testes desnecessários. Manter esse código e testes criaria confusão, dificultaria a manutenção e atrasaria o desenvolvimento da nova arquitetura.
*   **Decisão:** Todo o código-fonte e arquivos de teste relacionados à implementação anterior de agentes, workers e filas que não se encaixem na nova arquitetura e nos princípios definidos serão completamente removidos antes de iniciar a nova implementação.
*   **Consequências:**
    *   Garante um ponto de partida limpo para a nova implementação.
    *   Reduz a confusão e a dívida técnica.
    *   Requer uma análise cuidadosa para identificar e remover apenas o código e testes obsoletos, preservando partes reutilizáveis (ex: Value Objects genéricos, utilitários).
    *   Nenhum teste novo será criado até que a implementação da nova arquitetura esteja completa e pronta para validação.

## 6. ADR 006: Aplicação Rigorosa de Object Calisthenics

*   **Título:** Aplicação rigorosa dos princípios de Object Calisthenics.
*   **Status:** Aceito.
*   **Contexto:** Para garantir a alta qualidade, manutenibilidade e modularidade do código na nova implementação, é essencial seguir um conjunto claro de diretrizes de design orientado a objetos.
*   **Decisão:** Todos os princípios de Object Calisthenics (One Level of Indentation Per Method, Don't Use the `else` Keyword, Wrap All Primitives and Strings, First-Class Collections, One Dot Per Line, Don't Abbreviate, Keep Entities Small, No More Than Two Instance Variables Per Class, No Getters/Setters/Properties for behavior, No Comments) serão aplicados rigorosamente durante a reescrita.
*   **Consequências:**
    *   Resultará em código mais limpo, coeso e fácil de entender e modificar.
    *   Promove a criação de classes pequenas e focadas.
    *   Pode exigir mais classes e métodos privados para refatorar lógica aninhada.
    *   Requer disciplina e revisões de código para garantir a aderência aos princípios.

## 7. ADR 007: Processamento de Job/Activity Orquestrado pelo AutonomousAgent

*   **Título:** AutonomousAgent como orquestrador primário do processamento de uma Job/Activity.
*   **Status:** Aceito.
*   **Contexto:** Era necessário definir claramente qual componente seria o responsável principal por conduzir o processamento de uma única unidade de trabalho (Job/Activity) após ela ser retirada da Queue por um Worker.
*   **Decisão:** O `AutonomousAgent` será o orquestrador primário do processamento de uma `Job`/`Activity` individual. O `Worker` terá a responsabilidade de obter a `Job` da `Queue` e entregá-la ao `AutonomousAgent` (via um método como `processActivity`), e então notificar a `Queue` com base no resultado retornado pelo Agente. O loop de raciocínio, a decisão sobre qual Task executar, a atualização do `ActivityContext` e a decisão sobre se a Activity está completa para o ciclo ocorrerão dentro do `AutonomousAgent`.
*   **Consequências:**
    *   Centraliza a lógica de raciocínio e orquestração de uma Activity no Agente, alinhado com o design orientado a atividades.
    *   Mantém o Worker relativamente simples, focado em obter a Job e gerenciar a comunicação com a Queue.
    *   Requer que o `AutonomousAgent` seja capaz de receber a entidade `Job` completa e interagir com os serviços/adapters necessários (LLM, IAgentService).
    *   A lógica de retorno do `AutonomousAgent` para o Worker (resultado final, `undefined` para re-agendar, exceção para falha) deve ser clara e consistente.

Este documento será atualizado conforme novas decisões arquiteturais significativas forem tomadas.