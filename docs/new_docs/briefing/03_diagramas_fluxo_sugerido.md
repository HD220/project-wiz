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
        participant AgentePersona as Agente (usando Persona)
        participant Fila as Sistema de Fila (Queue)
        participant LLM as LLM (Modelo de Linguagem)
        participant Ferramentas as Sistema de Ferramentas
        participant Dados as Armazenamento (Contexto/Estado/Logs)

        Usuário->>Frontend: Descreve necessidade/objetivo para Agente
        Frontend->>AgentePersona: Envia mensagem do Usuário (via IPC)
        activate AgentePersona
        AgentePersona->>LLM: Analisa solicitação (com AgentInternalState)
        LLM-->>AgentePersona: Sugere criar Job(s) para atender solicitação
        AgentePersona->>Fila: Cria e submete Job(s) para si (com detalhes, tipo, dependências)
        Fila-->>Dados: Armazena Job(s) (status pendente/aguardando)
        AgentePersona-->>Frontend: Confirmação de recebimento e Jobs criados (feedback inicial)
        deactivate AgentePersona

        Fila-->>Frontend: (Opcional) Notifica Job(s) enfileirado(s)

        %% Loop de processamento do Agente (Worker)
        activate AgentePersona
        AgentePersona->>Fila: Solicita seu próximo Job elegível
        Fila-->>AgentePersona: Entrega Job
        AgentePersona-->>Frontend: (Opcional) Notifica usuário que Job X foi iniciado

        AgentePersona->>Dados: Carrega/Atualiza AgentInternalState (conhecimento global)
        AgentePersona->>Dados: Carrega ActivityContext específico do Job (histórico, inputs)

        loop Ciclo de Raciocínio e Ação da Persona (LLM + Tools)
            AgentePersona->>LLM: Consulta LLM para análise, planejamento ou decisão (com contexto atualizado)
            activate LLM
            LLM-->>AgentePersona: Retorna insights, plano, próxima ação sugerida
            deactivate LLM

            alt AgentePersona decide criar Sub-Job para decompor tarefa
                AgentePersona->>Fila: Submete Novo Sub-Job (com referência ao Job pai)
                Fila-->>Dados: Armazena Sub-Job
                AgentePersona->>Dados: Atualiza ActivityContext do Job pai (ex: anotação sobre Sub-Job criado)
            else AgentePersona decide usar Ferramenta/Task
                AgentePersona->>Ferramentas: Executa Ferramenta/Task específica (com argumentos)
                activate Ferramentas
                alt Execução bem-sucedida da Ferramenta/Task
                    Ferramentas-->>AgentePersona: Retorna resultado da operação
                else Falha na Ferramenta/Task
                    Ferramentas-->>AgentePersona: Retorna erro/exceção da operação
                    AgentePersona->>Dados: Loga erro específico da Ferramenta/Task no ActivityContext
                    AgentePersona-->>AgentePersona: Reporta falha na ação (pode necessitar nova tentativa ou levar à falha do Job)
                end
                deactivate Ferramentas
            else AgentePersona não consegue progredir (ex: informação insuficiente, erro de lógica)
                 AgentePersona->>Dados: Loga impasse no ActivityContext
                 AgentePersona-->>AgentePersona: Reporta impossibilidade de progresso (pode levar à falha do Job)
            end
            AgentePersona->>Dados: Atualiza ActivityContext (progresso, resultados parciais, logs de decisão)
        end

        alt Job Concluído com Sucesso pelo AgentePersona
            AgentePersona->>Fila: Atualiza status do Job na Fila para 'Concluído'
            AgentePersona->>Dados: Armazena resultado final e logs de sucesso do Job
            Fila-->>Frontend: Notifica Job concluído com sucesso
            Frontend-->>Usuário: Exibe Job concluído e disponibiliza resultados
        else Job Falhou (após retentativas esgotadas ou erro crítico irrecuperável)
            AgentePersona->>Fila: Atualiza status do Job na Fila para 'Falhou'
            AgentePersona->>Dados: Armazena logs de erro detalhados do Job
            Fila-->>Frontend: Notifica falha do Job
            Frontend-->>Usuário: Exibe falha do Job e informações de erro relevantes
        end
        deactivate AgentePersona
    ```

## 2. Diagrama de Blocos Sugerido: Componentes Backend (com Orquestração e Monitoramento)

*   **Racional das Sugestões:**
    *   **Orquestrador de Agentes:** Formalizar um componente `Agent Orchestrator` ou `Agent Manager` (como parte do `WorkerPool`) poderia centralizar lógicas mais complexas, como a instanciação, o monitoramento de saúde e a designação otimizada de `Jobs` para `Agentes` (Personas) com base em suas capacidades ou carga atual.
    *   **Monitoramento e Logging Centralizado:** Um sistema dedicado de `Monitoring & Logging` é crucial para a observabilidade, depuração e análise de performance do sistema como um todo.
    *   **Interação do StateManager:** Explicitar que o `StateManager` também pode ser relevante para a `Queue` em si, caso a fila precise de persistência robusta de seu próprio estado interno (além dos Jobs).

*   **Diagrama Proposto:**
    ```mermaid
    graph TD
        subgraph "Interface do Usuário"
            UI[Interface Frontend (React)]
        end

        subgraph "Núcleo do Backend (Electron Main Process)"
            Queue["Sistema de Fila de Jobs (Queue)"]
            AgentManager["Gerenciador de Agentes (Worker Pool)"]
            AgentLogic["Lógica do Agente (Persona Core Logic)"]
            TaskManager["Sistema de Execução de Tasks (Formula Prompts)"]
            ToolRegistry["Framework/Registro de Ferramentas (Tools)"]
            StateManager["Subsistema de Gerenciamento de Estado (SQLite)"]
            LLMIntegration["Ponto de Integração LLM (AI SDK)"]
            MonitoringSystem["Sistema de Monitoramento e Logging"]
        end

        UI -- "1. Interage com (via IPC)" --> AgentLogic %% Usuário conversa com um Agente
        AgentLogic -- "2. Decide criar e submete Jobs para" --> Queue

        AgentManager -- "3. Gerencia instâncias de Agentes" --- AgentLogic
        AgentLogic -- "4. Solicita seus Jobs da" --> Queue

        AgentLogic -- "5. Carrega/Salva Estado" --> StateManager
        AgentLogic -- "6. Usa para Raciocínio" --> LLMIntegration
        AgentLogic -- "7. Formula Task para" --> TaskManager
        TaskManager -- "Envia Prompt para" --> LLMIntegration
        LLMIntegration -- "Retorna resposta do LLM para" --> AgentLogic
        AgentLogic -- "LLM solicita uso de Tool via" --> ToolRegistry
        ToolRegistry -- "Executa Tool e retorna para" --> AgentLogic
        AgentLogic -- "8. Reporta Status do Job para" --> Queue

        Queue -- "Notifica (via IPC) UI sobre status" --> UI
        Queue -- "Persistência da fila e Jobs" --> StateManager

        %% Fluxos de Monitoramento e Logging
        Queue -- "Logs e Métricas" --> MonitoringSystem
        AgentManager -- "Logs e Métricas" --> MonitoringSystem
        AgentLogic -- "Logs e Métricas" --> MonitoringSystem
        StateManager -- "Logs e Métricas" --> MonitoringSystem
        LLMIntegration -- "Logs e Métricas" --> MonitoringSystem
    ```

## 3. Diagrama de Atividade Sugerido: Tomada de Decisão da Persona (com Tratamento de Incerteza e Aprendizado)

*   **Racional das Sugestões:**
    A tomada de decisão de uma IA pode ser aprimorada com mecanismos para lidar com incertezas e com a capacidade de aprender com interações.
    *   **Avaliação de Confiança:** Permitir que a `Persona` (Agente) avalie a confiança de um plano ou decisão do `LLM`.
    *   **Resolução de Baixa Confiança:** Se a confiança for baixa, o Agente poderia buscar esclarecimentos do usuário ou consultar uma base de conhecimento mais ampla.
    *   **Registro de Aprendizado:** Após a conclusão de uma ação ou `Job`, o Agente poderia registrar aprendizados (positivos ou negativos) para refinar seu `AgentInternalState` e melhorar decisões futuras.
    *   **Tratamento de Falha de Ferramentas:** Maior detalhe em como o Agente reage quando uma `Tool` específica falha, permitindo que ele tente alternativas ou reformule o plano.

*   **Diagrama Proposto:**
    ```mermaid
    graph LR
        A["Início do Processamento do Job pelo Agente"] --> B("Carregar AgentInternalState + ActivityContext");
        B -- Sucesso --> C{"Analisar Objetivo e Planejar com LLM"};
        B -- "Falha ao Carregar" --> X["Erro Crítico: Falha ao Carregar Contexto"];

        C -- "Plano/Ação Definida" --> D{"Avaliar Confiança da Decisão/Plano do LLM"};
        C -- "Falha no Planejamento/LLM Irrecuperável" --> Y["Registrar Falha de Raciocínio"];

        D -- "Confiança Alta" --> F{"Selecionar Próxima Ação Concreta (Task/Tool)"};
        D -- "Confiança Baixa/Média" --> E{"Resolver Baixa Confiança"};

        E -- "Tentar Esclarecimento" --> E1["Solicitar Esclarecimento ao Usuário via Frontend"];
        E1 -- "Informação Recebida" --> C; %% Re-planejar com nova informação
        E1 -- "Sem Informação/Timeout" --> F; %% Prosseguir com melhor decisão atual ou reportar impasse
        E -- "Consultar Base de Conhecimento" --> E2["Consultar Base de Conhecimento Adicional (AgentInternalState)"];
        E2 -- "Conhecimento Encontrado" --> C; %% Re-planejar com novo conhecimento
        E2 -- "Nada Encontrado" --> F; %% Prosseguir com melhor decisão atual

        F -- "Ação é uma Task (prompt para LLM)" --> G["Formular e Enviar Task para LLM"];
        F -- "Ação é uso direto de Tool" --> H["Executar Tool via Framework"];
        F -- "Nenhuma ação válida/Impasse" --> Y;

        G -- "Sucesso da Task (LLM respondeu)" --> I("Atualizar ActivityContext com Resultado da Task/LLM");
        G -- "Falha na Task (Erro do LLM)" --> G1{"Tratar Falha da Task/LLM"};
        H -- "Sucesso da Tool" --> J("Atualizar ActivityContext com Resultado da Tool");
        H -- "Falha na Tool" --> H1{"Tratar Falha da Tool"};

        G1 -- "Tentar Alternativa/Reprocessar?" --> C;
        G1 -- "Erro Persistente" --> Y;
        H1 -- "Tentar Alternativa/Reprocessar?" --> C;
        H1 -- "Erro Persistente" --> Y;

        I --> K{"Job Concluído (Auto-Validação OK)?"};
        J --> K;

        K -- Sim --> L["Registrar Aprendizado (Opcional, atualiza AgentInternalState)"];
        L --> M["Finalizar Job e Notificar Sistema de Fila"];
        K -- Não --> C;

        X --> M;
        Y --> M;
    ```
