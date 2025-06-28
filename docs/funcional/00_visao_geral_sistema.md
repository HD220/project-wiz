# Visão Geral do Sistema Project Wiz

## Propósito Principal

O Project Wiz visa transformar o ciclo de vida do desenvolvimento de software através da colaboração inteligente entre usuários humanos e Agentes de IA autônomos. Estes Agentes são configurados através de "Personas" (modelos de perfil) e operam utilizando um motor de execução central (`GenericAgentExecutor`). O sistema funciona como uma "fábrica de software pessoal e inteligente" em uma aplicação desktop.

## Interação Principal do Usuário

1.  **Conversa e Delegação:** O usuário interage com um Agente IA (instância de uma Persona configurada) através de uma interface de chat, descrevendo uma necessidade ou objetivo no contexto de um projeto.
2.  **Planejamento pelo Agente:** O Agente, via `GenericAgentExecutor` e seu LLM, analisa o pedido, elabora um plano de ação (que pode incluir a decomposição da tarefa em Jobs e Sub-Jobs) e define critérios de "Definição de Pronto" (conceitualmente, armazenados como `validationCriteria` no `ActivityContext` do Job).
3.  **Aprovação do Usuário (Ponto de Verificação):** O Agente pode ser instruído (via prompt) a apresentar o plano e a "Definição de Pronto" ao usuário para aprovação antes de iniciar o trabalho principal.
4.  **Execução Autônoma:** Após a aprovação (ou se não requerida), o `GenericAgentExecutor` processa os Jobs e Sub-Jobs. O Agente utiliza sua inteligência (LLM) e Ferramentas (`Tools` disponíveis em um `ToolRegistry`) para executar as etapas. Para tarefas de código, o Agente opera dentro de uma `working_directory` do projeto, geralmente em um branch Git específico, utilizando `Tools` como `FileSystemTool` e `TerminalTool`.
5.  **Auto-Validação:** O Agente realiza uma auto-validação interna, comparando os resultados com os `validationCriteria` do `ActivityContext`, para garantir que os resultados atendam à "Definição de Pronto". Este é um processo orientado pelo LLM.
6.  **Acompanhamento e Entrega:** O usuário acompanha o progresso dos Jobs e recebe o resultado final (ex: um novo branch Git com o código modificado, um relatório, etc.), podendo continuar a interação para feedback ou ajustes.

## Principais Capacidades Funcionais (Resumo)

*   **Gerenciamento de Projetos:** Criação e organização de projetos de software, incluindo inicialização de estrutura de pastas e repositório Git.
*   **Gerenciamento de Personas e Agentes IA:**
    *   Definição de `AgentPersonaTemplate` (templates de Personas) com papel, objetivo, backstory e ferramentas permitidas.
    *   Criação de instâncias de Agentes, vinculando uma Persona a uma configuração de LLM.
    *   Manutenção do `AgentInternalState` (memória de longo prazo do agente).
*   **Operação Autônoma de Agentes (`GenericAgentExecutor`):**
    *   Planejamento iterativo e execução de tarefas (Jobs).
    *   Gerenciamento de `ActivityContext` (memória de curto prazo por Job, incluindo histórico de interações com LLM/Tools).
    *   Capacidade de sumarização de histórico de conversas longas e replanejamento em caso de erros.
*   **Sistema de Jobs e Filas:**
    *   Gerenciamento robusto de tarefas (`Job` entidade), suas dependências, prioridades e ciclo de vida.
    *   Persistência em SQLite via Drizzle ORM.
*   **Integração com LLMs:** Utilização flexível de Modelos de Linguagem Grandes (configuráveis por Agente) para inteligência dos Agentes, abstraída por SDKs como `ai-sdk`.
*   **Ferramentas de Agente Extensíveis:** Um conjunto de `Tools` (ex: `FileSystemTool`, `TerminalTool`, `MemoryTool`, `AnnotationTool`, `TaskManagerTool`) que os Agentes podem usar para interagir com o ambiente.
*   **Interface de Usuário Intuitiva:** Uma aplicação desktop (Electron) com UI baseada em React para facilitar todas as interações, incluindo chat, gerenciamento de projetos, personas e jobs.

Este documento serve como ponto de partida. Os documentos subsequentes nesta pasta detalham cada uma dessas áreas funcionais.
