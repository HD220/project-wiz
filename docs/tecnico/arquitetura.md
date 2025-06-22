# Arquitetura de Software - Project Wiz

Este documento descreve a arquitetura de software para o Project Wiz. A arquitetura é projetada para ser robusta, escalável, manutenível e testável, aderindo às melhores práticas modernas e aos requisitos específicos do projeto.

## 1. Princípios Arquiteturais Fundamentais

*   **Clean Architecture:** O sistema segue estritamente os princípios da Clean Architecture. Isso organiza a base de código em camadas concêntricas (Domínio, Aplicação, Infraestrutura), com as dependências fluindo para dentro. Isso garante que a lógica de negócios principal seja independente de frameworks e tecnologias externas.
*   **Object Calisthenics:** Todas as nove regras do Object Calisthenics devem ser aplicadas compulsoriamente durante o desenvolvimento para promover um código orientado a objetos extremamente limpo, legível e manutenível.
*   **SOLID, DRY, KISS:** Princípios de design de software padrão como SOLID (Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion), DRY (Don't Repeat Yourself) e KISS (Keep It Simple, Stupid) devem ser seguidos.
*   **Modularidade e Separação de Preocupações:** Cada componente e camada tem responsabilidades bem definidas.

## 2. Tecnologias Chave

*   **Framework da Aplicação:** ElectronJS (para estrutura de aplicação desktop).
*   **Frontend:** React, TypeScript, Tailwind CSS (estilização), Vite (bundler).
    *   **Roteamento:** TanStack Router (`@tanstack/react-router`).
    *   **Internacionalização (i18n):** LinguiJS (`@lingui/*`).
    *   **Componentes de UI:** Uso extensivo de primitivas Radix UI (`@radix-ui/*`), ícones de Lucide React (`lucide-react`), notificações por Sonner (`sonner`), e gráficos por Recharts (`recharts`).
    *   **Manuseio de Formulários:** React Hook Form (`react-hook-form`) com Zod para validação (`@hookform/resolvers` e `zod`).
*   **Backend/Lógica Principal:** TypeScript, Node.js.
    *   **Injeção de Dependência (DI):** InversifyJS (`inversify`, `reflect-metadata`) é usado para gerenciar dependências, particularmente nos serviços de backend.
*   **Integração IA/LLM:** AI SDK (`ai` library) para interagir com Modelos de Linguagem Grandes (ex: OpenAI via `@ai-sdk/openai`, DeepSeek via `@ai-sdk/deepseek`).
*   **Banco de Dados/Persistência:** SQLite (via `better-sqlite3`) com Drizzle ORM (`drizzle-orm`, `drizzle-kit`).
*   **API/Ferramentas Adicionais:** Octokit (`octokit`) pode ser usado para interações com GitHub.

## 3. Camadas Arquiteturais (Clean Architecture)

### 3.1. Camada de Domínio (Core)
*   **Propósito:** Contém a lógica e as políticas de negócios de toda a empresa. É a camada mais independente.
*   **Componentes Chave:**
    *   **Entidades:** Objetos que representam conceitos de negócios centrais, possuindo uma identidade e um ciclo de vida (ex: `Job`, `AgentInternalState`, `Project`, `LLMProviderConfig`, `User`, `Worker`). Encapsulam atributos e regras de validação intrínsecas. Aderência ao Object Calisthenics significa que as entidades serão pequenas e focadas.
    *   **Value Objects (VOs):** Objetos imutáveis que representam aspectos descritivos do domínio sem uma identidade conceitual (ex: `JobId`, `JobStatus`, `ActivityContext` e seus componentes como `ActivityHistory`, `ProjectName`, `AgentId`, `PersonaRole`). Lidam com a validação de seus valores específicos.
    *   **Eventos de Domínio (Opcional/Futuro):** Podem ser usados para sinalizar ocorrências significativas dentro do domínio.
    *   **Interfaces de Repositório:** Definem contratos para persistência de dados, implementados pela camada de Infraestrutura. São definidos em termos de objetos de domínio (ex: `IJobRepository`, `IAgentRepository`, `IPersonaRepository`, `IProjectRepository`).

### 3.2. Camada de Aplicação (Casos de Uso)
*   **Propósito:** Contém a lógica de negócios específica da aplicação. Orquestra o fluxo de dados de e para a camada de Domínio e direciona as entidades de Domínio para executar sua lógica.
*   **Componentes Chave:**
    *   **Casos de Uso (Interactors):** Implementam operações específicas da aplicação ou histórias de usuário (ex: `CreateProjectUseCase`, `CreatePersonaUseCase`, `CreateJobUseCase`, `CreateAgentUseCase`, `ProcessJobUseCase`). Coordenam a recuperação e modificação de entidades de domínio através de interfaces de repositório.
    *   **Serviços de Aplicação:** Coordenam tarefas e operações, frequentemente encapsulando lógica que não se encaixa perfeitamente em um único caso de uso ou envolve múltiplas entidades de domínio (ex: `GenericAgentExecutor` como implementação de `IAgentExecutor`, `WorkerService`).
    *   **Portas (Interfaces para Infraestrutura):** Definem interfaces para comunicação de saída com a camada de Infraestrutura (ex: `IJobQueue`, `IFileSystem`, `IVersionControlSystem`, `ILLM` interface, `IAgentTool` interface).
    *   **Data Transfer Objects (DTOs) / Schemas de Entrada:** Schemas Zod são usados para validação de entrada para casos de uso.
    *   **Fábricas:** Responsáveis pela criação de objetos complexos, garantindo que sejam instanciados corretamente (ex: `TaskFactoryImpl` para criar instâncias de `ITask`).

### 3.3. Camada de Infraestrutura (Preocupações Externas)
*   **Propósito:** Contém todos os detalhes externos à aplicação, como UI, acesso ao banco de dados, integrações de API externas e código específico do framework.
*   **Componentes Chave:**
    *   **Implementações de Persistência:** Implementações concretas de Interfaces de Repositório usando Drizzle ORM e SQLite (ex: `DrizzleJobRepository`, `DrizzleAgentRepository`, `FileSystemAgentPersonaTemplateRepository`).
    *   **Implementações de Fila:** Implementação concreta da interface `IJobQueue` (ex: `SqliteJobQueue` que opera sobre o `IJobRepository`).
    *   **Implementações de Worker Pool:** Implementação concreta de gerenciamento de workers (ex: `ChildProcessWorkerPoolService` usando processos filhos Node.js, com `job-processor.worker.ts` como ponto de entrada do worker).
    *   **Adaptadores de Ferramentas (`IAgentTool`):** Implementações concretas de interfaces `IAgentTool` (ex: `FileSystemTool`, `TerminalTool`, `MemoryTool`, `AnnotationTool`, `TaskTool`). Adaptam tecnologias ou bibliotecas específicas à interface genérica de ferramenta usada pela camada de Aplicação.
    *   **Adaptadores LLM:** Implementações concretas da interface `ILLM` usando o AI SDK (ex: `IPCLLMAdapter` para workers, ou uma implementação direta em `AgentServiceImpl`).
    *   **Processo Principal Electron & IPC:**
        *   O processo principal do Electron lida com gerenciamento de janelas, ciclo de vida da aplicação e interações nativas do SO.
        *   Manipuladores de Comunicação Entre Processos (IPC) no processo principal (definidos usando `ipcMain` do Electron) recebem requisições do processo Renderer (UI) e delegam para casos de uso/serviços da camada de Aplicação, frequentemente resolvidos via InversifyJS.
    *   **UI (Frontend - React):**
        *   Construída com React, TypeScript e Vite.
        *   Componentes interagem com o backend via chamadas IPC.
        *   Estilização gerenciada por Tailwind CSS, seguindo o `guia_de_estilo_visual.md`.
    *   **Integrações de Serviços Externos:** Quaisquer outras interações com APIs de terceiros.
    *   **`ToolRegistry`**: Singleton que armazena e fornece instâncias de `IAgentTool`.

## 4. Padrões de Design e Conceitos Chave

*   **Repositório:** Desacopla a lógica de domínio e aplicação dos mecanismos de persistência de dados.
*   **Camada de Serviço:** Encapsula a lógica da aplicação não pertencente a entidades específicas.
*   **Fábrica:** Usado para criar instâncias de objetos complexos.
*   **Value Objects:** Reforçam a validade e imutabilidade para aspectos descritivos do domínio.
*   **Entidades:** Modelam conceitos centrais do domínio com identidade.
*   **Casos de Uso/Interactors:** Definem operações específicas da aplicação.
*   **Injeção de Dependência (DI):** InversifyJS é usado para gerenciar dependências.
*   **Processamento Assíncrono (Jobs & Fila):**
    *   **Jobs/Activities:** Entidade `Job` representa unidades de trabalho.
    *   **Fila (`IJobQueue` / `SqliteJobQueue`):** Gerencia o ciclo de vida dos Jobs.
    *   **Workers (`WorkerService`, `job-processor.worker.ts`):** Processos que pegam Jobs da Fila. O `WorkerService` (domínio) usa um `IAgentExecutor`. O `job-processor.worker.ts` (infra) é um worker de processo filho que usa serviços baseados em IPC.
    *   **Agentes (`GenericAgentExecutor`):** As entidades inteligentes (configuradas por `AgentPersonaTemplate` e instanciadas como `Agent`) que realizam o trabalho de um Job.
    *   **Ferramentas (`IAgentTool`):** Capacidades usadas por Agentes para interagir com o ambiente.

## 5. Fluxo de Dados Exemplo (Simplificado: Criação e Processamento de um Job)

1.  **UI/Gatilho Externo:** Ação do usuário na UI React (Infraestrutura) inicia uma requisição.
2.  **IPC:** Requisição é enviada ao Processo Principal Electron via IPC (Infraestrutura).
3.  **Manipulador IPC (Processo Principal - Infraestrutura):** Recebe a requisição. Resolve o Caso de Uso apropriado da camada de Aplicação (ex: `CreateJobUseCase`) usando o container DI (InversifyJS).
4.  **Caso de Uso (`CreateJobUseCase` - Aplicação):**
    *   Valida a entrada.
    *   Cria uma entidade `Job` (Domínio).
    *   Usa `IJobRepository` (interface do Domínio, implementada na Infraestrutura) para persistir o `Job`.
    *   Usa `IJobQueue` (porta da Aplicação, implementada na Infraestrutura) para adicionar o `Job` à fila.
5.  **Worker (`WorkerService` - Domínio, ou `job-processor.worker.ts` - Infraestrutura):**
    *   Monitora a `IJobQueue`.
    *   Remove um `Job` pendente.
    *   Invoca o `GenericAgentExecutor` (serviço da Aplicação) com o `Job`.
6.  **Agente (`GenericAgentExecutor` - Aplicação):**
    *   Carrega o `AgentInternalState` (Domínio) via `IAgentRepository`.
    *   Usa LLM (via porta `ILLM`) com `AgentInternalState` e `Job.data.agentState.activityContext` (Domínio) para decidir a ação.
    *   Executa `IAgentTool`s (portas da Aplicação, implementadas na Infraestrutura).
    *   Atualiza `Job.data.agentState.activityContext` e determina se o Job está completo para este ciclo.
7.  **Worker & Fila:** Worker recebe resultado do Agente, notifica `IJobQueue` para atualizar o status do Job (ex: finalizado, falhou, atrasado).

Esta arquitetura promove uma clara separação de preocupações, tornando o sistema mais fácil de desenvolver, testar e manter, enquanto adere aos padrões de qualidade do projeto.
