# 05: Camada de Infraestrutura

A camada de Infraestrutura contém todas as implementações concretas e detalhes tecnológicos do sistema. Ela depende da camada de Domínio (através da implementação de interfaces/ports definidas no domínio), mas o Domínio não depende dela. É onde o "mundo real" (frameworks, bancos de dados, APIs externas, UI) se conecta à lógica de negócios.

## 5.1. Persistência (`src/infrastructure/persistence/`)

Esta subcamada é responsável por toda a lógica de persistência de dados da aplicação.

### 5.1.1. Drizzle ORM e Configuração do Banco de Dados

*   **Banco de Dados:** Utilizaremos **SQLite** como sistema de gerenciamento de banco de dados, com os arquivos de banco de dados armazenados localmente.
*   **ORM:** **Drizzle ORM** será usado para interagir com o banco de dados SQLite, definir esquemas e realizar migrações.
    *   **`database.ts` (`src/infrastructure/persistence/database.ts`):** Contém a configuração da conexão com o banco de dados SQLite usando Drizzle.
    *   **`schema.ts` (`src/infrastructure/persistence/drizzle/schema.ts`):** Define as tabelas do banco de dados usando a sintaxe do Drizzle.
    *   **`migrations/` (`src/infrastructure/persistence/drizzle/migrations/`):** Diretório contendo os arquivos de migração gerados pelo Drizzle Kit para versionar as alterações no esquema do banco de dados.

### 5.1.2. Implementações de Repositório (`src/infrastructure/persistence/drizzle/repositories/`)

Este diretório contém as implementações concretas das interfaces de repositório definidas na camada de Domínio.
*   **`job.repository.ts`:** Contém a implementação `DrizzleJobRepository` da interface `IJobRepository`. Esta classe lida com todas as operações CRUD para a entidade `Job` e com a lógica de gerenciamento de estado da fila (incluindo locks, backoff, etc.) através do seu método `save`, conforme a interface definida em [`02-domain-layer.md#231-ijobrepository-interface-de-fila-e-persistência-de-jobs`](./02-domain-layer.md#231-ijobrepository-interface-de-fila-e-persistência-de-jobs).
*   **`ai-agent.repository.ts`:** Implementação `DrizzleAIAgentRepository` (ou similar) da interface `IAIAgentRepository` para persistir as configurações/perfis dos `AIAgent`s.
*   **Outros Repositórios:** Implementações para outras entidades de domínio (ex: `Project`) seguirão o mesmo padrão.

### 5.1.3. Mappers (Opcional) (`src/infrastructure/persistence/drizzle/mappers/`)

Se a estrutura das entidades de domínio divergir significativamente dos esquemas das tabelas do Drizzle, este diretório pode conter classes de mapeamento para converter entre os dois formatos.

### 5.1.4. Implementação do `QueueClient` (`src/infrastructure/persistence/queue/`)

*   **`queue.client.ts`:** Contém a implementação da classe `QueueClient` que implementa a interface `IQueueClient`. Esta classe atua como uma fachada para o `IJobRepository` para uma `queueName` específica, simplificando a API para os `Worker`s. Detalhes sobre o `QueueClient` e o subsistema de filas completo estão em [`03-queue-subsystem.md`](./03-queue-subsystem.md#323-queueclient-fachada-para-uma-fila-específica).

## 5.2. Interface do Usuário (UI) (`src/infrastructure/ui/react/`)

Esta subcamada contém toda a implementação da interface gráfica do usuário, utilizando React e TypeScript.
*   **`main.tsx`:** Ponto de entrada da aplicação React.
*   **`App.tsx`:** Componente raiz da aplicação, geralmente contendo o `RouterProvider` do TanStack Router e provedores de contexto globais.
*   **`pages/`:** Componentes React que representam as diferentes telas ou rotas principais da aplicação.
*   **`components/`:** Componentes React reutilizáveis, possivelmente subdivididos em `common/` (para componentes genéricos como `Button`, `Input`) e por feature (ex: `job/JobList.tsx`).
*   **`hooks/`:** Hooks React customizados para encapsular lógica de UI e efeitos colaterais.
*   **`services/`:** Serviços específicos da UI, como aqueles que encapsulam chamadas à API Electron (`window.api`) ou formatam dados para exibição.
*   **`contexts/`:** (Opcional) Contextos React para gerenciamento de estado global mais simples. Para estados mais complexos, bibliotecas como Zustand ou Jotai podem ser consideradas.
*   **`routes/`:** Configuração do TanStack Router, incluindo o arquivo `routeTree.gen.ts` gerado.
*   **`assets/`:** Arquivos estáticos como imagens, fontes, etc.
*   **`styles/`:** Estilos globais, configuração do TailwindCSS (se não estiver na raiz).
*   **Internacionalização (i18n):** Configuração e arquivos de tradução do LinguiJS.

## 5.3. Lógica Específica do Electron (`src/infrastructure/electron/`)

Esta subcamada gerencia o ciclo de vida da aplicação desktop Electron e a comunicação entre o processo principal e o processo de renderização (UI).
*   **`main.ts`:** Ponto de entrada do processo principal do Electron. Responsável por:
    *   Criar e gerenciar janelas (`BrowserWindow`).
    *   Inicializar o container de Injeção de Dependência (InversifyJS).
    *   Inicializar serviços de background, como o `AgentLifecycleService` que gerencia os `Worker`s e `QueueClient`s.
    *   Registrar os Handlers IPC.
*   **`preload.ts`:** Script que expõe funcionalidades do processo principal (via Handlers IPC) de forma segura para a UI React através do objeto `window.api`.
*   **`ipc-handlers/`:** Diretório contendo os manipuladores para os canais IPC (ex: `user.handlers.ts`, `project.handlers.ts`). Estes handlers obterão instâncias de Casos de Uso do container DI e executarão a lógica de negócios solicitada pela UI.

## 5.4. Clientes de Serviços Externos (`src/infrastructure/services/`)

Implementações concretas de interfaces definidas no domínio para interagir com APIs ou serviços de terceiros.
*   **`llm/`:**
    *   `deepseek.service.ts`: Implementação `DeepSeekLLMService` da interface `ILLMService` para interagir com a API do DeepSeek. Outros provedores de LLM teriam suas próprias implementações aqui.
*   **`embedding/`:** Serviços para geração de embeddings, se necessário.
*   **`logging/`:** Implementação de um `LoggerService` para logging estruturado.

## 5.5. Workers (`src/infrastructure/workers/`)

Implementações dos `Worker`s genéricos que processam jobs das filas.
*   **`generic.worker.ts` (ou `agent.worker.ts` se houver especializações, embora o objetivo seja genérico):** A classe `Worker` que é instanciada pelo `AgentLifecycleService`. Recebe um `IQueueClient` e uma função `jobProcessor`.
    *   **Definição Detalhada do Comportamento do Worker:** Veja [`03-queue-subsystem.md#324-worker-genérico-executor-de-jobs`](./03-queue-subsystem.md#324-worker-genérico-executor-de-jobs).

## 5.6. Configuração de Injeção de Dependência (`src/infrastructure/ioc/`)

Este diretório contém a configuração centralizada para o InversifyJS.
*   **`inversify.config.ts`:** Define o container DI e todos os bindings entre interfaces (abstrações) e suas implementações concretas, incluindo seus escopos (singleton, transient).
*   **`types.ts`:** Define os símbolos (identificadores de tipo) usados para a injeção de dependências (ex: `TYPES.IJobRepository`, `TYPES.IAIAgentExecutionService`).
*   **Detalhes da Configuração de DI:** Veja [`06-dependency-injection.md`](./06-dependency-injection.md).
```
