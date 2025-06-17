# Requisitos do Produto: Sistema de Agentes Autônomos e Processamento de Jobs

## 1. Introdução

Este documento descreve os requisitos de produto para o sistema de processamento assíncrono e de agentes autônomos no `project-wiz`. O objetivo é definir as capacidades de uma arquitetura robusta e escalável que permita a operação autônoma de agentes de IA, gerenciando unidades de trabalho (`Activities` ou `Jobs`) de forma contextual e iterativa, utilizando um sistema de filas (`Queue`) e workers para execução assíncrona.

## 2. Objetivos do Produto

- Implementar um sistema onde `Jobs` representem `Activities` de agentes, permitindo seu gerenciamento e persistência.
- Desenvolver um `AutonomousAgent` capaz de processar um backlog de `Activities`, utilizando contexto específico (`ActivityContext`) e estado global (`AgentInternalState`) para tomar decisões e executar `Tasks` ou `Tools`.
- Garantir que a `Queue` gerencie o ciclo de vida das `Jobs`/`Activities`, incluindo status, retentativas, atrasos e dependências.
- Implementar `Workers` para orquestrar a execução das `Jobs`/`Activities` pelo `AutonomousAgent`.
- Estruturar `Tasks` como unidades de lógica de execução, independentes da gestão de estado e fila.
- Integrar `Tools` e `LLMs` no fluxo de processamento das `Tasks` e no raciocínio do `AutonomousAgent`.
- Adotar princípios de Clean Architecture e Object Calisthenics para a implementação.

## 3. Escopo da Funcionalidade

O sistema abrangerá:

- **Entidades de Domínio**: `Job` (como `Activity`), `Worker`, `Queue`, `AgentInternalState`, `ActivityContext`, `Task`, `Tool`.
- **Persistência**: Repositórios para `Jobs`/`Activities` e `AgentInternalState` (inicialmente SQLite via Drizzle).
- **Casos de Uso**: Iniciação e atualização de `Activities`.
- **Serviços de Aplicação**: `QueueService`, `WorkerPool`, `AutonomousAgent`, `IAgentService`, `ProcessJobService`.
- **Adapters**: Para LLMs, Tools e persistência.
- **Fluxo de Processamento**: Conforme detalhado na documentação de arquitetura.
- **Gerenciamento de Contexto**: Distinção e uso de `AgentInternalState` e `ActivityContext`.

## 4. Requisitos Funcionais Detalhados

- **RF001:** O sistema deve permitir a criação de `Jobs`/`Activities` com payload, tipo, prioridade e dependências.
- **RF002:** A `Queue` deve gerenciar os status: `pending`, `executing`, `finished`, `failed`, `delayed`, `waiting`.
- **RF003:** A `Queue` deve suportar retentativas com backoff exponencial e atrasos.
- **RF004:** A `Queue` deve gerenciar dependências, liberando `Jobs` em `waiting` quando suas dependências estiverem `finished`.
- **RF005:** O `WorkerPool` deve gerenciar `Workers` para processamento concorrente.
- **RF006:** Um `Worker` deve obter `Jobs` da `Queue`, invocar o `AutonomousAgent`, e notificar a `Queue` do resultado.
- **RF007:** O `AutonomousAgent` deve carregar `AgentInternalState` e `ActivityContext`.
- **RF008:** O `AutonomousAgent` deve usar LLM com `AgentInternalState` e `ActivityContext` para decidir a próxima ação.
- **RF009:** O `AutonomousAgent` deve despachar `Tasks`/`Tools` via `IAgentService`.
- **RF010:** O `IAgentService` deve instanciar e executar a `Task` apropriada.
- **RF011:** `Tasks` devem encapsular a lógica de interação com `Tools` e `LLMs`.
- **RF012:** O `AutonomousAgent` deve atualizar o `ActivityContext` com progresso e resultados.
- **RF013:** O sistema deve persistir o estado de `Jobs`/`Activities` e `AgentInternalState`.

## 5. Requisitos Não Funcionais

- **RNF001 (Performance):** Processamento eficiente de um volume significativo de `Jobs`/`Activities`.
- **RNF002 (Confiabilidade):** Resiliência a falhas, com processamento correto ou marcação de falha após retentativas.
- **RNF003 (Escalabilidade):** Arquitetura deve permitir escalabilidade horizontal do `WorkerPool`.
- **RNF004 (Manutenibilidade):** Código claro, modular, seguindo Clean Architecture e Object Calisthenics.
- **RNF005 (Testabilidade):** Nova implementação deve ser projetada para ser facilmente testável.

## 6. Modelo de Dados Simplificado (Entidades Chave)

- **Job/Activity**:
  - `id` (UUID), `type`, `description`, `status`, `priority`, `createdAt`, `lastUpdatedAt`, `payload` (JSON), `data` (JSON para `ActivityContext`), `result` (JSON), `max_attempts`, `attempts`, `retry_delay`, `delay`, `depends_on` (Array de UUIDs), `parentId` (UUID).
- **ActivityContext (em Job.data)**:
  - `messageContent`, `sender`, `toolName`, `toolArgs`, `goalToPlan`, `plannedSteps`, `activityNotes`, `validationCriteria`, `validationResult`, `activityHistory`.
- **AgentInternalState**:
  - `agentId` (UUID), `currentProjectId`, `currentIssueId`, `currentGoal`, `generalNotes`, `promisesMade`.

## 7. Considerações de Design e Arquitetura

- Aderência estrita à Clean Architecture.
- Comunicação entre processos (Electron Main/Renderer) na camada de Infraestrutura.
- Persistência inicial: Drizzle ORM com SQLite.
- Aplicação dos princípios de Object Calisthenics.
- Gerenciamento cuidadoso do `activityHistory` para otimizar chamadas LLM.
- Foco na idempotência de `Tasks` e operações do Agente.

## 8. Critérios de Aceitação Chave

- Processamento de `Jobs`/`Activities` conforme Casos de Uso.
- Transições de status, retentativas e dependências funcionando como especificado.
- `AutonomousAgent` demonstrando raciocínio contextual.
- `Tasks` executando e interagindo corretamente com `Tools`/`LLMs`.
- Persistência correta de estados.
- Aderência aos princípios de Clean Architecture e Object Calisthenics.

## 9. Glossário de Termos Relevantes

- **Activity**: Unidade de trabalho do Agente, representada pela entidade `Job` com `ActivityContext`.
- **AgentInternalState**: Estado global de negócio do Agente.
- **ActivityContext**: Contexto específico de uma `Activity`, incluindo histórico.
- **Job**: Entidade persistida representando uma `Activity`.
- **Queue**: Gerenciador do ciclo de vida e estado das `Jobs`/`Activities`.
- **Worker**: Orquestrador da execução de `Jobs`/`Activities` via `AutonomousAgent`.
- **AutonomousAgent**: Implementa o loop de raciocínio e decisão do Agente.
- **Task**: Lógica de execução acionável, interage com `Tools` e `LLMs`.
- **Tool**: Capacidade externa utilizável pelo Agente.
- **LLM**: Large Language Model para raciocínio do Agente.
- **Clean Architecture**: Padrão arquitetural para separação de camadas.
- **Object Calisthenics**: Regras para código orientado a objetos limpo.
