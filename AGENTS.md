# Visão Geral do Projeto

## Propósito e Porquê

O **Project Wiz** é uma aplicação desktop inovadora que atua como uma "fábrica de software autônoma". Ele utiliza Agentes de IA (chamados Personas) para automatizar e otimizar diversas etapas do ciclo de vida do desenvolvimento de software. O objetivo principal é transformar fundamentalmente o processo de desenvolvimento através da colaboração inteligente entre humanos e agentes de IA autônomos, permitindo que os desenvolvedores humanos se concentrem em inovação e resolução de problemas de alto nível.

## Tecnologias Utilizadas

- **ElectronJS:** Framework para construir aplicações desktop multiplataforma usando tecnologias web (HTML, CSS, JavaScript). É a base da nossa aplicação.
- **React:** Biblioteca JavaScript para construir interfaces de usuário interativas e reativas. Utilizado no frontend da aplicação.
- **TypeScript:** Superset do JavaScript que adiciona tipagem estática. Ajuda a escrever código mais robusto e com menos erros, tanto no frontend quanto no backend.
- **Tailwind CSS:** Framework CSS utilitário que permite construir designs rapidamente, aplicando classes diretamente no HTML. Usado para estilizar a interface do usuário.
- **Node.js:** Ambiente de execução JavaScript no lado do servidor. Utilizado no processo principal do Electron para a lógica de negócio e orquestração.
- **Large Language Models (LLMs):** Modelos de linguagem grandes como OpenAI e DeepSeek. Integrados para permitir que os Agentes de IA compreendam e gerem texto, código e planos de ação.
- **SQLite:** Banco de dados relacional leve e embutido. Usado para armazenar metadados do projeto, agentes, jobs e configurações localmente.
- **Drizzle ORM:** ORM (Object-Relational Mapper) para TypeScript que facilita a interação com o banco de dados SQLite de forma segura e tipada.
- **Vite:** Ferramenta de build e servidor de desenvolvimento rápido para projetos web modernos. Utilizado para empacotar e servir o código da aplicação.
- **Vitest:** Framework de teste rápido para JavaScript/TypeScript. Usado para escrever e executar testes de unidade e integração.
- **ESLint:** Ferramenta de linting para identificar e reportar padrões problemáticos encontrados no código JavaScript/TypeScript. Ajuda a manter a qualidade e consistência do código.
- **LinguiJS:** Biblioteca para internacionalização (i18n) e localização (l10n) de aplicações React. Permite que a aplicação suporte múltiplos idiomas.

## Contexto no Ecossistema

O Project Wiz é uma aplicação desktop autônoma, o que significa que ele reside e opera diretamente no computador do desenvolvedor. Ele interage com o sistema de arquivos local para analisar e modificar código, e se conecta a serviços externos de LLM (como OpenAI ou DeepSeek) via API para realizar suas tarefas inteligentes.

## Links Úteis

- [Documentação do Usuário](D:/Documentos/Pessoal/Github/project-wiz/docs/user/README.md)
- [Documentação Técnica](D:/Documentos/Pessoal/Github/project-wiz/docs/developer/reference/software-architecture.md)
- [Guia de Contribuição](D:/Documentos/Pessoal/Github/project-wiz/docs/developer/community/contribution-guide.md)
- [Código de Conduta](D:/Documentos/Pessoal/Github/project-wiz/docs/developer/community/code-of-conduct.md)

# Arquitetura do Sistema

O Project Wiz é uma aplicação desktop construída com Electron, o que significa que ela possui dois processos principais: o **Processo Principal (Main Process)** e o **Processo de Renderização (Renderer Process)**. A arquitetura segue princípios de Clean Architecture e Domain-Driven Design (DDD), com uma forte separação de responsabilidades e o uso do padrão CQRS (Command Query Responsibility Segregation).

## Componentes Principais

- **Processo Principal (Main Process):**
  - É o "cérebro" da aplicação. Escrito em Node.js/TypeScript.
  - Responsável pela orquestração geral, lógica de negócio, interação com o sistema de arquivos, acesso ao banco de dados (SQLite via Drizzle ORM) e comunicação com serviços externos (como LLMs).
  - Gerencia o ciclo de vida da aplicação Electron e as janelas.
  - Contém a implementação dos módulos de domínio (ex: `persona-management`, `llm-integration`).

- **Processo de Renderização (Renderer Process):**
  - É a interface do usuário (UI) da aplicação. Construído com React, TypeScript e Tailwind CSS.
  - Responsável por renderizar a UI, capturar as interações do usuário e enviar requisições para o Processo Principal via IPC (Inter-Process Communication).
  - Não contém lógica de negócio diretamente, apenas a lógica de apresentação.

- **Banco de Dados (SQLite com Drizzle ORM):**
  - Um banco de dados leve baseado em arquivo (`project-wiz.db`) que armazena metadados sobre projetos, agentes, jobs, configurações de LLM, etc.
  - O Drizzle ORM é utilizado para uma interação segura e tipada com o banco de dados.

- **Serviços de LLM Externos:**
  - Modelos de Linguagem Grandes (LLMs) como OpenAI e DeepSeek.
  - O Processo Principal se comunica com esses serviços via APIs para realizar tarefas inteligentes, como geração de código, análise e planejamento.

## Fluxo de Dados Simplificado

Imagine que você clica em um botão na interface para "Criar um novo Tópico no Fórum":

1.  **UI (Renderer Process):** O clique no botão é capturado pela interface do usuário.
2.  **IPC (Inter-Process Communication):** É como um "telefone" que permite que o Processo de Renderização (UI) e o Processo Principal (lógica de negócio) conversem entre si. O Renderer Process envia uma mensagem (ex: `forum:create-topic`) para o Processo Principal, contendo os dados necessários (título, ID do autor).
3.  **IPC Handler (Main Process):** No Processo Principal, um `ipcMain.handle` (como `forum.handler.ts`) recebe essa mensagem.
4.  **CQRS Dispatcher (Main Process):** O handler utiliza um `CqrsDispatcher` para despachar um `Command` (ex: `CreateForumTopicCommand`). Este `Command` é um objeto que encapsula a intenção da ação.
5.  **Application Layer (Main Process):** O `Command` é processado por um `UseCase` ou `Application Service` correspondente. Este serviço orquestra a lógica de negócio, interagindo com o domínio.
6.  **Domain Layer (Main Process):** A lógica de negócio central é executada. Entidades e serviços de domínio são utilizados para validar dados, aplicar regras de negócio e realizar operações.
7.  **Persistence Layer (Main Process):** Se a operação envolver dados, o Domain Layer interage com a Persistence Layer (através de interfaces de repositório) para salvar ou recuperar dados do banco de dados (SQLite via Drizzle ORM).
8.  **Resposta:** O resultado da operação (sucesso/falha, dados criados/atualizados) é retornado através do `CqrsDispatcher` para o IPC Handler, que então envia a resposta de volta para o Renderer Process.
9.  **Atualização da UI:** O Renderer Process recebe a resposta e atualiza a interface do usuário, mostrando o novo tópico ou uma mensagem de erro.

## Estilo Arquitetural

O projeto adota uma arquitetura modular baseada em **Clean Architecture** e **Domain-Driven Design (DDD)**. Isso significa que:

- **Separação de Camadas:** A lógica de negócio (Domínio) é mantida isolada das preocupações de infraestrutura (banco de dados, APIs externas, UI). Isso torna o código mais testável, manutenível e flexível a mudanças.
- **Módulos Bounded Contexts:** O sistema é dividido em módulos independentes (ex: `forum`, `llm-integration`, `persona-management`), cada um representando um "contexto delimitado" com suas próprias responsabilidades e lógica de domínio.
- **CQRS (Command Query Responsibility Segregation):** As operações que modificam o estado do sistema (Comandos) são separadas das operações que apenas leem dados (Queries). Isso otimiza a performance e a clareza das intenções.

## Considerações Importantes

- **Tratamento de Erros:** Erros são capturados nos IPC Handlers e retornados ao Renderer Process para serem exibidos ao usuário, garantindo uma experiência robusta.
- **Segurança:** A aplicação lida com hash de senhas (bcrypt) e tokens JWT para autenticação, garantindo a segurança das operações internas e de dados sensíveis.

# Padrões de Design e Boas Práticas

O Project Wiz segue rigorosamente diversos padrões de design e boas práticas para garantir um código de alta qualidade, manutenível e escalável.

## Padrões Comuns no Projeto

- **Clean Architecture / Domain-Driven Design (DDD):**
  - **Explicação:** Este é o padrão arquitetural central. Ele organiza o código em camadas concêntricas, onde as dependências fluem de fora para dentro. O "coração" é o Domínio (lógica de negócio pura), cercado pela Camada de Aplicação (casos de uso), e depois pelas camadas de Infraestrutura e Apresentação. O DDD foca em modelar o software em torno do domínio do negócio, usando uma linguagem ubíqua.
  - **Exemplo no Projeto:** Você verá isso na estrutura de cada módulo (`src/main/modules/<nome-do-modulo>/`), que contém subdiretórios como `domain/`, `application/`, `persistence/` e `infrastructure/`.
    - `domain/`: Contém as entidades, agregados e serviços de domínio (a lógica de negócio principal, independente de tecnologia).
    - `application/`: Contém os casos de uso (Use Cases) e serviços de aplicação que orquestram as operações do domínio.
    - `persistence/`: Contém as implementações dos repositórios que interagem com o banco de dados.
    - `infrastructure/`: Contém implementações de interfaces que dependem de tecnologias externas (ex: clientes de API de LLM).

- **CQRS (Command Query Responsibility Segregation):**
  - **Explicação:** Pense no CQRS como ter duas "portas" diferentes para interagir com o sistema: uma para **Comandos** (ações que mudam algo, como "Criar Usuário") e outra para **Queries** (ações que apenas perguntam algo, como "Listar Usuários"). Isso ajuda a manter o código mais organizado, claro e, em sistemas maiores, pode melhorar o desempenho.
  - **Exemplo no Projeto:** Nos IPC Handlers (ex: `src/main/ipc-handlers/forum.handler.ts`), você verá chamadas para `cqrsDispatcher.dispatchCommand()` para ações como `CreateForumTopicCommand` e `cqrsDispatcher.dispatchQuery()` para leituras como `ListForumTopicsQuery`. Dentro dos módulos, a camada `application/` é dividida em `commands/` e `queries/`.

- **Injeção de Dependência (Dependency Injection - DI):**
  - **Explicação:** Em vez de uma classe criar suas próprias dependências, elas são "injetadas" (passadas) para ela, geralmente através do construtor. Isso promove o baixo acoplamento, tornando o código mais modular, testável e fácil de manter.
  - **Exemplo no Projeto:** O `CqrsDispatcher` é injetado nos IPC Handlers (ex: `registerForumIpcHandlers(cqrsDispatcher: CqrsDispatcher)`). Isso permite que o handler utilize o dispatcher sem precisar saber como ele é criado.

## Convenções de Código

- **TypeScript:** O projeto é escrito em TypeScript, utilizando tipagem estática para melhorar a robustez e a legibilidade do código.
- **ESLint:** Ferramenta de linting configurada para impor padrões de código e estilo, garantindo consistência em todo o projeto.
- **Nomenclatura:**
  - Variáveis e funções: `camelCase` (ex: `myVariable`, `calculateTotal`).
  - Classes e Tipos: `PascalCase` (ex: `MyClass`, `UserInterface`).
  - Constantes globais: `SCREAMING_SNAKE_CASE` (ex: `API_KEY`).
  - Nome de arquivos: `kebab-case` (ex: `user.entity.ts`, `my-component.tsx`, `my-hook.hook.ts`).
- **Formatação:** O projeto provavelmente utiliza um formatador de código (como Prettier, embora não explicitamente no `package.json` scripts, é uma prática comum com ESLint) para garantir a formatação consistente.

## Princípios Aplicados

- **DRY (Don't Repeat Yourself):** Evitar duplicação de código, promovendo a reutilização e a manutenibilidade.
- **KISS (Keep It Simple, Stupid):** Priorizar soluções simples e diretas em vez de complexas, mesmo que pareçam "elegantes".
- **SOLID:** Um conjunto de cinco princípios de design de software que visam tornar os designs de software mais compreensíveis, flexíveis e manuteníveis. (Embora não explicitamente listado, é uma meta implícita de Clean Architecture/DDD).

# Estrutura do Repositório

A organização do repositório segue uma estrutura clara e modular, facilitando a localização de arquivos e o entendimento das responsabilidades de cada parte do sistema.

```
project-wiz/
├── .env.example             # Exemplo de arquivo de variáveis de ambiente
├── .gitignore               # Arquivo para ignorar arquivos e diretórios no Git
├── AGENTS.md                # Este documento!
├── components.json          # Configuração para componentes UI (shadcn/ui)
├── drizzle.config.ts        # Configuração do Drizzle ORM para banco de dados
├── eslint.config.js         # Configuração do ESLint para linting de código
├── forge.config.cts         # Configuração do Electron Forge para build e empacotamento
├── lingui.config.ts         # Configuração do LinguiJS para internacionalização
├── package-lock.json        # Bloqueia as versões exatas das dependências
├── package.json             # Metadados do projeto, scripts e dependências
├── README.md                # Visão geral do projeto e instruções básicas
├── tailwind.config.ts       # Configuração do Tailwind CSS
├── tsconfig.json            # Configuração do TypeScript
├── vite.main.config.mts     # Configuração do Vite para o processo principal
├── vite.preload.config.mts  # Configuração do Vite para o script preload do Electron
├── vite.renderer.config.mts # Configuração do Vite para o processo de renderização (UI)
├── vitest.config.mts        # Configuração do Vitest para testes
├── docs/                    # Documentação do projeto (usuário, desenvolvedor, arquitetura)
│   ├── developer/           # Documentação para desenvolvedores
│   │   └── reference/       # Referências técnicas, ADRs (Architectural Decision Records)
│   └── user/                # Guias e tutoriais para usuários
└── src/                     # Código-fonte principal da aplicação
    ├── main/                # Código do Processo Principal (Node.js/Electron)
    │   ├── bootstrap.ts     # Ponto de entrada e inicialização do processo principal
    │   ├── electron-main-composition.ts # Composição de dependências e inicialização de módulos
    │   ├── ipc-handlers/    # Handlers para comunicação IPC entre Renderer e Main
    │   │   └── forum.handler.ts # Exemplo de handler para o módulo de fórum
    │   ├── kernel/          # Componentes centrais do sistema, como o CQRS Dispatcher
    │   │   └── cqrs-dispatcher.ts # Despachador de Comandos e Queries
    │   ├── modules/         # Módulos de domínio (bounded contexts)
    │   │   ├── automatic-persona-hiring/ # Lógica para contratação automática de personas
    │   │   │   ├── application/ # Casos de uso e serviços de aplicação
    │   │   │   ├── domain/      # Entidades e lógica de domínio
    │   │   │   └── persistence/ # Implementações de repositório
    │   │   ├── code-analysis/    # Módulo para análise de código
    │   │   ├── direct-messages/  # Módulo para mensagens diretas
    │   │   ├── filesystem-tools/ # Ferramentas para interação com o sistema de arquivos
    │   │   ├── forum/            # Módulo do sistema de fórum
    │   │   │   ├── application/  # Comandos e Queries do fórum
    │   │   │   │   ├── commands/ # Comandos (ex: CreateForumTopicCommand)
    │   │   │   │   └── queries/  # Queries (ex: ListForumTopicsQuery)
    │   │   │   ├── domain/       # Lógica de domínio do fórum
    │   │   │   └── persistence/  # Repositórios do fórum
    │   │   ├── git-integration/  # Módulo para integração com Git
    │   │   ├── llm-integration/  # Módulo para integração com LLMs
    │   │   │   ├── application/  # Casos de uso de LLM
    │   │   │   ├── domain/       # Lógica de domínio de LLM
    │   │   │   ├── infrastructure/ # Implementações de clientes de LLM (ex: OpenAI API)
    │   │   │   └── persistence/  # Repositórios de LLM
    │   │   ├── persona-management/ # Módulo para gestão de personas
    │   │   ├── project-management/ # Módulo para gestão de projetos
    │   │   └── user-settings/    # Módulo para configurações do usuário
    │   └── persistence/     # Configuração global de persistência (Drizzle, migrações)
    │       ├── db.ts        # Configuração da conexão com o banco de dados
    │       ├── schema.ts    # Esquema global do banco de dados
    │       └── migrations/  # Arquivos de migração do banco de dados
    ├── presentation/        # Camada de apresentação (UI)
    │   └── ui/              # Componentes de UI reutilizáveis (shadcn/ui)
    ├── renderer/            # Código do Processo de Renderização (React UI)
    │   ├── app/             # Componentes principais da aplicação React
    │   ├── components/      # Componentes React específicos da aplicação
    │   ├── features/        # Módulos de funcionalidades da UI (ex: direct-messages, forum)
    │   ├── hooks/           # Hooks React personalizados
    │   ├── lib/             # Funções utilitárias
    │   └── styles/          # Estilos globais (Tailwind CSS)
    └── shared/              # Código compartilhado entre Main e Renderer (apenas tipos e interfaces para comunicação IPC. **Importante: Este diretório não deve conter lógica de negócio ou implementações, apenas definições de tipos, para evitar dependências cíclicas e garantir a separação entre os processos Main e Renderer do Electron**)
        ├── common/          # Tipos comuns (ex: BaseEntity)
        └── ipc-types/       # Definições de tipos para comunicação IPC
```

# Guia de Desenvolvimento Local

Este guia irá ajudá-lo a configurar o ambiente de desenvolvimento do Project Wiz em sua máquina.

## Pré-requisitos Obrigatórios

Para rodar o Project Wiz localmente, você precisará ter as seguintes ferramentas instaladas:

- **Git:** Sistema de controle de versão.
  - [Download Git](https://git-scm.com/downloads)
- **Node.js (versão 20.x ou superior):** Ambiente de execução JavaScript.
  - [Download Node.js](https://nodejs.org/en/download/)
- **npm (geralmente vem com o Node.js):** Gerenciador de pacotes do Node.js.
- **VS Code (Recomendado):** Editor de código com bom suporte a TypeScript e extensões úteis.
  - [Download VS Code](https://code.visualstudio.com/download)

## Passo a Passo de Configuração do Ambiente

1.  **Clonar o Repositório:**
    Abra seu terminal ou prompt de comando e execute:

    ```bash
    git clone https://github.com/HD220/project-wiz.git
    cd project-wiz
    ```

    _Isso baixa todo o código do projeto para uma pasta no seu computador e entra nessa pasta._

2.  **Instalar Dependências:**
    Dentro da pasta `project-wiz`, execute:

    ```bash
    npm install
    ```

    _Este comando lê o arquivo `package.json` e baixa todas as bibliotecas e ferramentas que o projeto precisa para funcionar e para o desenvolvimento._

3.  **Configurar Variáveis de Ambiente:**
    O projeto utiliza variáveis de ambiente para configurações sensíveis (como chaves de API de LLMs).
    - Crie um arquivo chamado `.env` na raiz do projeto (na mesma pasta onde está o `package.json`).
    - Copie o conteúdo do arquivo `.env.example` para o seu novo arquivo `.env`.
    - Preencha as variáveis necessárias, como as chaves de API para OpenAI ou DeepSeek, se for usar esses serviços.
      _Exemplo de `.env` (apenas para ilustração, consulte `.env.example` para o conteúdo completo):_

    ```
    OPENAI_API_KEY=sua_chave_aqui
    DEEPSEEK_API_KEY=sua_chave_aqui
    ```

    _Este passo é crucial para que a aplicação possa se conectar aos serviços externos e funcionar corretamente._

4.  **Configurar Banco de Dados (SQLite):**
    O Project Wiz usa SQLite, que é um banco de dados baseado em arquivo. Ele será criado automaticamente na primeira execução se não existir. No entanto, você pode precisar gerar as migrações do banco de dados.
    ```bash
    npm run db:generate
    npm run db:migrate
    ```
    _`db:generate` cria os arquivos de migração com base no seu esquema de banco de dados. `db:migrate` aplica essas migrações ao seu arquivo de banco de dados SQLite (`project-wiz.db`), criando as tabelas necessárias._

## Comandos Essenciais

Aqui estão os comandos mais importantes que você usará durante o desenvolvimento:

- **Para Iniciar a Aplicação Localmente (Modo Desenvolvimento):**

  ```bash
  npm start
  # ou
  npm run dev
  ```

  _Isso inicia a aplicação Electron em modo de desenvolvimento, com recarregamento automático de código. Você verá a janela do Project Wiz aparecer._

- **Para Construir o Projeto (Produção):**

  ```bash
  npm run build
  ```

  _Este comando executa o processo completo de build, incluindo a extração e compilação de mensagens de internacionalização, e empacota a aplicação para distribuição._

- **Para Rodar os Testes:**

  ```bash
  npm test
  ```

  _Isso executa todos os testes de unidade e integração do projeto para verificar se o código está funcionando como esperado e se não há regressões._

- **Para Rodar os Testes em Modo Watch (Observar Mudanças):**

  ```bash
  npm run test:watch
  ```

  _Inicia os testes e os executa novamente automaticamente sempre que você salva uma alteração nos arquivos de código ou teste._

- **Para Rodar os Testes com Cobertura de Código:**

  ```bash
  npm run test:coverage
  ```

  _Executa os testes e gera um relatório mostrando qual porcentagem do seu código é coberta pelos testes._

- **Para Analisar o Código (Linting):**

  ```bash
  npm run lint
  ```

  _Verifica o código em busca de problemas de estilo e possíveis erros, e tenta corrigi-los automaticamente (`--fix`)._

- **Para Verificar Tipos (TypeScript):**

  ```bash
  npm run type-check
  ```

  _Verifica se há erros de tipagem no seu código TypeScript sem gerar arquivos JavaScript._

- **Para Gerar Migrações do Banco de Dados:**

  ```bash
  npm run db:generate
  ```

  _Cria novos arquivos de migração para o Drizzle ORM com base nas alterações feitas no esquema do banco de dados._

- **Para Aplicar Migrações do Banco de Dados:**

  ```bash
  npm run db:migrate
  ```

  _Aplica as migrações pendentes ao seu banco de dados SQLite, atualizando a estrutura das tabelas._

- **Para Abrir o Drizzle Studio (Interface Web para o DB):**
  ```bash
  npm run db:studio
  ```
  _Inicia uma interface web que permite visualizar e interagir com os dados do seu banco de dados SQLite._

# Principais Dependências

Aqui estão algumas das bibliotecas e frameworks mais importantes que o Project Wiz utiliza, com uma breve explicação do seu propósito:

- **@ai-sdk/deepseek, @ai-sdk/openai, ai:** Conjunto de bibliotecas para integração com modelos de linguagem grandes (LLMs) como DeepSeek e OpenAI, permitindo que os agentes de IA se comuniquem e utilizem esses modelos.
- **@radix-ui/\*:** Coleção de componentes React de baixo nível e acessíveis para construir interfaces de usuário robustas e personalizáveis. Usados como base para os componentes da UI.
- **@tanstack/react-router:** Roteador de próxima geração para React, focado em segurança de tipo e desempenho, usado para gerenciar a navegação entre as diferentes telas da aplicação.
- **@tanstack/react-query:** Biblioteca para gerenciamento de estado assíncrono, cache e sincronização de dados no React. Essencial para lidar com a comunicação com o backend e APIs externas.
- **@hookform/resolvers, react-hook-form:** Bibliotecas para construção e validação de formulários no React, integradas com esquemas de validação como Zod.
- **zod:** Biblioteca de declaração e validação de esquemas com segurança de tipo. Usada para garantir que os dados de entrada e saída estejam no formato correto.
- **@libsql/client, better-sqlite3, drizzle-orm:** Conjunto de ferramentas para interagir com o banco de dados SQLite. `better-sqlite3` é o driver, `@libsql/client` é um cliente para o banco de dados, e `drizzle-orm` é o ORM que facilita a manipulação dos dados.
- **bcrypt, bcryptjs, jsonwebtoken:** Bibliotecas para segurança. `bcrypt` e `bcryptjs` são usadas para hash de senhas, e `jsonwebtoken` para geração e verificação de tokens de autenticação (JWT).
- **electron-forge:** Ferramenta completa para empacotar e distribuir aplicações Electron.
- **lucide-react:** Coleção de ícones bonitos e personalizáveis para React.
- **react-markdown, remark-gfm, rehype-highlight, rehype-sanitize:** Bibliotecas para renderizar conteúdo Markdown na interface do usuário, com suporte a tabelas, listas de tarefas e realce de sintaxe.

# Workflows e Processos de Contribuição

## Como Contribuir

Este guia passo a passo irá ajudá-lo a fazer suas primeiras contribuições ao Project Wiz.

1.  `git pull origin main`: _Sempre comece com o código mais recente da branch principal para evitar conflitos._
2.  `git checkout -b feature/minha-nova-funcionalidade`: _Crie um novo branch para sua tarefa. Use nomes descritivos como `feature/adicionar-autenticacao` ou `fix/corrigir-bug-login`._
3.  **Implemente sua funcionalidade/correção:** Escreva o código necessário para a sua tarefa.
4.  **Escreva testes para sua mudança:** Garanta que sua nova funcionalidade ou correção esteja coberta por testes de unidade e/ou integração. Isso ajuda a prevenir regressões e garante a qualidade do código.
5.  `git add .` e `git commit -m "feat: Adiciona nova funcionalidade X"`: _Adicione os arquivos modificados ao stage e crie um commit com uma mensagem clara e concisa. Siga as convenções de commit (veja abaixo)._
6.  `git push origin feature/minha-nova-funcionalidade`: _Envie seu branch para o repositório remoto no GitHub._
7.  **Abrir um Pull Request (PR):**
    - Vá para a página do repositório no GitHub.
    - Você verá uma opção para "Compare & pull request" ou "New pull request" para o seu branch recém-enviado.
    - Preencha a descrição do PR, explicando o que foi feito, por que foi feito e quaisquer considerações importantes.
    - Link para a issue correspondente, se houver (ex: `Closes #123`).
    - Peça a revisão de pelo menos um outro desenvolvedor da equipe.

## Mensagens de Commit

Seguimos o padrão [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/). Isso ajuda a manter um histórico de commits limpo e legível, e facilita a geração automática de changelogs.

- **Formato:** `<tipo>(<escopo>): <descrição>`
  - **tipo:** `feat` (nova funcionalidade), `fix` (correção de bug), `docs` (mudanças na documentação), `style` (formatação, sem mudança de código), `refactor` (refatoração de código), `test` (adição/correção de testes), `chore` (tarefas de build, dependências, etc.).
  - **escopo (opcional):** O módulo ou parte do sistema afetada (ex: `agent`, `ui`, `forum`).
  - **descrição:** Uma breve descrição da mudança no imperativo.

- **Exemplos:**
  - `feat(agent): Adiciona capacidade de pausar um agente`
  - `fix(login): Corrige erro de autenticação com credenciais inválidas`
  - `docs(readme): Atualiza seção de instalação`
  - `refactor(core): Otimiza lógica de dispatch de comandos`

## Ciclo de Vida do PR

- **Revisão:** Após abrir o PR, outros desenvolvedores irão revisá-lo. Eles podem deixar comentários, sugestões ou pedir alterações.
- **Endereçando Comentários:** Responda a todos os comentários e faça as alterações solicitadas. Se discordar de uma sugestão, explique o seu raciocínio.
- **Aprovação:** O PR será aprovado quando os revisores estiverem satisfeitos com as mudanças.
- **Merge:** Uma vez aprovado, o PR será mesclado na branch principal (geralmente `main`).

# Funcionalidades Chave e Módulos

O Project Wiz é composto por diversos módulos, cada um responsável por um conjunto específico de funcionalidades. Essa modularização ajuda a organizar o código e a separar as responsabilidades.

- **`automatic-persona-hiring`:** Lógica relacionada à contratação e gerenciamento automático de personas de IA.
- **`code-analysis`:** Módulo responsável por analisar o código-fonte do projeto, identificando padrões, problemas ou oportunidades de melhoria.
- **`direct-messages`:** Gerencia a funcionalidade de mensagens diretas dentro da aplicação, permitindo a comunicação entre usuários ou com agentes específicos.
- **`filesystem-tools`:** Fornece ferramentas e utilitários para interagir com o sistema de arquivos local, como leitura, escrita e manipulação de arquivos e diretórios.
- **`forum`:** Implementa o sistema de fórum interno da aplicação, onde os usuários podem criar tópicos e posts.
- **`git-integration`:** Módulo para integração com o sistema de controle de versão Git, permitindo operações como clonagem, commit, push, etc.
- **`llm-integration`:** Gerencia a integração com diferentes Large Language Models (LLMs), configurando e utilizando as APIs para comunicação com modelos como OpenAI e DeepSeek.
- **`persona-management`:** Responsável pela criação, configuração, ativação e desativação das personas de IA que atuam no Project Wiz.
- **`project-management`:** Lida com a gestão de projetos dentro da aplicação, incluindo a criação, abertura e organização de bases de código.
- **`user-settings`:** Gerencia as configurações e preferências do usuário dentro da aplicação.

# Como Manter Este Documento Atualizado (Para Todos os Contribuidores)

Este documento é a "bússola" do nosso projeto. Para garantir que ele continue útil e preciso para **todos, especialmente para quem está começando**, é crucial mantê-lo sempre atualizado e didático.

## **Princípios Essenciais para Atualização:**

- **Precisão e Clareza:** A informação deve ser 100% correta e escrita de forma que um desenvolvedor júnior possa entender sem dificuldade.
- **Detalhe Didático:** Se uma instrução ou conceito pode ser mal interpretado, adicione mais detalhes ou exemplos.
- **Consistência:** Mantenha o formato e o estilo de escrita em todo o documento.
- **Sincronia com o Código:** A documentação deve refletir o estado atual do código. Se o código muda, a documentação deve mudar também.

## **Quando e Como Atualizar:**

- **Sempre que:**
  - Uma **nova funcionalidade principal** for adicionada ou uma existente for removida/alterada significativamente.
  - A **arquitetura** do sistema sofrer mudanças importantes.
  - Um **novo padrão de design** for introduzido ou um existente for modificado.
  - **Pré-requisitos** de desenvolvimento, **comandos essenciais** ou **fluxos de trabalho** (ex: Git, PR) mudarem.
  - **Dependências principais** forem adicionadas, removidas ou atualizadas (com impacto).
  - A **estrutura de diretórios** do repositório for alterada.
- **Processo (Passos Práticos):**
  1.  **Identifique a Necessidade:** Antes de abrir um Pull Request com suas mudanças no código, pense: "Minhas alterações afetam alguma parte deste documento?"
  2.  **Edite o Documento:** Abra este arquivo (`AGENTS.md`) em seu editor.
  3.  **Atualize as Seções Relevantes:**
      - Adicione novas dependências em `# Principais Dependências`.
      - Modifique comandos em `# Guia de Desenvolvimento Local`.
      - Atualize a descrição da arquitetura em `# Arquitetura do Sistema`.
      - Revise os padrões em `# Padrões de Design e Boas Práticas`.
      - Se uma nova funcionalidade for adicionada, detalhe-a em `# Funcionalidades Chave e Módulos`.
      - Se a estrutura de pastas mudar, atualize `# Estrutura do Repositório`.
  4.  **Teste as Instruções:** Se você alterou um comando ou um passo de configuração, tente executá-lo em um ambiente limpo para garantir que as instruções funcionam.
  5.  **Peça Revisão:** Inclua este arquivo no seu Pull Request. Peça aos revisores que também verifiquem a precisão e clareza da documentação atualizada, focando na facilidade de entendimento para um júnior.
