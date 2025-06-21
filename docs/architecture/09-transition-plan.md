# 09: Plano de Transição e Refatoração Incremental

A refatoração completa de um sistema para uma nova arquitetura é um esforço considerável. Embora o objetivo seja alcançar a arquitetura alvo descrita neste conjunto de documentos, uma abordagem incremental pode ser pragmática, dependendo dos recursos e do tempo disponíveis, permitindo entregar valor e obter feedback mais cedo.

A seguir, uma sugestão de como a transição para a nova arquitetura poderia ser faseada:

## Fase 1: Design da Arquitetura e Fundações de DI (Parcialmente Concluída)

*   **Atividades:**
    *   Definição detalhada da arquitetura alvo (estes documentos `docs/architecture/*.md`). (Concluído)
    *   Configuração inicial do container InversifyJS (`src/infrastructure/ioc/inversify.config.ts` e `types.ts`) com os bindings para as interfaces e serviços fundamentais que serão implementados nas fases seguintes.
*   **Objetivo:** Ter um blueprint claro e o setup básico para Injeção de Dependência.

## Fase 2: Implementação do Subsistema de Fila de Jobs Genérico

*   **Atividades:**
    *   Implementar a entidade `Job` agnóstica ao domínio (conforme [`02-domain-layer.md`](./02-domain-layer.md)).
    *   Implementar a interface `IJobRepository` (incluindo toda a lógica de persistência com SQLite/Drizzle, gerenciamento de locks, `workerToken`, e transições de estado como `findNextPending`, `save` com lógica de backoff) conforme detalhado em [`02-domain-layer.md`](./02-domain-layer.md) e [`03-queue-subsystem.md`](./03-queue-subsystem.md).
    *   Implementar a classe `QueueClient` (conforme [`03-queue-subsystem.md`](./03-queue-subsystem.md)) que atua como uma fachada para o `IJobRepository` para uma fila específica.
    *   Implementar a classe `Worker` genérica (conforme [`03-queue-subsystem.md`](./03-queue-subsystem.md)), capaz de monitorar uma fila (via `QueueClient`) e executar uma função `jobProcessor` genérica.
*   **Objetivo:** Ter um sistema de filas local, robusto e funcional, pronto para ser utilizado por qualquer parte da aplicação. Testar este subsistema de forma isolada, se possível.

## Fase 3: Camada de Domínio Essencial e Casos de Uso Iniciais

*   **Atividades:**
    *   Implementar a entidade `AIAgent` como DTO/Configuração e sua interface de repositório `IAIAgentRepository` (com uma implementação inicial, talvez in-memory ou Drizzle).
    *   Implementar Casos de Uso fundamentais da aplicação que interagem com o sistema de filas, como o `EnqueueJobUseCase` (conforme [`02-domain-layer.md`](./02-domain-layer.md)), que permite à aplicação principal adicionar jobs às filas.
    *   Implementar outros Casos de Uso não diretamente ligados aos agentes, mas importantes para a aplicação (ex: `CreateProjectUseCase`).
*   **Objetivo:** Validar a criação e o enfileiramento de jobs genéricos. Ter a base para o gerenciamento de perfis de agentes.

## Fase 4: Implementação da Lógica de Execução de Agentes de IA

*   **Atividades:**
    *   Implementar o `AIAgentExecutionService` (conforme [`04-ai-agent-execution.md`](./04-ai-agent-execution.md)), incluindo a lógica para fornecer a função `jobProcessor` específica dos agentes.
    *   Implementar as interfaces e serviços de infraestrutura dos quais o `AIAgentExecutionService` depende (ex: `ILLMService` com uma implementação concreta como `DeepSeekLLMService`, `IToolRegistry` com algumas ferramentas básicas).
    *   Implementar o `AgentLifecycleService` (ou lógica equivalente na inicialização do Electron em `infrastructure/electron/main.ts`) que:
        *   Carrega as configurações dos `AIAgent`s.
        *   Instancia `QueueClient`s para cada fila de agente.
        *   Obtém os `jobProcessor`s do `AIAgentExecutionService`.
        *   Instancia e inicia os `Worker`s para cada fila de agente.
*   **Objetivo:** Ter a capacidade de processar `Job`s através da lógica de IA dos agentes, utilizando o subsistema de filas. Testar o fluxo completo para tarefas de agente simples.

## Fase 5: Desenvolvimento de Ferramentas e Capacidades Avançadas dos Agentes

*   **Atividades:**
    *   Implementar o conjunto completo de ferramentas que os agentes precisarão (ex: `FileSystemTool`, `ExecuteCommandTool` para Git).
    *   Detalhar e implementar a lógica de interação com worktrees Git para tarefas de desenvolvimento, conforme descrito em [`08-agent-git-worktree.md`](./08-agent-git-worktree.md).
    *   Desenvolver `jobProcessor`s mais complexos para diferentes tipos de tarefas de agente.
*   **Objetivo:** Capacitar os agentes com as ferramentas e a lógica para realizar as tarefas complexas para as quais foram projetados.

## Fase 6: Refatoração da UI e Integração com Handlers IPC

*   **Atividades:**
    *   Refatorar os Handlers IPC (`src/infrastructure/electron/ipc-handlers/`) para usar os novos Casos de Uso (obtidos via DI) para interagir com o backend (ex: enfileirar jobs para agentes, gerenciar configurações de agentes/projetos).
    *   Adaptar a UI React (`src/infrastructure/ui/react/`) para:
        *   Chamar os novos Handlers IPC via `window.api`.
        *   Apresentar o status dos jobs e os resultados do processamento dos agentes (possivelmente através de um sistema de eventos ou polling, se necessário, para atualizações assíncronas).
*   **Objetivo:** Ter uma UI funcional que interaja corretamente com a nova arquitetura de backend.

## Fase 7: Iteração, Testes e Refinamento Contínuo

*   **Atividades:**
    *   Realizar testes mais abrangentes em todo o sistema.
    *   Coletar feedback e refinar a experiência do usuário e a performance do sistema.
    *   Continuar aplicando os princípios de Clean Architecture e Object Calisthenics em todos os novos desenvolvimentos e manutenções.
    *   Expandir o conjunto de ferramentas e as capacidades dos agentes.
*   **Objetivo:** Garantir a estabilidade, usabilidade e evolutibilidade do sistema a longo prazo.

Esta abordagem faseada permite que o progresso seja gerenciável e que os riscos sejam mitigados, com pontos de verificação e entrega de valor em cada fase. A ordem e o escopo exato de cada fase podem ser ajustados conforme as prioridades do projeto.
```
