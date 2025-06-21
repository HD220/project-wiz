# Requisitos Funcionais e Não Funcionais - Project Wiz

Este documento formaliza os Requisitos Funcionais (RF) e Não Funcionais (RNF) para o Project Wiz, com base na documentação funcional consolidada.

## 1. Requisitos Funcionais (RF)

### RF-PROJ: Gerenciamento de Projetos
*   **RF-PROJ-001:** O sistema deve permitir ao usuário criar novos projetos de software.
*   **RF-PROJ-002:** Ao criar um novo projeto, o sistema deve inicializar uma estrutura de pastas padrão (ex: `source-code/`, `docs/`, `worktrees/`).
*   **RF-PROJ-003:** Ao criar um novo projeto, o sistema deve inicializar um repositório Git na raiz do projeto.
*   **RF-PROJ-004:** O sistema deve permitir ao usuário configurar parâmetros específicos do projeto, incluindo seu `caminho_working_directory` principal.
*   **RF-PROJ-005:** O sistema deve permitir ao usuário listar e visualizar os projetos existentes.
*   **RF-PROJ-006:** O sistema deve fornecer o contexto do projeto ativo (working directory, Git repo) para os Agentes IA.

### RF-PRS: Gerenciamento de Personas (Agentes IA)
*   **RF-PRS-001:** O sistema deve permitir ao usuário criar novas Personas (configurações de Agente IA).
*   **RF-PRS-002:** A definição de uma Persona deve incluir: Nome, Papel (Role), Objetivo (Goal) e Backstory/Contexto.
*   **RF-PRS-003:** O sistema deve persistir as configurações das Personas.
*   **RF-PRS-004:** O sistema deve permitir ao usuário associar um modelo de LLM específico (dentre os configurados) a uma Persona.
*   **RF-PRS-005:** O sistema deve permitir ao usuário definir quais Ferramentas (`Tools`) uma Persona pode utilizar.
*   **RF-PRS-006:** O sistema deve permitir ao usuário listar, visualizar e editar Personas existentes.
*   **RF-PRS-007:** Cada Agente IA deve manter um `AgentInternalState` persistente para aprendizado e continuidade.
*   **RF-PRS-008:** O sistema deve suportar a operação concorrente de múltiplos Agentes IA (Worker Pool).
*   **RF-PRS-009:** O sistema pode manter um `AgentRuntimeState` para informações transitórias de um Agente em execução.

### RF-AGENT: Operação de Agentes IA
*   **RF-AGENT-001:** Um Agente IA deve ser capaz de analisar solicitações do usuário (via chat) utilizando seu LLM configurado e `AgentInternalState`.
*   **RF-AGENT-002:** Um Agente IA deve ser capaz de formular um Job principal para si mesmo com base na análise da solicitação do usuário.
*   **RF-AGENT-003:** Um Agente IA deve ser capaz de definir critérios de validação ("Definição de Pronto" ou `validationCriteria`) para seus Jobs.
*   **RF-AGENT-004:** Um Agente IA, utilizando seu LLM, deve ser capaz de decompor um Job principal em Sub-Jobs menores com dependências.
*   **RF-AGENT-005:** Um Agente IA deve ser capaz de apresentar seu plano de Jobs/Sub-Jobs e a "Definição de Pronto" ao usuário para aprovação.
*   **RF-AGENT-006:** Um Agente IA deve ser capaz de executar Jobs e Sub-Jobs de sua fila, utilizando seu LLM e `Tools` habilitadas.
*   **RF-AGENT-007:** Um Agente IA deve operar em um branch Git específico dentro da `working_directory` do projeto para tarefas de código.
*   **RF-AGENT-008:** Cada Job processado por um Agente IA deve ter um `ActivityContext` para armazenar o histórico da tarefa, notas, e resultados parciais.
*   **RF-AGENT-009:** Um Agente IA deve ser capaz de realizar auto-validação dos resultados de um Job contra os `validationCriteria` definidos.
*   **RF-AGENT-010:** Um Agente IA deve ser capaz de atualizar seu `AgentInternalState` com aprendizados do `ActivityContext` de Jobs concluídos.
*   **RF-AGENT-011:** Um Agente IA deve ser capaz de lidar com erros durante a execução de `Tools` ou interações com LLM, e utilizar o mecanismo de retentativa de Jobs quando apropriado.
*   **RF-AGENT-012:** Em caso de falhas persistentes, um Agente IA deve ser capaz de pausar o Job e solicitar intervenção do usuário.

### RF-JOB: Sistema de Jobs e Filas
*   **RF-JOB-001:** O sistema deve permitir a definição de Jobs com atributos como ID, `queueName`, `jobName`, `payload`, `status`, `priority`, `dependsOnJobIds`, `parentJobId`, opções de retentativa, timestamps, resultado e `ActivityContext`.
*   **RF-JOB-002:** Agentes IA devem poder criar e enfileirar Jobs em suas filas nomeadas (`queueName`) dedicadas.
*   **RF-JOB-003:** O sistema deve suportar múltiplas filas nomeadas, uma para cada Agente/Persona.
*   **RF-JOB-004:** Jobs devem transitar por um ciclo de vida definido (ex: `pending`, `active`, `completed`, `failed`, `delayed`, `waiting`, `waiting_children`).
*   **RF-JOB-005:** Agentes (atuando como Workers) devem processar Jobs de suas filas. Um `JobProcessor` (lógica do Agente) deve executar a lógica específica do `jobName`.
*   **RF-JOB-006:** O sistema deve suportar priorização de Jobs dentro de uma fila.
*   **RF-JOB-007:** O sistema deve respeitar dependências entre Jobs (`dependsOnJobIds`). Um Job não deve iniciar até que suas dependências estejam `completed`.
*   **RF-JOB-008:** Um Job pai deve poder aguardar a conclusão de seus Sub-Jobs (estado `waiting_children`).
*   **RF-JOB-009:** O sistema deve implementar um mecanismo de retentativa para Jobs falhos, com configuração de máximo de tentativas e backoff.
*   **RF-JOB-010:** Jobs devem poder ser explicitamente atrasados (estado `delayed`) para execução futura.
*   **RF-JOB-011:** Todos os dados de Jobs e seus `ActivityContexts` devem ser persistidos em SQLite via Drizzle ORM.
*   **RF-JOB-012:** O sistema deve permitir o monitoramento básico do status dos Jobs e desempenho das filas.
*   **RF-JOB-013:** Filas de Agentes podem ter opções padrão de Job (`defaultJobOptions`), que podem ser sobrescritas por opções específicas de um Job.

### RF-LLM: Integração com LLM
*   **RF-LLM-001:** O sistema deve permitir ao usuário configurar múltiplos provedores de LLM (ex: OpenAI, DeepSeek) com suas respectivas chaves de API.
*   **RF-LLM-002:** Ao definir uma Persona, o usuário deve poder associar um modelo de LLM específico a ela.
*   **RF-LLM-003:** Agentes IA devem usar o LLM configurado para raciocínio, planejamento, tomada de decisão, geração de conteúdo e análise de informações.
*   **RF-LLM-004:** Interações com LLM devem ser contextualizadas usando o prompt de sistema da Persona, o `ActivityContext` do Job e, se relevante, o `AgentInternalState`.
*   **RF-LLM-005:** O LLM deve ser informado sobre as `Tools` disponíveis para o Agente e ser capaz de solicitar sua execução.
*   **RF-LLM-006:** O sistema deve usar um AI SDK (ou similar) para abstrair a comunicação com diferentes APIs de LLM.

### RF-TOOL: Ferramentas de Agente
*   **RF-TOOL-001:** O sistema deve fornecer um framework para registrar e executar `Tools` para Agentes.
*   **RF-TOOL-002:** Cada `Tool` deve ter uma descrição clara de sua funcionalidade, parâmetros e formato de saída para o LLM.
*   **RF-TOOL-003:** O sistema deve fornecer uma `Tool` de Comunicação implícita ou explícita para Agentes enviarem mensagens ao usuário.
*   **RF-TOOL-004:** O sistema deve fornecer uma `TerminalTool` (ou `ExecuteCommandTool`) para Agentes executarem comandos de shell (incluindo operações Git).
*   **RF-TOOL-005:** O sistema deve fornecer `FilesystemTools` para Agentes lerem arquivos e listarem diretórios. (Capacidades de escrita e outras manipulações são desejáveis e a serem confirmadas no código da tool).
*   **RF-TOOL-006:** O sistema deve fornecer uma `AnnotationTool` para gerenciamento estruturado de anotações pelos Agentes.
*   **RF-TOOL-007:** O sistema deve fornecer uma `MemoryTool` para armazenamento e recuperação persistente de informações pelos Agentes, incluindo busca semântica.
*   **RF-TOOL-008 (Intenção Futura):** O sistema poderá fornecer uma `ProjectDataTool` para Agentes interagirem com metadados internos do Project Wiz.
*   **RF-TOOL-009 (Intenção Futura):** O sistema poderá fornecer uma `TaskTool` para Agentes gerenciarem mais diretamente sua própria fila de Jobs.

### RF-UI: Interface de Usuário e UX
*   **RF-UI-001:** O sistema deve ser uma aplicação desktop Electron.
*   **RF-UI-002:** A interação primária do usuário com Personas deve ser via interface de chat.
*   **RF-UI-003:** O chat deve suportar renderização de mensagens em Markdown.
*   **RF-UI-004:** A UI deve permitir listar, criar e visualizar detalhes de Projetos.
*   **RF-UI-005:** A UI deve permitir listar, criar e configurar Personas.
*   **RF-UI-006:** A UI deve permitir configurar provedores de LLM.
*   **RF-UI-007:** A UI deve permitir ao usuário acompanhar o status e progresso de Jobs/Atividades.
*   **RF-UI-008:** A UI deve ter um layout inspirado no Discord, com sidebars para navegação e uma área de conteúdo principal.
*   **RF-UI-009:** A UI deve suportar temas claro e escuro.
*   **RF-UI-010 (Implícito):** A UI deve permitir autenticação de usuário (login/registro).

## 2. Requisitos Não Funcionais (RNF)

*   **RNF-COD-001 (Qualidade de Código):** Todo o novo código deve ser escrito em TypeScript.
*   **RNF-COD-002 (Object Calisthenics):** Todo o novo código deve aderir estritamente às 9 regras do Object Calisthenics.
*   **RNF-COD-003 (Manutenibilidade):** A arquitetura deve ser modular e em camadas para facilitar a manutenção e evolução. Utilizar Injeção de Dependência no backend.
*   **RNF-COD-004 (Testabilidade):** O código deve ser altamente testável. Cobertura de testes unitários e de integração deve ser priorizada (Vitest).
*   **RNF-SEC-001 (Segurança de Chaves):** Chaves de API de LLM e outras credenciais sensíveis devem ser armazenadas e gerenciadas de forma segura.
*   **RNF-SEC-002 (Segurança de Terminal):** A execução de comandos via `TerminalTool` deve ter considerações de segurança para prevenir abusos (ex: logging, restrições configuráveis, ou confirmação do usuário para comandos sensíveis).
*   **RNF-SEC-003 (Segurança de Chat):** Conteúdo Markdown no chat deve ser sanitizado para prevenir XSS.
*   **RNF-USA-001 (Usabilidade):** A interface do usuário deve ser intuitiva e fácil de usar, seguindo o paradigma inspirado no Discord.
*   **RNF-USA-002 (Feedback ao Usuário):** O sistema deve fornecer feedback claro e constante ao usuário sobre as ações dos Agentes e o status dos Jobs.
*   **RNF-PER-001 (Performance da UI):** A interface do usuário deve ser responsiva e fluida. A renderização de Markdown deve ser otimizada.
*   **RNF-PER-002 (Performance do Backend):** O processamento de Jobs e as interações com LLM devem ser eficientes para não bloquear excessivamente os Agentes ou o sistema. (Metas específicas de performance a serem definidas).
*   **RNF-EXT-001 (Extensibilidade de Tools):** O framework de `Tools` deve ser projetado para facilitar a adição de novas `Tools` customizadas.
*   **RNF-EXT-002 (Extensibilidade de Personas):** A configuração de Personas deve ser flexível para permitir diversos comportamentos de Agente.
*   **RNF-I18N-001 (Internacionalização):** A UI deve suportar internacionalização (LinguiJS).
*   **RNF-REL-001 (Confiabilidade da Fila):** O sistema de Jobs e Filas deve ser confiável, garantindo que Jobs não sejam perdidos e que o estado seja consistente, mesmo após reinícios da aplicação (devido à persistência em SQLite).
*   **RNF-CMP-001 (Compatibilidade Visual):** A nova implementação do frontend deve ser visualmente idêntica à pré-implementação, conforme o guia de estilo visual.

Estes requisitos servirão como base para o desenvolvimento e validação da nova implementação do Project Wiz.
