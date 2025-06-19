# Project Wiz: Visão Conceitual para Desenvolvedores

Este documento oferece uma visão geral do Project Wiz sob uma perspectiva mais técnica, focando na arquitetura conceitual, componentes chave, fluxos de trabalho e tecnologias envolvidas. O objetivo é fornecer um entendimento de como o sistema opera internamente em um nível conceitual.

## Arquitetura Geral e Filosofia

O Project Wiz é uma aplicação desktop **Electron**, onde o processo principal do Electron gerencia a lógica de backend (Agentes, Fila de Jobs, estado) e o processo de renderização é responsável pela interface do usuário (UI) construída em **React**. A comunicação entre frontend e backend ocorre via **IPC (Inter-Process Communication)** do Electron.

A filosofia central é a de uma "fábrica de software autônoma" onde **Agentes**, configurados por **Personas** (que modelam o prompt de sistema de um **LLM**), executam **Jobs** (tarefas). Os Agentes utilizam um conjunto de **Tools** (funcionalidades codificadas) para interagir com o ambiente e realizar ações. A maior parte da lógica de "como" um Job é feito é determinada pelo LLM em tempo de execução, orquestrando as Tools disponíveis para cumprir uma **Task** (objetivo/prompt).

## Componentes Chave do Backend (Conceitual)

*   **Persona Core Logic (Autonomous Agent):** Não é a Persona em si, mas a lógica que utiliza a configuração da Persona para instruir um LLM. Gerencia o ciclo de vida de um Job, interage com o LLM para planejamento e decisão, seleciona e dispara Tasks/Tools, e atualiza os contextos. Cada Agente opera em um loop `async/await` próprio, processando sua fila de Jobs sequencialmente. A concorrência no sistema advém de múltiplos Agentes distintos operando simultaneamente.
*   **Job/Activity Management System (Queue):** Inspirado no BullMQ e persistido em SQLite. Gerencia Jobs com status, dependências (`depends_on_job_ids`, `parent_job_id`), e prioridades (estas últimas influenciadas/gerenciadas pelo próprio Agente via Tools específicas). Suporta retentativas e agendamento.
*   **Worker & Worker Pool:** Um "Worker" representa o loop assíncrono de um Agente. O "Worker Pool" é o gerenciador desses Agentes ativos e concorrentes.
*   **Task Execution System:** Mecanismo pelo qual um Agente formula e envia uma `Task` (prompt/objetivo, possivelmente com dados de entrada) para o LLM.
*   **Tool Framework/Registry:** Coleção de `Tools` pré-desenvolvidas e versionadas, expostas ao LLM via AI SDK. Incluem desde manipulação de arquivos até comunicação inter-agente.
*   **LLM Integration Point:** Abstrai a comunicação com diferentes provedores de LLM (configuráveis pelo usuário), gerencia o histórico de conversas (`CoreMessages`) para os prompts, e aplica configurações específicas.
*   **State Management Subsystem (SQLite):**
    *   **`AgentInternalState`:** Persiste a memória de médio/longo prazo do Agente (conhecimentos acumulados, anotações promovidas, lista de seus Jobs).
    *   **`ActivityContext`:** Persiste o contexto da tarefa ativa (histórico de mensagens/ações, `validationCriteria` definidos pelo Agente, `validationResult`).

## Fluxo de Trabalho Principal (Job Lifecycle)

1.  O usuário (via UI) ou um Agente (internamente) cria um Job, definindo seu objetivo, dados, dependências e a Persona associada.
2.  O Job é enviado para a Fila (Queue) e persistido.
3.  Um Agente (Worker) com a Persona correspondente pega o Job da Fila (respeitando dependências e prioridades que o próprio Agente pode ter ajustado).
4.  O Agente carrega seu `AgentInternalState` e o `ActivityContext` do Job.
5.  O Agente formula uma `Task` (prompt) para o LLM, usando os contextos carregados e o objetivo do Job.
6.  O LLM processa a `Task` e pode optar por usar uma ou mais `Tools` disponíveis.
7.  As `Tools` executam ações no ambiente.
8.  O Agente atualiza o `ActivityContext` com os resultados e o histórico.
9.  O Agente pode definir `validationCriteria` (Definição de Pronto) para o Job e, antes de finalizar, realizar uma auto-validação (possivelmente uma sub-Task com o LLM). Se falhar, retorna ao passo 5 para replanejar/corrigir.
10. Opcionalmente, Agentes podem se comunicar com outros Agentes (usando Tools de mensagem), solicitando informações ou ações, o que pode levar o outro Agente a criar novos Jobs para si.
11. Ao concluir (com sucesso ou falha), o Agente atualiza o status do Job na Fila e notifica o frontend via IPC.

## Tecnologias Principais (Stack)

*   **Desktop:** Electron
*   **UI:** React, Tailwind CSS, shadcn/ui (ou inspiração similar com Radix UI)
*   **Build/Dev:** Vite
*   **Linguagem:** TypeScript
*   **ORM & Banco de Dados:** Drizzle ORM com SQLite
*   **Internacionalização:** LinguiJS
*   **Roteamento (Frontend):** TanStack Router
*   **Validação de Schema:** Zod
*   **Testes:** Vitest
*   **IA:** AI SDK (OpenAI, DeepSeek, etc.)

## Extensibilidade

*   **Novas Tools:** Podem ser desenvolvidas e registradas no `Tool Framework` para expandir as capacidades dos Agentes.
*   **Novas Personas:** Configurações de Persona podem ser criadas para direcionar o LLM a diferentes especialidades ou estilos de trabalho.
*   **Novas Tasks (Prompts):** A principal forma de customização é através da criação de Jobs com `Tasks` (prompts) bem elaboradas que instruem os Agentes a usar as `Tools` de maneiras novas e criativas.

Esta visão geral deve ajudar a entender a estrutura e o funcionamento conceitual do Project Wiz. O sistema é projetado para ser flexível, com grande parte da orquestração de tarefas delegada à inteligência do LLM configurado pela Persona e capacitado pelas Tools.
