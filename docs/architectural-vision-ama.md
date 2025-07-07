# Visão Arquitetural: Arquitetura de Módulos Adaptativos (AMA)

## 1. Introdução e Filosofia

Esta documentação descreve a visão arquitetural para a próxima evolução do Project Wiz. A **Arquitetura de Módulos Adaptativos (AMA)** é uma abordagem pragmática projetada para aumentar a velocidade de desenvolvimento, a manutenibilidade e a escalabilidade do projeto, com um foco intenso na Experiência do Desenvolvedor (Developer Experience - DX).

A AMA é uma síntese de vários padrões modernos, adaptada para a realidade de uma aplicação de desktop complexa e orientada a eventos como o Project Wiz.

### Princípios Fundamentais

1.  **Divisão Clara Main/Renderer:** A base da arquitetura é uma separação estrita entre o processo principal do Electron (`main`, o backend) e o processo de renderização (`renderer`, o frontend). O único ponto de contato entre eles é um contrato IPC bem definido.
2.  **Fatias Verticais por Módulo de Negócio:** Em vez de agrupar código por camada técnica (ex: `services`, `repositories`), o backend (`main`) é organizado em módulos que representam fatias verticais de funcionalidades de negócio (ex: `project-management`, `agent-execution`).
3.  **Co-localização Radical:** Dentro de um módulo de negócio, todo o código relacionado a essa funcionalidade (lógica, domínio, persistência) vive junto. O objetivo é que 95% do trabalho em uma feature aconteça dentro de um único diretório de módulo.
4.  **Comunicação Explícita via CQRS:** O fluxo de dados é gerenciado separando operações de escrita (**Commands**) das de leitura (**Queries**). Isso simplifica o estado, a lógica e otimiza o desempenho das leituras.
5.  **Reatividade Orientada a Eventos:** A comunicação *entre* módulos de negócio é feita de forma assíncrona através de um **Event Bus** central. Isso desacopla os módulos, permitindo que evoluam de forma independente.
6.  **Substituição de Use Cases por Commands/Queries:** O padrão CQRS redefine a camada de aplicação. Em vez de "Services" ou "Use Cases" genéricos que misturam responsabilidades, cada caso de uso é representado por uma classe de **Comando** (para escritas) ou **Query** (para leituras), cada uma com seu próprio **Handler** focado. Isso torna a intenção de cada operação explícita e a lógica mais simples e isolada.

## 2. Estrutura de Diretórios Principal

A estrutura de alto nível dentro de `/src` reflete a separação fundamental da aplicação.

```
/src
├── main/                 # Lógica do Processo Principal (Backend)
│   ├── electron-main.ts
│   ├── bootstrap.ts
│   ├── kernel/
│   └── modules/
│
├── renderer/             # Lógica do Processo de Renderização (Frontend - React)
│   ├── main.tsx
│   ├── App.tsx
│   ├── components/
│   ├── features/
│   ├── services/
│   └── ...
│
└── shared/               # Contrato de comunicação entre Main e Renderer
    ├── ipc-contracts.ts
    └── result.ts
```

### 2.1. Detalhamento de `/src/main` (Backend)

O processo `main` detém toda a lógica de negócio, estado central e acesso a recursos do sistema.

*   `electron-main.ts`: Ponto de entrada do Electron. Configura janelas e handlers de IPC. É mantido o mais enxuto possível.
*   `bootstrap.ts`: Inicializa e conecta as peças centrais da aplicação: o dispatcher CQRS, o Event Bus e todos os módulos de negócio.
*   `kernel/`: Contém os serviços centrais e agnósticos que orquestram a aplicação, como o `cqrs-dispatcher.ts` e o `event-bus.ts`.
*   `modules/`: O coração da lógica de negócio. Cada subdiretório é uma fatia vertical auto-contida.
    *   `modules/project-management/`:
        *   `commands/`: Definições e handlers para operações de escrita (ex: `create-project.command.ts`).
        *   `queries/`: Definições e handlers para operações de leitura (ex: `get-project-by-id.query.ts`).
        *   `domain/`: Entidades e VOs do domínio (ex: `project.entity.ts`).
        *   `persistence/`: Lógica de acesso a dados (schemas e repositórios Drizzle).
        *   `listeners/`: Handlers que reagem a eventos emitidos por outros módulos.
        *   `index.ts`: Ponto de entrada do módulo, responsável por registrar seus handlers no dispatcher e seus listeners no event bus.

### 2.2. Detalhamento de `/src/renderer` (Frontend)

O processo `renderer` é uma aplicação React completa, cuja organização atual, baseada em **Feature-Sliced Design**, é adotada e formalizada por esta arquitetura. Ela é responsável exclusivamente pela interface do usuário.

A estrutura dentro de `src/renderer` é organizada da seguinte forma:

*   **Raiz (`main.tsx`, `App.tsx`):** Ponto de entrada da aplicação React, onde são configurados os provedores globais (Tema, Roteamento, Query Client, etc.).

*   `components/`: A biblioteca de componentes globais e o Design System da aplicação. São agnósticos de negócio e altamente reutilizáveis.
    *   `layout/`: Componentes que definem a estrutura visual principal da aplicação (ex: `AppShell`, `MainSidebar`).
    *   `ui/`: O coração do Design System. Contém todos os componentes atômicos e reutilizáveis, como `Button`, `Card`, `Dialog`, `LoadingSpinner`. Este diretório abriga tanto os componentes base da biblioteca (Shadcn/UI) quanto quaisquer outros componentes de base criados para o projeto.

*   `features/`: O coração da organização da UI. Cada subdiretório é uma "fatia" de funcionalidade que espelha um módulo de negócio do backend.
    *   `features/project-management/`:
        *   `components/`: Contém **todos** os componentes React da feature, desde os pequenos e reutilizáveis (ex: `ProjectCard`) até os componentes de página completos (ex: `ProjectListPage`) que serão importados e renderizados pela camada de roteamento.
        *   `hooks/`: Hooks React para gerenciar estado e lógica da UI da feature (ex: `useProjectList`).
        *   `services/` (opcional): Funções que encapsulam a lógica de comunicação com o backend (via `services/ipc.ts`) específica para esta feature.

*   `services/`: Camada de abstração para toda a comunicação com o backend.
    *   `ipc.ts`: Define funções que encapsulam as chamadas `ipcRenderer`, utilizando os contratos de `shared/ipc-contracts.ts` para garantir segurança de tipo. É o único local que deve interagir diretamente com a API de IPC.

*   `hooks/`: Hooks React globais e utilitários, reutilizáveis através de múltiplas features (ex: `useDebounce`, `useLocalStorage`).

*   `lib/`: Utilitários JavaScript/TypeScript puros (não-React), como `cn` para classnames, formatadores de data, etc.

*   `store/`: Gerenciamento de estado global do cliente (não relacionado a dados de servidor), utilizando ferramentas como Zustand ou Jotai.

*   `types/`: Definições de tipo TypeScript globais para o frontend.

*   `app/`: Responsável pela definição da estrutura de rotas da aplicação. Utilizando a convenção de roteamento baseado em arquivos do TanStack Router, os arquivos nesta pasta (ex: `app/projects/index.tsx`) definem as rotas, montam as telas e importam os componentes de página de `features/` para serem renderizados. O arquivo `routeTree.gen.ts` é gerado automaticamente a partir desta estrutura.

*   `locales/`: Contém os catálogos de mensagens para internacionalização (i18n), gerenciados pelo LinguiJS. Cada subdiretório representa um idioma (ex: `en`, `pt-br`).

Esta estrutura promove alta coesão dentro de cada feature e baixo acoplamento entre elas, alinhando-se perfeitamente com a filosofia de módulos do backend.

### 2.3. Detalhamento de `/src/shared`

Este diretório é intencionalmente mínimo. Ele é o **contrato** que garante a comunicação segura e type-safe entre `main` e `renderer`.

*   `ipc-contracts.ts`: Define os nomes dos canais IPC e, mais importante, os tipos de dados (payloads) para cada comando e query. É a única fonte da verdade para a comunicação inter-processos.
*   `result.ts`: Define um tipo `Result<T, E>` padronizado para encapsular sucesso ou falha em operações, usado em ambos os lados da ponte IPC.

## 3. O Paradigma CQRS: Adeus, Use Case Genérico

A adoção do CQRS muda fundamentalmente a forma como organizamos a lógica da camada de aplicação. O conceito tradicional de uma classe `ProjectService` ou `ProjectUseCase` que agrupa dezenas de métodos para escrita e leitura é abolido em favor de um padrão mais explícito e focado.

*   **Intenção sobre Implementação:** Cada caso de uso é representado por um objeto que carrega a **intenção** e os dados da operação. `CreateProjectCommand` não é apenas um DTO; é um objeto que representa o caso de uso "Criar um Novo Projeto".

*   **Handlers com Responsabilidade Única:** A lógica para cada caso de uso reside em uma classe de **Handler** dedicada. Um `CreateProjectCommandHandler` tem uma única responsabilidade: executar a lógica para criar um projeto. Isso resulta em classes menores, mais fáceis de testar e de entender.

*   **O Papel Refinado dos "Services":** A palavra "Service" não desaparece, mas seu significado se torna muito mais preciso:
    *   **Domain Services:** Usados para encapsular lógica de negócio complexa que não pertence a uma única entidade. São raros e sem estado.
    *   **Infrastructure Services (Adapters):** Usados para encapsular a comunicação com sistemas externos (ex: um `LlmService` para chamadas à API da OpenAI, um `FileWatcherService` para monitorar o sistema de arquivos). Os Command Handlers utilizam esses serviços para executar seus trabalhos.

Em suma, a camada de aplicação não é mais um conjunto de serviços genéricos, mas sim um conjunto de fluxos de dados bem definidos (Commands e Queries) orquestrados por um dispatcher central, onde cada fluxo tem sua própria lógica de manuseio isolada.

## 4. Fluxos de Dados e Conceitos-Chave

### 3.1. Fluxo de Comando (Escrita): Criar um Projeto

1.  **Renderer:** Um componente em `renderer/features/project-management/views/` chama uma função do serviço `renderer/services/ipc.ts`.
2.  **IPC:** A função `ipc.sendCommand('project:create', { name: '...' })` é invocada. O canal e o tipo do payload vêm de `shared/ipc-contracts.ts`.
3.  **Main:** O handler de IPC em `main/electron-main.ts` recebe a chamada e a repassa para o dispatcher CQRS.
4.  **Kernel:** O `cqrs-dispatcher.ts` encontra o handler registrado para o comando `'project:create'`.
5.  **Módulo:** O handler em `main/modules/project-management/commands/create-project.command.ts` executa a lógica de negócio: valida os dados, cria a entidade, a salva no banco de dados via repositório e, finalmente, emite um evento `eventBus.publish('ProjectCreated', ...)`.

### 3.2. Fluxo de Query (Leitura): Listar Projetos

1.  **Renderer:** Um hook (ex: TanStack Query) em `renderer/features/project-management/hooks/` precisa buscar dados. Ele chama `ipc.sendQuery('project:listAll')`.
2.  **IPC:** A chamada é enviada para o processo `main`.
3.  **Main/Kernel:** O dispatcher CQRS invoca o handler da query.
4.  **Módulo:** O handler em `main/modules/project-management/queries/list-all-projects.query.ts` acessa o repositório de persistência. **Crucialmente**, ele pode buscar dados "crus" e formatá-los em um DTO otimizado para a UI, sem a necessidade de instanciar entidades de domínio completas, tornando a leitura mais eficiente. O resultado é retornado.

### 3.3. Estratégia de Persistência de Dados com Drizzle

A arquitetura adota uma abordagem que combina schemas de banco de dados descentralizados com um processo de migração centralizado, otimizando tanto a autonomia dos módulos quanto a integridade do banco de dados.

*   **Schemas Descentralizados:** A definição de cada tabela (o schema Drizzle) pertence ao módulo de negócio que a gerencia. O arquivo `*.schema.ts` fica localizado dentro do diretório de persistência do seu respectivo módulo (ex: `src/main/modules/project-management/persistence/project.schema.ts`).
*   **Migrações Centralizadas:** Os arquivos de migração SQL gerados pelo DrizzleKit são armazenados em um único diretório central: `src/main/persistence/migrations/`.
*   **Configuração Unificadora:** O arquivo `drizzle.config.ts` na raiz do projeto atua como o ponto de conexão, configurado para escanear todos os schemas dos módulos e centralizar a saída das migrações.

### 3.4. Consistência de Dados e Transações

Para garantir a atomicidade das operações e a consistência dos dados, o **Command Handler** é o único responsável por definir os limites de uma transação de banco de dados (ex: `db.transaction(...)`). Se um comando precisa modificar dados de múltiplos módulos, seu handler orquestra as chamadas aos repositórios desses módulos dentro de uma única transação, garantindo a integridade dos dados.

### 3.5. A Ponte Segura: Comunicação IPC Bidirecional

A comunicação entre os processos `renderer` e `main` é estabelecida através de uma ponte segura e bidirecional.

*   **O Script `preload.ts`:** Localizado em `src/main/preload.ts`, ele usa `contextBridge` para expor uma API segura ao `renderer`. Essa API inclui métodos para **solicitar dados** (`sendCommand`, `sendQuery`) e para **ouvir por dados** (`on(channel, callback)`), permitindo que o `main` envie atualizações em tempo real para a UI.
*   **Handlers IPC no `main`:** Em `src/main/electron-main.ts`, handlers de IPC recebem as solicitações e as delegam ao dispatcher CQRS. Para enviar dados ao `renderer`, qualquer parte do backend pode usar `mainWindow.webContents.send(...)`.

### 3.6. Processamento de Tarefas de Longa Duração (Workers)

Para evitar o bloqueio da thread principal, tarefas intensivas (como interações com LLMs) são executadas em **Worker Services**, utilizando `worker_threads` do Node.js. Esses workers rodam em threads separadas, operam de forma independente e se comunicam com o resto do sistema através do banco de dados e do mecanismo de push do IPC para fornecer feedback em tempo real à UI.

## 4. Plano de Migração Incremental

Uma reescrita completa ("big bang") é arriscada e desnecessária. A migração para a AMA será um processo gradual e seguro.

1.  **Passo 1: Estabelecer a Fundação (1-2 dias)**
    *   Reestruturar os diretórios de topo para a nova organização `/src/main`, `/src/renderer`, `/src/shared`.
    *   Mover o código da UI existente para dentro de `/src/renderer`.
    *   Criar o arquivo `shared/ipc-contracts.ts` e `shared/result.ts`.
    *   Implementar as primeiras versões do `cqrs-dispatcher.ts` e `event-bus.ts` dentro de `src/main/kernel/`.

2.  **Passo 2: Criar o Primeiro Módulo (Próxima Feature Nova)**
    *   A próxima funcionalidade a ser desenvolvida será implementada seguindo 100% a nova arquitetura, dentro de seu próprio diretório em `src/main/modules/` e `src/renderer/features/`.
    *   Isso servirá como um projeto piloto para validar e refinar a abordagem sem tocar no código legado.

3.  **Passo 3: Construir Fachadas (Facades) para o Código Legado**
    *   Para permitir que o novo código (ou a UI refatorada) interaja com a lógica de negócio antiga, criaremos "fachadas" de Comandos e Queries.
    *   Por exemplo, um `main/modules/legacy/commands/some-legacy-action.command.ts` será criado. Seu handler simplesmente importará e chamará o antigo `UseCase` ou `Service` correspondente.
    *   Isso permite que a migração aconteça de fora para dentro, sem quebrar a funcionalidade existente.

4.  **Passo 4: Refatoração Oportunista e Contínua**
    *   Adotar a "Regra do Escoteiro": sempre que um desenvolvedor precisar corrigir um bug ou fazer uma pequena alteração em uma parte do código legado, ele deve aproveitar a oportunidade para migrar aquela funcionalidade para um módulo adequado na nova arquitetura.
    *   Com o tempo, o código legado será naturalmente "canibalizado" pela nova estrutura de forma orgânica e de baixo risco.

5.  **Passo 5: Atualizar Ferramentas e CI**
    *   Configurar regras de linting (ESLint) para impor a nova arquitetura. Por exemplo, proibir que o código em `/src/renderer` importe diretamente de `/src/main`, exceto de `/src/shared`.
    *   Isso garantirá que a separação de responsabilidades seja mantida ao longo do tempo.

## 5. Conclusão

A Arquitetura de Módulos Adaptativos (AMA) oferece um caminho claro para um codebase mais organizado, desacoplado e agradável de se trabalhar. Ao focar na co-localização da lógica de negócio e em padrões de comunicação explícitos, a AMA visa resolver os desafios de manutenibilidade de aplicações complexas, permitindo que o Project Wiz cresça de forma sustentável e robusta.
