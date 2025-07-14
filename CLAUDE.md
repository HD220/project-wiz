# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

# Arquitetura do Sistema

O Project Wiz é uma aplicação desktop construída com Electron, o que significa que ela possui dois processos principais: o **Processo Principal (Main Process)** e o **Processo de Renderização (Renderer Process)**.

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
  - Modelos de Linguagem Grandes (LLMs) como OpenAI e DeepSeek usando a lib `ai-sdk`.
  - O Processo Principal se comunica com esses serviços via APIs para realizar tarefas inteligentes, como geração de código, análise e planejamento.

# Padrões de Design e Boas Práticas

O Project Wiz segue rigorosamente diversos padrões de design e boas práticas para garantir um código de alta qualidade, manutenível e escalável.

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
├── CLAUDE.md                # Este documento!
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
└── src/                     # Código-fonte principal da aplicação
    ├── main/                # Código do Processo Principal (Node.js/Electron)
    │   ├── modules/         # Módulos de domínio (bounded contexts)
    │   └── persistence/     # Configuração global de persistência (Drizzle, migrações)
    │       ├── db.ts        # Configuração da conexão com o banco de dados
    │       └── migrations/  # Arquivos de migração do banco de dados
    ├── renderer/            # Código do Processo de Renderização (React UI)
    │   ├── app/             # Paginas/Rotas da aplicação
    │   ├── components/      # Componentes React específicos da aplicação
    │   ├── features/        # Módulos de funcionalidades da UI (ex: direct-messages, forum)
    │   ├── hooks/           # Hooks React personalizados
    │   ├── lib/             # Funções utilitárias
    │   └── styles/          # Estilos globais (Tailwind CSS)
    └── shared/              # Código compartilhado entre Main e Renderer (apenas tipos e interfaces para comunicação IPC. **Importante: Este diretório não deve conter lógica de negócio ou implementações, apenas definições de tipos, para evitar dependências cíclicas e garantir a separação entre os processos Main e Renderer do Electron**)
```

# Guia de Desenvolvimento Local

Este guia irá ajudá-lo a configurar o ambiente de desenvolvimento do Project Wiz em sua máquina.

## Comandos Essenciais

Aqui estão os comandos mais importantes que você usará durante o desenvolvimento:

- **Para Iniciar a Aplicação Localmente (Modo Desenvolvimento):**

  ```bash
  npm run dev
  # ou
  npm start (alias para npm run dev)
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

- **Para Formatar o Código:**

  ```bash
  npm run format
  ```

  _Formata automaticamente o código usando Prettier._

- **Para Verificar Formatação:**

  ```bash
  npm run format:check
  ```

  _Verifica se o código está formatado corretamente sem fazer alterações._

- **Para Recompilar Dependências Nativas:**
  ```bash
  npm run rebuild
  ```
  _Recompila dependências nativas como better-sqlite3 quando necessário._

# Principais Dependências

Aqui estão algumas das bibliotecas e frameworks mais importantes que o Project Wiz utiliza, com uma breve explicação do seu propósito:

- **@ai-sdk/deepseek, @ai-sdk/openai, ai:** Conjunto de bibliotecas para integração com modelos de linguagem grandes (LLMs) como DeepSeek e OpenAI, permitindo que os agentes de IA se comuniquem e utilizem esses modelos.
- **@radix-ui/\*:** Coleção de componentes React de baixo nível e acessíveis para construir interfaces de usuário robustas e personalizáveis. Usados como base para os componentes da UI.
- **@tanstack/react-router:** Roteador de próxima geração para React, focado em segurança de tipo e desempenho, usado para gerenciar a navegação entre as diferentes telas da aplicação.
- **@tanstack/react-query:** Biblioteca para gerenciamento de estado assíncrono, cache e sincronização de dados no React. Essencial para lidar com a comunicação com o backend e APIs externas.
- **@hookform/resolvers, react-hook-form:** Bibliotecas para construção e validação de formulários no React, integradas com esquemas de validação como Zod.
- **zod:** Biblioteca de declaração e validação de esquemas com segurança de tipo. Usada para garantir que os dados de entrada e saída estejam no formato correto.
- **zustand:** Biblioteca de gerenciamento de estado global.
- **@libsql/client, better-sqlite3, drizzle-orm:** Conjunto de ferramentas para interagir com o banco de dados SQLite. `better-sqlite3` é o driver, `@libsql/client` é um cliente para o banco de dados, e `drizzle-orm` é o ORM que facilita a manipulação dos dados.
- **bcrypt, bcryptjs, jsonwebtoken:** Bibliotecas para segurança. `bcrypt` e `bcryptjs` são usadas para hash de senhas, e `jsonwebtoken` para geração e verificação de tokens de autenticação (JWT).
- **electron-forge:** Ferramenta completa para empacotar e distribuir aplicações Electron.
- **lucide-react:** Coleção de ícones bonitos e personalizáveis para React.
- **react-markdown, remark-gfm, rehype-highlight, rehype-sanitize:** Bibliotecas para renderizar conteúdo Markdown na interface do usuário, com suporte a tabelas, listas de tarefas e realce de sintaxe.

# Módulos de Domínio e Arquitetura

O Project Wiz segue uma arquitetura modular baseada em Domain-Driven Design (DDD), onde cada módulo representa um bounded context específico:

## Módulos Principais

- **agent-management:** Gerenciamento de agentes de IA (Personas) - entidades, serviços e persistência para criação e configuração de agentes
- **channel-messaging:** Sistema de mensagens em canais com suporte a chat de IA, incluindo serviços de chat e tipagem em tempo real
- **communication:** Gerenciamento de canais de comunicação entre usuários e agentes
- **direct-messages:** Sistema de mensagens diretas e conversas privadas entre usuários e agentes
- **llm-provider:** Integração com provedores de Large Language Models (OpenAI, DeepSeek), incluindo serviços de criptografia e geração de texto
- **project-management:** Gerenciamento de projetos, incluindo entidades, repositórios e serviços

## Padrões Arquiteturais

### Estrutura de Módulo Padrão

Cada módulo segue a estrutura:

```
module-name/
├── domain/           # Entidades de domínio e regras de negócio
├── application/      # Serviços de aplicação e casos de uso
├── persistence/      # Repositórios e esquemas de banco de dados
├── ipc/             # Handlers para comunicação Inter-Process Communication
└── *.mapper.ts      # Mapeadores entre camadas (domain <-> persistence <-> dto)
```

### Comunicação IPC (Inter-Process Communication)

- O frontend (renderer) se comunica com o backend (main) via IPC handlers
- Cada módulo possui seus próprios handlers em `ipc/handlers.ts`
- Tipos compartilhados ficam em `src/shared/types/` (apenas tipos, sem lógica)

### Gerenciamento de Estado no Frontend

- **Zustand:** Para estado global da aplicação
- **TanStack Query:** Para cache e sincronização de dados assíncronos
- **React Hook Form + Zod:** Para validação e gerenciamento de formulários

# Workflows e Processos de Contribuição

## Como Contribuir

Este guia passo a passo irá ajudá-lo a fazer suas primeiras contribuições ao Project Wiz.

1.  `git pull origin jules-new-archtecture`: _Sempre comece com o código mais recente da branch principal (atualmente jules-new-archtecture) para evitar conflitos._
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
  2.  **Edite o Documento:** Abra este arquivo (`CLAUDE.md`) em seu editor.
  3.  **Atualize as Seções Relevantes:**
      - Adicione novas dependências em `# Principais Dependências`.
      - Modifique comandos em `# Guia de Desenvolvimento Local`.
      - Atualize a descrição da arquitetura em `# Arquitetura do Sistema`.
      - Revise os padrões em `# Padrões de Design e Boas Práticas`.
      - Se uma nova funcionalidade for adicionada, detalhe-a em `# Funcionalidades Chave e Módulos`.
      - Se a estrutura de pastas mudar, atualize `# Estrutura do Repositório`.
  4.  **Teste as Instruções:** Se você alterou um comando ou um passo de configuração, tente executá-lo em um ambiente limpo para garantir que as instruções funcionam.
  5.  **Peça Revisão:** Inclua este arquivo no seu Pull Request. Peça aos revisores que também verifiquem a precisão e clareza da documentação atualizada, focando na facilidade de entendimento para um júnior.
