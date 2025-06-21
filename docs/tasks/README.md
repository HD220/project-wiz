# Plano de Tarefas Detalhado: Reescrita de Agentes, Workers e Queues

Este documento detalha o plano de trabalho para a reescrita completa dos componentes de Agentes, Workers e Queues, seguindo os princípios de Clean Architecture e Object Calisthenics. O plano está dividido em tarefas principais, que foram decompostas em sub-tarefas mais granulares. Cada sub-tarefa possui um documento dedicado com descrição, contexto, instruções específicas e entregáveis esperados.

## Estrutura de Tarefas Detalhada

Este plano de trabalho detalha a reescrita completa dos componentes de Agentes, Workers e Queues, seguindo os princípios de Clean Architecture e Object Calisthenics. O plano está organizado hierarquicamente em tarefas principais, sub-tarefas e sub-sub-tarefas.

### 01 - Limpeza de Código Obsoleto

*   **Descrição:** Remover código e testes obsoletos relacionados à implementação anterior de Jobs, Workers e Queues.
*   **Prioridade:** Alta
*   **Sub-tarefas:**
    *   [01.01 - Analisar diretórios para identificar arquivos obsoletos](01-cleanup/01-analyze-obsolete-files.md) (Prioridade: Alto, Dependências: Nenhuma)
        *   [01.01.01 - Analisar diretório de entidades de Job](01-cleanup/01-analyze-obsolete-files/01-analyze-job-entities.md)
        *   [01.01.02 - Analisar diretório de entidades de Worker](01-cleanup/01-analyze-obsolete-files/02-analyze-worker-entities.md)
        *   [01.01.03 - Analisar diretório de entidades de Queue](01-cleanup/01-analyze-obsolete-files/03-analyze-queue-entities.md)
        *   [01.01.04 - Analisar diretório de use cases de Job](01-cleanup/01-analyze-obsolete-files/04-analyze-job-usecases.md)
        *   [01.01.05 - Analisar arquivo de serviço de Queue](01-cleanup/01-analyze-obsolete-files/05-analyze-queue-service-file.md)
        *   [01.01.06 - Analisar arquivo de serviço de Worker Assignment](01-cleanup/01-analyze-obsolete-files/06-analyze-worker-assignment-service-file.md)
        *   [01.01.07 - Analisar arquivo de serviço de Child Process Worker Pool](01-cleanup/01-analyze-obsolete-files/07-analyze-child-process-worker-pool-service-file.md)
        *   [01.01.08 - Analisar arquivo de repositório de Job](01-cleanup/01-analyze-obsolete-files/08-analyze-job-repository-file.md)
        *   [01.01.09 - Analisar arquivo de repositório de Worker](01-cleanup/01-analyze-obsolete-files/09-analyze-worker-repository-file.md)
        *   [01.01.10 - Analisar arquivo de Worker Processor](01-cleanup/01-analyze-obsolete-files/10-analyze-job-processor-worker-file.md)
        *   [01.01.11 - Analisar diretórios de testes obsoletos](01-cleanup/01-analyze-obsolete-files/11-analyze-test-directories.md)
        *   [01.01.12 - Consolidar lista de arquivos obsoletos](01-cleanup/01-analyze-obsolete-files/12-consolidate-obsolete-files-list.md)
    *   [01.02 - Excluir arquivos de código obsoletos](01-cleanup/02-delete-obsolete-code.md) (Prioridade: Alto, Dependências: 01.01)
        *   [01.02.01 - Executar exclusão de código](01-cleanup/02-delete-obsolete-code/01-execute-code-deletion.md)
    *   [01.03 - Excluir arquivos de teste obsoletos](01-cleanup/03-delete-obsolete-tests.md) (Prioridade: Alto, Dependências: 01.01)
        *   [01.03.01 - Executar exclusão de testes](01-cleanup/03-delete-obsolete-tests/01-execute-test-deletion.md)
    *   [01.04 - Verificar referências restantes após a exclusão](01-cleanup/04-verify-remaining-references.md) (Prioridade: Alto, Dependências: 01.02, 01.03)
        *   [01.04.01 - Rodar build e linter](01-cleanup/04-verify-remaining-references/01-run-build-lint.md)
        *   [01.04.02 - Corrigir referências restantes](01-cleanup/04-verify-remaining-references/02-fix-remaining-references.md)

### 02 - Implementar Entidades e Value Objects do Domínio

*   **Descrição:** Implementar as entidades e Value Objects centrais para Jobs/Activities, AgentInternalState, Workers, Queues, Tasks e Tools, seguindo os princípios de Object Calisthenics.
*   **Prioridade:** Alto
*   **Sub-tarefas:**
    *   [02.01 - Refatorar a entidade Job](02-domain/01-refactor-job-entity.md) (Prioridade: Alto, Dependências: Nenhuma)
        *   [02.01.01 - Abrir arquivo da entidade Job](02-domain/01-refactor-job-entity/01-open-job-entity-file.md)
        *   [02.01.02 - Adicionar campo ActivityContext à entidade Job](02-domain/01-refactor-job-entity/02-add-activity-context-field.md)
        *   [02.01.03 - Atualizar construtor e métodos da entidade Job](02-domain/01-refactor-job-entity/03-update-constructor-methods.md)
        *   [02.01.04 - Aplicar Object Calisthenics à entidade Job](02-domain/01-refactor-job-entity/04-apply-object-calisthenics.md)
    *   [02.02 - Criar/Refatorar Value Objects para ActivityContext](02-domain/02-create-activity-context-vos.md) (Prioridade: Médio, Dependências: Nenhuma)
        *   [02.02.01 - Criar Value Object ActivityType](02-domain/02-create-activity-context-vos/01-create-activity-type-vo.md)
        *   [02.02.02 - Criar Value Object ActivityHistoryEntry](02-domain/02-create-activity-context-vos/02-create-activity-history-entry-vo.md)
        *   [02.02.03 - Criar Value Object ActivityHistory](02-domain/02-create-activity-context-vos/03-create-activity-history-vo.md)
        *   [02.02.04 - Criar Value Object/Interface ActivityContext](02-domain/02-create-activity-context-vos/04-create-activity-context-vo.md)
        *   [02.02.05 - Aplicar Object Calisthenics aos VOs de ActivityContext](02-domain/02-create-activity-context-vos/05-apply-object-calisthenics.md)
    *   [02.03 - Criar/Refatorar a entidade AgentInternalState](02-domain/03-create-agent-internal-state-entity.md) (Prioridade: Médio, Dependências: Nenhuma)
        *   [02.03.01 - Abrir/Criar arquivo da entidade AgentInternalState](02-domain/03-create-agent-internal-state-entity/01-open-create-agent-state-file.md)
        *   [02.03.02 - Definir estrutura da entidade AgentInternalState](02-domain/03-create-agent-internal-state-entity/02-define-entity-structure.md)
        *   [02.03.03 - Aplicar Object Calisthenics à entidade AgentInternalState](02-domain/03-create-agent-internal-state-entity/03-apply-object-calisthenics.md)
    *   [02.04 - Criar/Refatorar a entidade Worker](02-domain/04-create-worker-entity.md) (Prioridade: Médio, Dependências: Nenhuma)
        *   [02.04.01 - Abrir/Criar arquivo da entidade Worker](02-domain/04-create-worker-entity/01-open-create-worker-file.md)
        *   [02.04.02 - Criar Value Object WorkerStatus](02-domain/04-create-worker-entity/02-create-worker-status-vo.md)
        *   [02.04.03 - Definir estrutura da entidade Worker](02-domain/04-create-worker-entity/03-define-entity-structure.md)
        *   [02.04.04 - Aplicar Object Calisthenics à entidade Worker e VO](02-domain/04-create-worker-entity/04-apply-object-calisthenics.md)
    *   [02.05 - Definir a interface de domínio para Queue](02-domain/05-define-queue-interface.md) (Prioridade: Alto, Dependências: Nenhuma)
        *   [02.05.01 - Criar arquivo da interface Queue](02-domain/05-define-queue-interface/01-create-queue-interface-file.md)
        *   [02.05.02 - Definir métodos da interface Queue](02-domain/05-define-queue-interface/02-define-queue-methods.md)
    *   [02.06 - Definir a interface de domínio para Task](02-domain/06-define-task-interface.md) (Prioridade: Alto, Dependências: Nenhuma)
        *   [02.06.01 - Criar arquivo da interface Task](02-domain/06-define-task-interface/01-create-task-interface-file.md)
        *   [02.06.02 - Definir método execute da interface Task](02-domain/06-define-task-interface/02-define-execute-method.md)
    *   [02.07 - Definir a interface de domínio para Tool](02-domain/07-define-tool-interface.md) (Prioridade: Alto, Dependências: Nenhuma)
        *   [02.07.01 - Criar arquivo da interface Tool](02-domain/07-define-tool-interface/01-create-tool-interface-file.md)
        *   [02.07.02 - Definir métodos e campos da interface Tool](02-domain/07-define-tool-interface/02-define-tool-methods-fields.md)
    *   [02.08 - Definir as interfaces de domínio para Repositórios](02-domain/08-define-repository-interfaces.md) (Prioridade: Alto, Dependências: Nenhuma)
        *   [02.08.01 - Criar arquivo da interface JobRepository](02-domain/08-define-repository-interfaces/01-create-job-repository-interface-file.md)
        *   [02.08.02 - Definir métodos da interface JobRepository](02-domain/08-define-repository-interfaces/02-define-job-repository-methods.md)
        *   [02.08.03 - Criar arquivo da interface AgentStateRepository](02-domain/08-define-repository-interfaces/03-create-agent-state-repository-interface-file.md)
        *   [02.08.04 - Definir métodos da interface AgentStateRepository](02-domain/08-define-repository-interfaces/04-define-agent-state-repository-methods.md)
    *   [02.09 - Aplicar Object Calisthenics às entidades e VOs do domínio](02-domain/09-apply-object-calisthenics.md) (Prioridade: Médio, Dependências: 02.01, 02.02, 02.03, 02.04)
        *   [02.09.01 - Aplicar Object Calisthenics na entidade Job](02-domain/09-apply-object-calisthenics/01-apply-calisthenics-job-entity.md)
        *   [02.09.02 - Aplicar Object Calisthenics nos Value Objects de ActivityContext](02-domain/09-apply-object-calisthenics/02-apply-calisthenics-activity-context-vos.md)
        *   [02.09.03 - Aplicar Object Calisthenics na entidade AgentInternalState](02-domain/09-apply-object-calisthenics/03-apply-calisthenics-agent-state-entity.md)
        *   [02.09.04 - Aplicar Object Calisthenics na entidade Worker e Value Object WorkerStatus](02-domain/09-apply-object-calisthenics/04-apply-calisthenics-worker-entity-vo.md)
        *   [02.09.05 - Aplicar Object Calisthenics em outros Value Objects de domínio relevantes](02-domain/09-apply-object-calisthenics/05-apply-calisthenics-other-vos.md)
    *   [02.10 - Definir a interface de aplicação para WorkerPool](02-domain/10-define-worker-pool-interface.md) (Prioridade: Alto, Dependências: Nenhuma)
        *   [02.10.01 - Criar arquivo da interface WorkerPool](02-domain/10-define-worker-pool-interface/01-create-worker-pool-interface-file.md)
        *   [02.10.02 - Definir métodos essenciais da interface WorkerPool](02-domain/10-define-worker-pool-interface/02-define-essential-methods.md)
        *   [02.10.03 - Refinar métodos e adicionar outros conforme necessário](02-domain/10-define-worker-pool-interface/03-refine-and-add-methods.md)

### 03 - Infraestrutura - Persistência

*   **Descrição:** Implementar as classes de repositório na camada de Infraestrutura que utilizam Drizzle ORM para persistir e recuperar as entidades de domínio `Job`/`Activity` e `AgentInternalState`.
*   **Prioridade:** Médio
*   **Sub-tarefas:**
    *   [03.01 - Refatorar schema Drizzle de Jobs para incluir ActivityContext](03-infra-persistence/01-refactor-job-schema.md) (Prioridade: Médio, Dependências: 02.01)
    *   [03.02 - Criar schema Drizzle para AgentInternalState](03-infra-persistence/02-create-agent-state-schema.md) (Prioridade: Médio, Dependências: 02.03)
    *   [03.03 - Refatorar JobDrizzleRepository](03-infra-persistence/03-refactor-job-repository.md) (Prioridade: Médio, Dependências: 02.01, 02.08)
    *   [03.04 - Criar AgentStateDrizzleRepository](03-infra-persistence/04-create-agent-state-repository.md) (Prioridade: Médio, Dependências: 02.03, 02.08)
    *   [03.05 - Garantir a correção do mapeamento entre entidades de domínio e objetos Drizzle](03-infra-persistence/05-ensure-mapping-correctness.md) (Prioridade: Médio, Dependências: 03.03, 03.04)

### 04 - Aplicação - Serviços Base

*   **Descrição:** Implementar os serviços essenciais na camada de Aplicação que gerenciam a lógica da fila, o pool de workers e o ponto de entrada para a criação de novas Jobs/Activities.
*   **Prioridade:** Médio
*   **Sub-tarefas:**
    *   [04.01 - Implementar QueueService](04-app-services/01-implement-queue-service.md) (Prioridade: Médio, Dependências: 02.05, 03.03)
    *   [04.02 - Implementar WorkerPool](04-app-services/02-implement-worker-pool.md) (Prioridade: Médio, Dependências: 02.10, 02.04)
    *   [04.03 - Implementar ProcessJobService](04-app-services/03-implement-process-job-service.md) (Prioridade: Médio, Dependências: 02.01, 02.05, 03.03)
    *   [04.04 - Verificar dependências entre os serviços base](04-app-services/04-verify-dependencies.md) (Prioridade: Médio, Dependências: 04.01, 04.02, 04.03)
    *   [04.05 - Aplicar Object Calisthenics nos serviços base](04-app-services/05-apply-object-calisthenics.md) (Prioridade: Médio, Dependências: 04.01, 04.02, 04.03)

### 05 - Aplicação - Orquestração do Agente

*   **Descrição:** Implementar o `AutonomousAgent` que contém o loop de raciocínio e orquestra o processamento de uma `Job`/`Activity`, a interface `IAgentService` para despacho de Tasks, e o `TaskFactory` para instanciar Tasks concretas.
*   **Prioridade:** Alto
*   **Sub-tarefas:**
    *   [05.01 - Definir interface AgentService](05-app-agent/01-define-agent-service-interface.md) (Prioridade: Alto, Dependências: Nenhuma)
    *   [05.02 - Criar classe AutonomousAgent](05-app-agent/02-create-autonomous-agent-class.md) (Prioridade: Médio, Dependências: 05.01, 02.03, 02.01)
    *   [05.03 - Implementar método processActivity no AutonomousAgent](05-app-agent/03-implement-process-activity-method.md) (Prioridade: Médio, Dependências: 05.02, 02.01, 02.02)
    *   [05.04 - Implementar interação com LLM no AutonomousAgent](05-app-agent/04-implement-llm-interaction.md) (Prioridade: Médio, Dependências: 05.03, 06.01)
    *   [05.05 - Implementar atualização de contexto no AutonomousAgent](05-app-agent/05-implement-context-update.md) (Prioridade: Médio, Dependências: 05.03, 02.02, 02.03)
    *   [05.06 - Criar TaskFactory](05-app-agent/06-create-task-factory.md) (Prioridade: Médio, Dependências: 02.06, 02.07)
    *   [05.07 - Implementar gerenciamento inicial do histórico](05-app-agent/07-implement-history-management.md) (Prioridade: Médio, Dependências: 05.03, 02.01)
    *   [05.08 - Aplicar Object Calisthenics a componentes de agente/orq.](05-app-agent/08-apply-object-calisthenics.md) (Prioridade: Médio, Dependências: 05.02, 05.03, 05.04, 05.05, 05.06, 05.07)

### 06 - Infraestrutura - Adapters

*   **Descrição:** Implementar as classes de adapter na camada de Infraestrutura que fornecem as implementações concretas para as interfaces de LLM e Tool definidas nas camadas internas.
*   **Prioridade:** Médio
*   **Sub-tarefas:**
    *   [06.01 - Implementar LLM Adapter](06-infra-adapters/01-implement-llm-adapter.md) (Prioridade: Médio, Dependências: 02.07)
    *   [06.02 - Implementar FileSystem Tool Adapter](06-infra-adapters/02-implement-filesystem-tool.md) (Prioridade: Médio, Dependências: 02.07)
    *   [06.03 - Implementar Terminal Tool Adapter](06-infra-adapters/03-implement-terminal-tool.md) (Prioridade: Médio, Dependências: 02.07)
    *   [06.04 - Verificar isolamento das interfaces nos adapters](06-infra-adapters/04-verify-interfaces-isolation.md) (Prioridade: Médio, Dependências: 06.01, 06.02, 06.03)
    *   [06.05 - Aplicar Object Calisthenics nos adapters](06-infra-adapters/05-apply-object-calisthenics.md) (Prioridade: Médio, Dependências: 06.01, 06.02, 06.03)

### 07 - Aplicação - Tasks

*   **Descrição:** Implementar as classes concretas para as `Tasks` na camada de Aplicação. Estas classes encapsularão a lógica acionável que o `AutonomousAgent` decide executar, utilizando as interfaces de `Tool` e `LLM`.
*   **Prioridade:** Médio
*   **Sub-tarefas:**
    *   [07.01 - Implementar CallToolTask](07-app-tasks/01-implement-call-tool-task.md) (Prioridade: Médio, Dependências: 02.06, 02.07)
    *   [07.02 - Implementar LLMReasoningTask](07-app-tasks/02-implement-llm-reasoning-task.md) (Prioridade: Médio, Dependências: 02.06, 05.04)
    *   [07.03 - Implementar outras Tasks iniciais necessárias](07-app-tasks/03-implement-other-initial-tasks.md) (Prioridade: Médio, Dependências: 02.06)
    *   [07.04 - Verificar dependências das Tasks](07-app-tasks/04-verify-interfaces-dependencies.md) (Prioridade: Médio, Dependências: 07.01, 07.02, 07.03)
    *   [07.05 - Aplicar Object Calisthenics nas Tasks](07-app-tasks/05-apply-object-calisthenics.md) (Prioridade: Médio, Dependências: 07.01, 07.02, 07.03)

### 08 - Integração e Fluxo

*   **Descrição:** Integrar todos os componentes implementados nas tarefas anteriores e implementar o fluxo completo de processamento de uma `Job`/`Activity`.
*   **Prioridade:** Alto
*   **Sub-tarefas:**
    *   [08.01 - Conectar ProcessJobService e Queue](08-integration/01-connect-process-job-queue.md) (Prioridade: Médio, Dependências: 04.03, 04.01)
    *   [08.02 - Conectar WorkerPool e Queue](08-integration/02-connect-worker-pool-queue.md) (Prioridade: Médio, Dependências: 04.02, 04.01)
    *   [08.03 - Implementar código do processo Worker](08-integration/03-implement-worker-process-code.md) (Prioridade: Médio, Dependências: 04.03, 05.02)
    *   [08.04 - Conectar Worker e Agent](08-integration/04-connect-worker-agent.md) (Prioridade: Médio, Dependências: 08.03, 05.02)
    *   [08.05 - Conectar Agent e IAgentService](08-integration/05-connect-agent-service.md) (Prioridade: Médio, Dependências: 08.04, 05.01)
    *   [08.06 - Conectar IAgentService e TaskFactory](08-integration/06-connect-service-factory.md) (Prioridade: Médio, Dependências: 08.05, 05.06)
    *   [08.07 - Conectar TaskFactory, Tasks e Adapters](08-integration/07-connect-factory-tasks-adapters.md) (Prioridade: Médio, Dependências: 08.06, 07.01, 07.02, 07.03, 06.01, 06.02, 06.03)
    *   [08.08 - Implementar notificação Worker -> Queue](08-integration/08-implement-worker-queue-notification.md) (Prioridade: Médio, Dependências: 08.03, 04.01)
    *   [08.09 - Configurar injeção de dependência](08-integration/09-configure-dependency-injection.md) (Prioridade: Alto, Dependências: 02.01, 02.02, 02.03, 02.04, 02.05, 02.06, 02.07, 02.08, 02.09, 02.10, 03.01, 03.02, 03.03, 03.04, 03.05, 04.01, 04.02, 04.03, 04.04, 04.05, 05.01, 05.02, 05.03, 05.04, 05.05, 05.06, 05.07, 05.08, 06.01, 06.02, 06.03, 06.04, 06.05, 07.01, 07.02, 07.03, 07.04, 07.05, 08.01, 08.02, 08.03, 08.04, 08.05, 08.06, 08.07, 08.08)
    *   [08.10 - Aplicar Object Calisthenics ao código de integração](08-integration/10-apply-object-calisthenics.md) (Prioridade: Médio, Dependências: 08.01, 08.02, 08.03, 08.04, 08.05, 08.06, 08.07, 08.08, 08.09)

### 09 - Revisão e Refinamento

*   **Descrição:** Realizar uma revisão completa do código implementado para garantir a aderência rigorosa aos princípios da Clean Architecture e Object Calisthenics, identificar e corrigir possíveis problemas de design, clareza ou modularidade.
*   **Prioridade:** Baixo
*   **Sub-tarefas:**
    *   [09.01 - Revisar código da camada de Domínio](09-review/01-review-domain-code.md) (Prioridade: Baixo, Dependências: 02.01, 02.02, 02.03, 02.04, 02.05, 02.06, 02.07, 02.08, 02.09, 02.10)
    *   [09.02 - Revisar código da camada de Infraestrutura - Persistência](09-review/02-review-persistence-code.md) (Prioridade: Baixo, Dependências: 03.01, 03.02, 03.03, 03.04, 03.05)
    *   [09.03 - Revisar código da camada de Aplicação - Serviços Base](09-review/03-review-base-services-code.md) (Prioridade: Baixo, Dependências: 04.01, 04.02, 04.03, 04.04, 04.05)
    *   [09.04 - Revisar código da camada de Aplicação - Orquestração do Agente](09-review/04-review-agent-orchestration-code.md) (Prioridade: Baixo, Dependências: 05.01, 05.02, 05.03, 05.04, 05.05, 05.06, 05.07, 05.08)
    *   [09.05 - Revisar código da camada de Infraestrutura - Adapters](09-review/05-review-adapters-code.md) (Prioridade: Baixo, Dependências: 06.01, 06.02, 06.03, 06.04, 06.05)
    *   [09.06 - Revisar código da camada de Aplicação - Tasks](09-review/06-review-tasks-code.md) (Prioridade: Baixo, Dependências: 07.01, 07.02, 07.03, 07.04, 07.05)
    *   [09.07 - Revisar código de Integração e Fluxo](09-review/07-review-integration-code.md) (Prioridade: Baixo, Dependências: 08.01, 08.02, 08.03, 08.04, 08.05, 08.06, 08.07, 08.08, 08.09, 08.10)
    *   [09.08 - Refatorar código com base na revisão](09-review/08-refactor-based-on-review.md) (Prioridade: Médio, Dependências: 09.01, 09.02, 09.03, 09.04, 09.05, 09.06, 09.07)
    *   [09.09 - Documentar refatorações significativas em ADRs](09-review/09-document-refactor-adrs.md) (Prioridade: Baixo, Dependências: 09.08)

## Próximos Passos

O próximo passo é iniciar a execução das sub-sub-tarefas, seguindo a ordem definida pelas prioridades e dependências. Cada sub-sub-tarefa será tratada individualmente, com foco em completar o entregável esperado antes de passar para a próxima.
