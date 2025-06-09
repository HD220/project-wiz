# Product Requirements Document (PRD): Sistema de Agentes Autônomos e Processamento de Jobs

## 1. Introdução

Este documento descreve os requisitos e o escopo para a reescrita e aprimoramento do sistema de processamento assíncrono e de agentes autônomos no `project-wiz`. O objetivo é implementar uma arquitetura robusta e escalável que permita a operação autônoma de agentes de IA, gerenciando unidades de trabalho (`Activities`) de forma contextual e iterativa, utilizando um sistema de filas (`Queue`) e workers para execução assíncrona. A implementação seguirá os princípios da Clean Architecture e as melhores práticas de Object Calisthenics.

## 2. Objetivos do Projeto

*   Implementar um sistema unificado de `Jobs` e `Activities` onde a entidade `Job` atua como a representação persistida de uma `Activity` do agente.
*   Desenvolver um `AutonomousAgent` capaz de processar um backlog de `Activities`, raciocinar com base no contexto específico de cada `Activity` (`activityHistory`, `activityNotes`) e seu estado interno geral (`AgentInternalState`), e tomar decisões sobre as próximas ações (executar `Tasks`/Tools, comunicar, planejar).
*   Garantir que o sistema de `Queue` gerencie o ciclo de vida das `Jobs`/`Activities` de forma confiável, incluindo transições de status, retentativas, atrasos e dependências.
*   Implementar `Workers` que orquestrem a execução das `Jobs`/`Activities` invocando o `AutonomousAgent` e notificando a `Queue` sobre o desfecho.
*   Estruturar as `Tasks` como a lógica de execução acionável, desacoplada da gestão de estado e fila.
*   Integrar o uso de `Tools` e `LLMs` de forma eficaz dentro do fluxo de processamento das `Tasks` e do raciocínio do `AutonomousAgent`.
*   Adotar e aplicar rigorosamente os princípios da Clean Architecture e Object Calisthenics em toda a nova implementação.
*   Remover código e testes obsoletos da implementação anterior.

## 3. Escopo

A reescrita abrangerá os seguintes componentes e suas interações:

*   **Entidades de Domínio**: `Job` (estendida para `Activity`), `Worker`, `Queue`, `AgentInternalState`, `ActivityContext`, `Task`, `Tool`.
*   **Repositórios**: Implementações para persistir e recuperar `Jobs`/`Activities`, `AgentInternalState`, etc. (inicialmente SQLite via Drizzle).
*   **Use Cases**: Casos de uso para iniciar o processamento de uma nova `Activity`, atualizar o estado de uma `Activity`, etc.
*   **Serviços de Aplicação**: `QueueService`, `WorkerPool`, `AutonomousAgent` (como um serviço que implementa o loop de raciocínio), `IAgentService` (interface para despacho de Tasks), `ProcessJobService`.
*   **Adapters**: Adapters necessários para interação com LLMs, Tools, e o sistema de persistência.
*   **Fluxo de Processamento**: Implementação do fluxo detalhado descrito na documentação de arquitetura, desde a criação da `Job`/`Activity` até sua conclusão ou re-agendamento.
*   **Gerenciamento de Contexto**: Implementação da distinção e uso correto do `AgentInternalState` e do `ActivityContext` (dentro de `Job.data`).
*   **Exclusão de Código Obsoleto**: Identificação e remoção completa do código e testes da implementação anterior de agentes, workers e filas que não estejam alinhados com a nova arquitetura.

## 4. Requisitos Funcionais

*   O sistema deve permitir a criação de novas `Jobs`/`Activities` com um payload inicial, tipo, prioridade e dependências.
*   A `Queue` deve gerenciar o estado das `Jobs`/`Activities` (`pending`, `executing`, `finished`, `failed`, `delayed`, `waiting`).
*   A `Queue` deve suportar retentativas com backoff exponencial e atrasos configuráveis.
*   A `Queue` deve gerenciar dependências entre `Jobs`/`Activities`, liberando Jobs em status `waiting` quando suas dependências estiverem `finished`.
*   O `WorkerPool` deve gerenciar um conjunto de `Workers` para processar `Jobs`/`Activities` concorrentemente.
*   Um `Worker` deve ser capaz de obter uma `Job` da `Queue`, invocar o `AutonomousAgent` para processá-la, e notificar a `Queue` sobre o resultado.
*   O `AutonomousAgent` deve ser capaz de carregar seu `AgentInternalState` e o `ActivityContext` da `Job` atual.
*   O `AutonomousAgent` deve usar um LLM para raciocinar com base no `AgentInternalState` e `ActivityContext` e decidir a próxima ação.
*   O `AutonomousAgent` deve ser capaz de despachar a execução de `Tasks`/Tools através do `IAgentService`.
*   O `IAgentService` deve ser capaz de instanciar e executar a `Task` apropriada com base no tipo de ação decidida pelo Agente.
*   As `Tasks` devem encapsular a lógica de interação com `Tools` e `LLMs`.
*   O `AutonomousAgent` deve atualizar o `ActivityContext` (`activityHistory`, `activityNotes`, `plannedSteps`) com base no progínio e nos resultados das `Tasks`.
*   O sistema deve persistir o estado das `Jobs`/`Activities` e do `AgentInternalState`.

## 5. Requisitos Não Funcionais

*   **Performance**: O sistema deve ser capaz de processar um volume significativo de `Jobs`/`Activities` de forma eficiente.
*   **Confiabilidade**: O sistema deve ser resiliente a falhas, garantindo que as `Jobs`/`Activities` sejam processadas corretamente ou marcadas como falhas após retentativas.
*   **Escalabilidade**: A arquitetura deve permitir a escalabilidade horizontal do `WorkerPool`.
*   **Manutenibilidade**: O código deve ser claro, modular e seguir rigorosamente os princípios da Clean Architecture e Object Calisthenics.
*   **Testabilidade**: Embora os testes iniciais sejam removidos, a nova implementação deve ser projetada para ser facilmente testável em todos os níveis (unitário, integração).

## 6. Modelo de Dados (Entidades Principais)

*   **Job/Activity**:
    *   `id` (UUID)
    *   `type` (Enum: USER_REQUEST, PLANNING, EXECUTION, etc.)
    *   `description` (string)
    *   `status` (Enum: PENDING, EXECUTING, FINISHED, FAILED, DELAYED, WAITING)
    *   `priority` (number)
    *   `createdAt` (Date)
    *   `lastUpdatedAt` (Date)
    *   `payload` (JSON)
    *   `data` (JSON - conterá o `ActivityContext`)
    *   `result` (JSON - opcional)
    *   `max_attempts` (number)
    *   `attempts` (number)
    *   `max_retry_delay` (number)
    *   `retry_delay` (number)
    *   `delay` (number)
    *   `depends_on` (Array de UUIDs)
    *   `parentId` (UUID - opcional)
    *   `relatedActivityIds` (Array de UUIDs - opcional)
    *   `blockingActivityId` (UUID - opcional)
*   **ActivityContext (dentro de Job.data)**:
    *   `messageContent` (string - opcional)
    *   `sender` (string - opcional)
    *   `toolName` (string - opcional)
    *   `toolArgs` (JSON - opcional)
    *   `goalToPlan` (string - opcional)
    *   `plannedSteps` (Array de string - opcional)
    *   `activityNotes` (Array de string - opcional)
    *   `validationCriteria` (Array de string - opcional)
    *   `validationResult` (Enum: PASSED, FAILED, PENDING - opcional)
    *   `activityHistory` (Array de {role: string, content: string} - opcional)
*   **AgentInternalState**:
    *   `agentId` (UUID)
    *   `currentProjectId` (UUID - opcional)
    *   `currentIssueId` (UUID - opcional)
    *   `currentGoal` (string - opcional)
    *   `generalNotes` (Array de string - opcional)
    *   `promisesMade` (Array de string - opcional)
    *   *(Outros campos conforme necessário para o estado global do agente)*

## 7. Considerações de Design e Arquitetura

*   A implementação seguirá rigorosamente a Clean Architecture, com o Domínio sendo o núcleo independente.
*   A comunicação entre processos (Main/Renderer no Electron) será tratada na camada de Infraestrutura.
*   A persistência será inicialmente implementada usando Drizzle ORM com SQLite.
*   Os princípios de Object Calisthenics serão aplicados para garantir código limpo e modular.
*   O gerenciamento do `activityHistory` dentro do `ActivityContext` deve considerar o tamanho e o impacto nas chamadas ao LLM (sumarização, etc.).
*   A idempotência das `Tasks` e operações do Agente será uma prioridade.

## 8. Plano de Trabalho (Alto Nível)

1.  Criação deste PRD.
2.  Desenvolvimento da documentação detalhada (Use Cases, Arquitetura, ADRs).
3.  Análise da documentação e decomposição em tarefas de implementação detalhadas.
4.  Exclusão de código e testes obsoletos.
5.  Implementação das entidades de domínio e Value Objects.
6.  Implementação dos repositórios (Drizzle/SQLite).
7.  Implementação dos serviços de aplicação (`QueueService`, `WorkerPool`, `ProcessJobService`).
8.  Implementação do `AutonomousAgent` e seu loop de raciocínio.
9.  Implementação do `IAgentService` e integração com `TaskFactory`.
10. Implementação de `Tasks` e integração com `Tools`/`LLMs`.
11. Integração dos componentes e testes de fluxo.
12. Revisões de código contínuas.

## 9. Critérios de Aceitação

*   O sistema deve ser capaz de processar `Jobs`/`Activities` de diferentes tipos conforme definido nos Use Cases.
*   As transições de status das `Jobs`/`Activities` devem ocorrer corretamente.
*   Retentativas e dependências devem ser gerenciadas conforme especificado.
*   O `AutonomousAgent` deve demonstrar raciocínio contextual baseado no `ActivityContext`.
*   As `Tasks` devem ser executadas corretamente e interagir com `Tools`/`LLMs` conforme esperado.
*   O estado das `Jobs`/`Activities` e do `AgentInternalState` deve ser persistido corretamente.
*   Todo o código obsoleto e testes da implementação anterior devem ser removidos.
*   A nova implementação deve aderir aos princípios de Clean Architecture e Object Calisthenics.

## 10. Glossário

*   **Activity**: Unidade fundamental de trabalho para o Agente Autônomo, representada pela entidade `Job` enriquecida com `ActivityContext`.
*   **AgentInternalState**: Estado global de negócio do Agente (não inclui histórico de conversa).
*   **ActivityContext**: Contexto específico de uma `Activity` individual, incluindo `activityHistory`.
*   **Job**: Entidade persistida que representa uma `Activity`.
*   **Queue**: Componente que gerencia o ciclo de vida e o estado das `Jobs`/`Activities`.
*   **Worker**: Orquestra a execução de uma `Job`/`Activity` invocando o `AutonomousAgent`.
*   **AutonomousAgent**: Classe que implementa o loop de raciocínio e tomada de decisão do Agente.
*   **Task**: Lógica de execução acionável, encapsula a interação com `Tools` e `LLMs`.
*   **Tool**: Capacidade externa que o Agente pode utilizar (ex: sistema de arquivos, API).
*   **LLM**: Large Language Model utilizado pelo Agente para raciocínio.
*   **Clean Architecture**: Padrão arquitetural que separa camadas por dependência.
*   **Object Calisthenics**: Conjunto de regras para escrever código orientado a objetos limpo e modular.