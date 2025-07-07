# Requisitos do Sistema - Project Wiz

Este documento detalha os Requisitos Funcionais (RF) e Não Funcionais (RNF) para o Project Wiz, com base na documentação funcional consolidada em `docs/funcional/`.

## 1. Requisitos Funcionais (RF)

> **Nota Importante:** Vários requisitos funcionais detalhados abaixo, especialmente aqueles nas seções "Operação de Agentes IA" (RF-AGENT-OP) e "Ferramentas de Agente" (RF-TOOL), descrevem funcionalidades e componentes (como `GenericAgentExecutor`, `ActivityContext`, `ToolRegistry` e ferramentas específicas) cujo design detalhado e implementação ainda estão em fase de análise e pesquisa. Eles representam capacidades desejadas e propostas de design. O subsistema de Jobs/Filas/Workers é o componente central atualmente definido e em implementação, que servirá de base para a futura arquitetura de execução de agentes.

### RF-GERAL: Visão Geral e Interação Principal ([Introdução ao Project Wiz](../../user/01-introduction.md))
*   **RF-GERAL-001:** O sistema deve permitir que usuários interajam com Agentes IA (configurados por Personas) através de uma interface de chat.
*   **RF-GERAL-002:** Agentes IA devem ser capazes de analisar solicitações do usuário, elaborar planos de ação (Jobs/Sub-Jobs) e definir critérios de "Definição de Pronto" (`validationCriteria`).
*   **RF-GERAL-003:** O sistema deve permitir que Agentes IA apresentem planos ao usuário para aprovação antes da execução.
*   **RF-GERAL-004:** Agentes IA devem executar Jobs de forma autônoma usando LLMs e `Tools`.
*   **RF-GERAL-005:** Agentes IA devem operar dentro de uma `working_directory` de projeto para tarefas de código, utilizando branches Git.
*   **RF-GERAL-006:** Agentes IA devem realizar auto-validação dos resultados de suas atividades internas contra os `validationCriteria`.
*   **RF-GERAL-007:** O sistema deve permitir que usuários acompanhem o progresso de suas solicitações de alto nível (que podem envolver Jobs internos dos agentes) e recebam resultados.

### RF-PROJ: Gerenciamento de Projetos ([Core Concept: Gerenciando Projetos](../../user/core-concepts/projects.md))
*   **RF-PROJ-001:** O sistema deve permitir ao usuário criar novos projetos de software (com nome e descrição opcional).
*   **RF-PROJ-002:** Na criação de um projeto, o sistema (via `CreateProjectCommand` e seu handler) deve:
    *   Gerar um identificador único para o projeto.
    *   Criar uma estrutura de pastas base (ex: `<ProjectId>/source-code/`, `<ProjectId>/source-code/docs/`, `<ProjectId>/worktrees/`).
    *   Inicializar um repositório Git em `<ProjectId>/source-code/`.
    *   Persistir as informações do projeto e do código-fonte associado.
*   **RF-PROJ-003:** O sistema deve permitir a listagem e visualização dos projetos existentes e seus detalhes.
*   **RF-PROJ-004:** O projeto ativo deve fornecer contexto (working directory, Git repo) para os Agentes IA.
*   **RF-PROJ-005 (Futuro):** Agentes poderão interagir com metadados do projeto (issues internas, etc.) através de capacidades de agente específicas (conceito em pesquisa).

### RF-PERSONA: Gerenciamento de Personas e Agentes IA ([Core Concept: Personas Personalizadas e Agentes IA](../../user/core-concepts/personas-and-agents.md))
> (Nota: `AgentPersonaTemplate` neste contexto refere-se a uma especificação persistente de uma "Persona Personalizada" ou "Agente Configurado", que pode ser resultado de uma customização de um agente dinamicamente proposto ou criada diretamente pelo usuário.)
*   **RF-PERSONA-001:** O sistema deve permitir ao usuário definir/salvar configurações de Persona (`AgentPersonaTemplate`) especificando Nome, Papel (Role), Objetivo (Goal), Backstory e capacidades/acessos necessários.
*   **RF-PERSONA-002:** O sistema deve permitir a criação de instâncias de Agente executáveis, vinculando uma configuração de Persona a uma configuração de provedor LLM e temperatura.
*   **RF-PERSONA-003:** O sistema deve persistir as configurações de Persona e as informações do Agente.
*   **RF-PERSONA-004:** A UI deve permitir listar e selecionar `AgentPersonaTemplate`.
*   **RF-PERSONA-005:** Cada Agente deve poder ter um estado interno persistente para aprendizado e continuidade.
*   **RF-PERSONA-006:** O sistema deve suportar um estado de execução para informações transitórias de um Agente em execução.
*   **RF-PERSONA-007:** O sistema deve suportar a operação concorrente de múltiplos Agentes (via `WorkerService` por `role`).

### RF-AGENT-OP: Operação de Agentes IA ([Análise: Operação de Agentes IA](../analise-e-pesquisa/analise-operacao-agentes.md))
> (Nota: Os requisitos nesta seção descrevem funcionalidades propostas/em pesquisa para a execução interna do agente.)
*   **RF-AGENT-OP-001:** O sistema deveria usar o LLM configurado para analisar solicitações e o estado interno do Agente para contexto.
*   **RF-AGENT-OP-002:** O Agente (via `GenericAgentExecutor` e uma ferramenta de gerenciamento de tarefas proposta) deveria ser capaz de criar um Job principal e Sub-Jobs com dependências.
*   **RF-AGENT-OP-003:** O Agente (via LLM) deve definir `validationCriteria` para Jobs, armazenados no `ActivityContext`.
*   **RF-AGENT-OP-004:** O Agente (via LLM) deve poder apresentar planos ao usuário para aprovação via chat.
*   **RF-AGENT-OP-005:** O `GenericAgentExecutor` (conceito em pesquisa) deveria processar Jobs, usando LLM e um `ToolRegistry` (conceito em pesquisa) para acessar capacidades.
*   **RF-AGENT-OP-006:** Para tarefas de código, Agentes deveriam ter capacidades para interagir com Git e o sistema de arquivos na `working_directory` do projeto (ex: via ferramentas como `TerminalTool` e `FileSystemTool` propostas).
*   **RF-AGENT-OP-007:** O sistema deveria gerenciar um estado de job (contendo contexto da atividade, histórico de conversas e histórico de execução).
*   **RF-AGENT-OP-008:** O `GenericAgentExecutor` (conceito em pesquisa) deveria suportar estratégias de sumarização para `conversationHistory` longa.
*   **RF-AGENT-OP-009:** O `GenericAgentExecutor` (conceito em pesquisa) deveria suportar replanejamento em caso de erros.
*   **RF-AGENT-OP-010:** O Agente (via LLM) deveria realizar auto-validação contra `validationCriteria`.
*   **RF-AGENT-OP-011:** O Agente (via LLM e uma ferramenta de memória proposta) deveria poder atualizar seu conhecimento de longo prazo.
*   **RF-AGENT-OP-012:** O sistema deveria lidar com erros de ferramentas/capacidades e LLM. O sistema de Jobs (existente) suporta retentativas.

### RF-JOB: Sistema Interno de Jobs, Atividades e Fila
*   **RF-JOB-001:** O sistema deve usar um conceito de Job para representar unidades de trabalho internas dos agentes, com atributos como ID, papel do agente alvo, nome, payload, dados (para contexto da atividade), status, prioridade, dependências de Jobs, Job pai, política de retentativa, timestamps e resultado.
*   **RF-JOB-002:** Agentes (internamente) devem ser capazes de criar Jobs para si (Sub-Jobs), potencialmente através de uma capacidade de gerenciamento de tarefas (conceito que usa internamente algo como um `CreateJobCommand`).
*   **RF-JOB-003:** O sistema deve suportar filas implícitas por `targetAgentRole`.
*   **RF-JOB-004:** Jobs devem transitar por um ciclo de vida (estados como PENDENTE, ATIVO, CONCLUÍDO, FALHO, ATRASADO, ESPERANDO).
*   **RF-JOB-005:** Um serviço de worker (configurado por papel) deve buscar Jobs e entregá-los para processamento.
*   **RF-JOB-006:** O sistema deve suportar priorização de Jobs (via atributo `priority` no `Job` e lógica no `IJobRepository`).
*   **RF-JOB-007:** O sistema deve respeitar dependências entre Jobs (`dependsOnJobIds`). A lógica de verificação deve estar no `IJobRepository` ou serviço de processamento.
*   **RF-JOB-008:** O sistema deve implementar um mecanismo de retentativa para Jobs falhos (gerenciado pelo serviço de worker).
*   **RF-JOB-009:** Jobs devem poder ser explicitamente atrasados (`executeAfter` timestamp, status `DELAYED`).
*   **RF-JOB-010:** Todos os dados de Jobs devem ser persistidos em SQLite via Drizzle ORM.
*   **RF-JOB-011:** A UI deve permitir o monitoramento básico do status das atividades dos agentes ou do progresso das solicitações do usuário (que podem corresponder a Jobs internos dos agentes).

### RF-LLM: Integração com LLM ([LLM Integration](./04-llm-integration.md))
*   **RF-LLM-001:** O sistema deve permitir a configuração de múltiplos provedores de LLM (com informações de configuração e um comando para criação).
*   **RF-LLM-002:** Uma instância de Agente deve vincular uma configuração de Persona a uma configuração de provedor LLM.
*   **RF-LLM-003:** O sistema deve usar o LLM configurado para o Agente para todas as operações de IA.
*   **RF-LLM-004:** Interações com IA devem ser contextualizadas (prompt de sistema da Persona, histórico de conversas da atividade, descrição das Ferramentas). Agentes podem usar uma ferramenta de memória para buscar contexto adicional do seu estado interno.
*   **RF-LLM-005:** O LLM, através do sistema, deveria poder solicitar a execução de capacidades/ferramentas registradas.
*   **RF-LLM-006:** O sistema deve usar `ai-sdk` para abstrair a comunicação com diferentes APIs de LLM.

### RF-TOOL: Ferramentas de Agente ([Análise: Ferramentas de Agente](../analise-e-pesquisa/analise-ferramentas-agente.md))
> (Nota: Os requisitos nesta seção descrevem um framework de ferramentas proposto e exemplos de ferramentas que estão em pesquisa.)
*   **RF-TOOL-001:** O sistema deveria fornecer um registro de Ferramentas (conceito em pesquisa) para registrar e executar capacidades de agente.
*   **RF-TOOL-002:** Cada capacidade de agente deveria ter nome, descrição, parâmetros (schema Zod) e um método de execução.
*   **RF-TOOL-003 (Implícito):** Comunicação Agente-Usuário via chat da UI.
*   **RF-TOOL-004 (Terminal Proposta):** Deveria existir uma capacidade tipo `TerminalTool` (`terminal.executeCommand`) para executar comandos de shell.
*   **RF-TOOL-005 (FileSystem Proposta):** Deveria existir uma capacidade tipo `FileSystemTool` para manipulação de arquivos.
*   **RF-TOOL-006 (Annotation Proposta):** Deveria existir uma capacidade tipo `AnnotationTool` para gerenciamento de anotações.
*   **RF-TOOL-007 (Memory Proposta):** Deveria existir uma capacidade tipo `MemoryTool` para persistência e recuperação de conhecimento.
*   **RF-TOOL-008 (TaskManager Proposta):** Deveria existir uma capacidade tipo `TaskManagerTool` para agentes gerenciarem Jobs.
*   **RF-TOOL-009 (Futuro):** Uma capacidade tipo `ProjectDataTool` para interação com metadados internos do Project Wiz.
*   **RF-TOOL-010 (Futuro):** Uma capacidade tipo `SendMessageToAgentTool` para comunicação inter-agente.

### RF-UI: Interface de Usuário e UX ([Visão Geral da Interface do Usuário](../../user/03-interface-overview.md))
*   **RF-UI-001:** O sistema deve ser uma aplicação desktop Electron com UI React.
*   **RF-UI-002:** Interação primária com Agentes via interface de chat (`ChatThread`).
*   **RF-UI-003:** Chat deve suportar renderização Markdown (`MarkdownRenderer`).
*   **RF-UI-004:** UI para listar, criar e visualizar detalhes de Projetos.
*   **RF-UI-005:** UI para listar e selecionar configurações de Persona (configurações de persona salvas pelo usuário).
*   **RF-UI-006:** UI para configurar provedores de LLM.
*   **RF-UI-007:** UI para acompanhar status/progresso das atividades dos agentes ou solicitações do usuário.
*   **RF-UI-008:** Layout inspirado no Discord (Sidebars, área de conteúdo principal).
*   **RF-UI-009:** Suporte a temas claro/escuro.
*   **RF-UI-010:** Suporte à autenticação de usuário.
*   **RF-UI-011:** Suporte à internacionalização (i18n com LinguiJS).

## 2. Requisitos Não Funcionais (RNF)

*   **RNF-COD-001 (Qualidade de Código):** Todo o novo código deve ser escrito em TypeScript.
*   **RNF-COD-002 (Object Calisthenics):** Todo o novo código deve aderir estritamente às 9 regras do Object Calisthenics (ADR-006).
*   **RNF-COD-003 (Manutenibilidade):** A arquitetura deve ser modular (Clean Architecture) e em camadas para facilitar a manutenção e evolução. Utilizar Injeção de Dependência (InversifyJS) no backend.
*   **RNF-COD-004 (Testabilidade):** O código deve ser altamente testável. Cobertura de testes unitários e de integração deve ser priorizada (Vitest).
*   **RNF-SEC-001 (Segurança de Chaves):** Chaves de API de LLM e outras credenciais sensíveis devem ser armazenadas e gerenciadas de forma segura (ex: variáveis de ambiente, não hardcoded).
*   **RNF-SEC-002 (Segurança de Terminal Proposta):** Uma eventual Ferramenta de Terminal (proposta) deve ter considerações de segurança para prevenir abusos (ex: logging, operar dentro do diretório de trabalho do projeto, sandboxing se possível).
*   **RNF-SEC-003 (Segurança de Chat):** Conteúdo Markdown no chat deve ser sanitizado para prevenir XSS.
*   **RNF-USA-001 (Usabilidade):** A interface do usuário deve ser intuitiva e fácil de usar.
*   **RNF-USA-002 (Feedback ao Usuário):** O sistema deve fornecer feedback claro e constante ao usuário.
*   **RNF-PER-001 (Performance da UI):** A interface do usuário deve ser responsiva e fluida.
*   **RNF-PER-002 (Performance do Backend):** O processamento de Jobs e as interações com LLM devem ser eficientes. O sistema de filas e workers deve ser capaz de lidar com carga de trabalho razoável para uma aplicação desktop.
*   **RNF-EXT-001 (Extensibilidade de Capacidades de Agente):** O framework para capacidades de agente (atualmente em pesquisa sob o conceito de `Tools`) deve facilitar a adição de novas capacidades.
*   **RNF-EXT-002 (Extensibilidade de Personas):** A configuração de `AgentPersonaTemplate` (especificações de persona salvas/customizadas) deve ser flexível.
*   **RNF-I18N-001 (Internacionalização):** A UI deve suportar internacionalização (LinguiJS confirmado).
*   **RNF-REL-001 (Confiabilidade da Fila):** O sistema de Jobs e Filas deve ser confiável, com persistência de estado em SQLite.
*   **RNF-CMP-001 (Compatibilidade Visual):** A nova implementação do frontend deve ser visualmente idêntica à pré-implementação, conforme o [Guia de Estilo Visual](../../developer/04-visual-style-guide.md).
*   **RNF-TEC-001 (Manutenção Tecnológica):** As tecnologias definidas no `package.json` são mandatórias e devem ser mantidas.

Estes requisitos servirão como base para o desenvolvimento e validação da nova implementação do Project Wiz.
