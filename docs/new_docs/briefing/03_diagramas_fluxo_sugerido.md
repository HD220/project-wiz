# Sugestões de Diagramas de Fluxo Aprimorados para o Project Wiz

## Introdução

Os diagramas a seguir são propostas e sugestões para refinar, detalhar ou expandir os fluxos conceituais e a arquitetura de componentes do Project Wiz. Estas sugestões baseiam-se na análise crítica da documentação "As Is" e visam fomentar discussões que levem a um design mais claro, robusto, detalhado e preparado para futuras evoluções do sistema.

## 1. Diagrama de Sequência Sugerido: Fluxo de Vida de um Job (com Detalhes Adicionais)

*   **Racional das Sugestões:**
    O diagrama "As Is" oferece uma boa visão geral. Esta sugestão visa adicionar mais granularidade e robustez ao processo, contemplando:
    *   **Validação de Entrada:** Garantir que os Jobs sejam válidos antes de entrarem na fila principal.
    *   **Gerenciamento de Workers:** Introduzir um `WorkerManager` para uma gestão mais explícita do pool de Workers.
    *   **Decomposição de Jobs:** Permitir que Personas possam decompor Jobs complexos em Sub-Jobs menores e gerenciáveis, promovendo modularidade.
    *   **Tratamento de Erros Detalhado:** Especificar melhor como os erros durante a execução de Tasks/Tools são tratados e como falhas de Job são reportadas.
    *   **Feedback ao Usuário:** Aumentar os pontos de feedback para o usuário, melhorando a transparência do processo.

*   **Diagrama Proposto:**
    ```mermaid
    sequenceDiagram
        participant Usuário
        participant Frontend as Interface Frontend
        participant ValidadorJob as Validador de Job (Integrado à Fila)
        participant Fila as Sistema de Fila (Queue)
        participant WorkerManager as Gerenciador de Workers (Pool)
        participant Worker
        participant Persona as Persona (Agente Autônomo)
        participant LLM as LLM (Modelo de Linguagem)
        participant Ferramentas as Sistema de Ferramentas
        participant Dados as Armazenamento (Contexto/Estado/Logs)

        Usuário->>Frontend: Cria Job (dados, tipo, prioridade, dependências)
        Frontend->>ValidadorJob: Submete Job para Validação e Enfileiramento
        activate ValidadorJob
        ValidadorJob->>Fila: Job validado e enfileirado (status pendente/aguardando)
        ValidadorJob-->>Frontend: Confirmação de recebimento/validação do Job
        deactivate ValidadorJob
        Fila-->>Frontend: (Opcional) Notifica Job efetivamente enfileirado e pronto

        Worker->>WorkerManager: Solicita novo Job disponível
        activate WorkerManager
        WorkerManager->>Fila: Obtém próximo Job elegível da Fila
        Fila-->>WorkerManager: Entrega Job ao Gerenciador
        WorkerManager-->>Worker: Atribui Job específico ao Worker
        deactivate WorkerManager

        Worker->>Persona: Inicia processamento do Job atribuído
        activate Persona
        Persona-->>Frontend: (Opcional) Notifica usuário que o Job foi iniciado

        Persona->>Dados: Carrega AgentInternalState (conhecimento global da Persona)
        Persona->>Dados: Carrega ActivityContext específico do Job (histórico, inputs)

        loop Ciclo de Raciocínio e Ação da Persona
            Persona->>LLM: Consulta LLM para análise, planejamento ou decisão (com contexto atualizado)
            activate LLM
            LLM-->>Persona: Retorna insights, plano, próxima ação sugerida
            deactivate LLM

            alt Persona decide criar Sub-Job para decompor tarefa
                Persona->>Fila: Submete Novo Sub-Job (com referência ao Job pai)
                Fila-->>Dados: Armazena Sub-Job (que seguirá seu próprio ciclo)
                Persona->>Dados: Atualiza ActivityContext do Job pai (ex: anotação sobre Sub-Job criado)
            else Persona decide usar Ferramenta/Task
                Persona->>Ferramentas: Executa Ferramenta/Task específica (com argumentos)
                activate Ferramentas
                alt Execução bem-sucedida da Ferramenta/Task
                    Ferramentas-->>Persona: Retorna resultado da operação
                else Falha na Ferramenta/Task
                    Ferramentas-->>Persona: Retorna erro/exceção da operação
                    Persona->>Dados: Loga erro específico da Ferramenta/Task no ActivityContext
                    Persona-->>Worker: (Opcional) Reporta falha na ação (pode necessitar nova tentativa ou levar à falha do Job)
                end
                deactivate Ferramentas
            else Persona não consegue progredir (ex: informação insuficiente, erro de lógica)
                 Persona->>Dados: Loga impasse no ActivityContext
                 Persona-->>Worker: Reporta impossibilidade de progresso (pode levar à falha do Job)
            end
            Persona->>Dados: Atualiza ActivityContext (progresso, resultados parciais, logs de decisão)
        end

        alt Job Concluído com Sucesso pela Persona
            Persona->>Worker: Notifica conclusão bem-sucedida do Job (com resultado final)
            deactivate Persona
            Worker->>Fila: Atualiza status do Job na Fila para 'Concluído'
            Worker->>Dados: Armazena resultado final e logs de sucesso do Job
            Fila-->>Frontend: Notifica Job concluído com sucesso
            Frontend-->>Usuário: Exibe Job concluído e disponibiliza resultados
        else Job Falhou (após retentativas esgotadas ou erro crítico irrecuperável)
            Persona->>Worker: Notifica falha crítica do Job (com detalhes e logs do erro)
            deactivate Persona
            Worker->>Fila: Atualiza status do Job na Fila para 'Falhou'
            Worker->>Dados: Armazena logs de erro detalhados do Job
            Fila-->>Frontend: Notifica falha do Job
            Frontend-->>Usuário: Exibe falha do Job e informações de erro relevantes
        end
    ```

## 2. Diagrama de Blocos Sugerido: Componentes Backend (com Orquestração e Monitoramento)

*   **Racional das Sugestões:**
    *   **Orquestrador de Agentes:** Formalizar um componente `Agent Orchestrator` poderia centralizar lógicas mais complexas, como a designação otimizada de `Jobs` para `Personas` com base em suas capacidades ou carga atual, ou até mesmo orquestrar a colaboração entre múltiplas `Personas` em `Jobs` mais complexos.
    *   **Monitoramento e Logging Centralizado:** Um sistema dedicado de `Monitoring & Logging` é crucial para a observabilidade, depuração e análise de performance do sistema como um todo.
    *   **Interação do StateManager:** Explicitar que o `StateManager` também pode ser relevante para a `Queue` em si, caso a fila precise de persistência robusta de seu próprio estado interno (além dos Jobs).

*   **Diagrama Proposto:**
    ```mermaid
    graph TD
        subgraph Interação Usuário
            UI[Interface Frontend]
        end

        subgraph Núcleo do Backend
            Queue[Job/Activity Management System (Queue)]
            WorkerPool[Worker & Worker Pool]
                WorkerManager["WorkerManager (dentro do Pool)"]
                Worker["Worker (instância)"]
            AgentOrchestrator[Agent Orchestrator]
            PersonaLogic[Persona Core Logic / Autonomous Agent]
            TaskManager[Task Execution System]
            ToolRegistry[Tool Framework/Registry]
            StateManager[State Management Subsystem]
            LLMIntegration[LLM Integration Point]
            MonitoringSystem[Monitoring & Logging System]
        end

        UI -- 1. Criação/Monitoramento de Jobs --> Queue

        AgentOrchestrator -- 2. Coordena com WorkerManager para atribuição --> WorkerManager
        WorkerManager -- 3. Gerencia Workers e obtém Jobs da --> Queue
        WorkerPool --- WorkerManager
        WorkerPool --- Worker

        Worker -- 4. Delega Job para --> PersonaLogic

        PersonaLogic -- 5. Carrega/Salva Estado --> StateManager
        PersonaLogic -- 6. Usa para Raciocínio --> LLMIntegration
        PersonaLogic -- 7. Executa --> TaskManager

        TaskManager -- 8. Utiliza --> ToolRegistry
        TaskManager -- 9. Pode usar para Tasks complexas --> LLMIntegration

        PersonaLogic -- 10. Reporta Status/Resultado --> Worker
        Worker -- 11. Reporta para --> WorkerManager
        WorkerManager -- 12. Atualiza Status na --> Queue

        Queue -- Persistência do estado da fila --> StateManager

        %% Fluxos de Monitoramento e Logging
        Queue -- Logs e Métricas --> MonitoringSystem
        WorkerPool -- Logs e Métricas --> MonitoringSystem
        AgentOrchestrator -- Logs e Métricas --> MonitoringSystem
        PersonaLogic -- Logs e Métricas --> MonitoringSystem
        StateManager -- Logs e Métricas --> MonitoringSystem
        LLMIntegration -- Logs e Métricas --> MonitoringSystem

        %% O AgentOrchestrator pode influenciar a seleção da Persona pela Worker com base em critérios
        AgentOrchestrator -.-> PersonaLogic  %% Lógica de seleção/configuração avançada de Persona
    ```

## 3. Diagrama de Atividade Sugerido: Tomada de Decisão da Persona (com Tratamento de Incerteza e Aprendizado)

*   **Racional das Sugestões:**
    A tomada de decisão de uma IA pode ser aprimorada com mecanismos para lidar com incertezas e com a capacidade de aprender com interações.
    *   **Avaliação de Confiança:** Permitir que a `Persona` avalie a confiança de um plano ou decisão do `LLM`.
    *   **Resolução de Baixa Confiança:** Se a confiança for baixa, a `Persona` poderia buscar esclarecimentos do usuário ou consultar uma base de conhecimento mais ampla.
    *   **Registro de Aprendizado:** Após a conclusão de uma ação ou `Job`, a `Persona` poderia registrar aprendizados (positivos ou negativos) para refinar seu `AgentInternalState` e melhorar decisões futuras.
    *   **Tratamento de Falha de Ferramentas:** Maior detalhe em como a `Persona` reage quando uma `Tool` específica falha, permitindo que ela tente alternativas ou reformule o plano.

*   **Diagrama Proposto:**
    ```mermaid
    graph LR
        A[Início do Processamento do Job pela Persona] --> B(Carregar AgentInternalState + ActivityContext);
        B -- Sucesso --> C{Analisar Objetivo e Planejar com LLM};
        B -- Falha ao Carregar --> X[Erro Crítico: Falha ao Carregar Contexto];

        C -- Plano/Ação Definida --> D{Avaliar Confiança da Decisão/Plano do LLM};
        C -- Falha no Planejamento/LLM Irrecuperável --> Y[Registrar Falha de Raciocínio];

        D -- Confiança Alta --> F{Selecionar Próxima Ação Concreta (Task/Tool)};
        D -- Confiança Baixa/Média --> E{Resolver Baixa Confiança};

        E -- Tentar Esclarecimento --> E1[Solicitar Esclarecimento ao Usuário via Frontend];
        E1 -- Informação Recebida --> C; %% Re-planejar com nova informação
        E1 -- Sem Informação/Timeout --> F; %% Prosseguir com melhor decisão atual ou reportar impasse
        E -- Consultar Base de Conhecimento --> E2[Consultar Base de Conhecimento Adicional/Memória Estendida];
        E2 -- Conhecimento Encontrado --> C; %% Re-planejar com novo conhecimento
        E2 -- Nada Encontrado --> F; %% Prosseguir com melhor decisão atual

        F -- Ação é uma Task específica --> G[Executar Task via Task Execution System];
        F -- Ação é uso direto de Tool --> H[Executar Tool via Tool Framework/Registry];
        F -- Nenhuma ação válida/Impasse --> Y;

        G -- Sucesso da Task --> I(Atualizar ActivityContext com Resultado da Task);
        G -- Falha na Task --> G1{Tratar Falha da Task};
        H -- Sucesso da Tool --> J(Atualizar ActivityContext com Resultado da Tool);
        H -- Falha na Tool --> H1{Tratar Falha da Tool};

        G1 -- Tentar Alternativa/Reprocessar? --> C;
        G1 -- Erro Persistente --> Y;
        H1 -- Tentar Alternativa/Reprocessar? --> C;
        H1 -- Erro Persistente --> Y;

        I --> K{Job Concluído?};
        J --> K;

        K -- Sim (Objetivo Alcançado ou Falha Finalizada) --> L[Registrar Aprendizado (Opcional, atualiza AgentInternalState)];
        L --> M[Finalizar Job e Notificar Worker];
        K -- Não (Mais Passos Necessários) --> C;

        X --> M;
        Y --> M;
    ```
