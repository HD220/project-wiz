# Project Wiz [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Visão Geral

O Project Wiz é uma aplicação desktop desenvolvida com Electron, apresentando uma interface de usuário inspirada no Discord. Seu objetivo principal é funcionar como uma fábrica de software autônoma, onde agentes de Inteligência Artificial, chamados Personas, colaboram e auxiliam no processo de desenvolvimento de software.

## Principais Funcionalidades

### Interface do Usuário (Estilo Discord)

A interface do Project Wiz é projetada para ser familiar e intuitiva, seguindo o layout popular do Discord. Ela é dividida em:

*   **Home:** Uma visão geral inicial da aplicação.
*   **Visão por Projeto:** Permite ao usuário gerenciar e interagir com diferentes projetos de software.
*   **Canais de Chat:** Canais dedicados para comunicação e interação com as Personas e para visualização de logs e resultados de tarefas.

### Agentes Autônomos (Personas)

Personas são agentes de IA especializados, cada um com:

*   **Papel (Role):** Define a especialização do agente (ex: Desenvolvedor Frontend, Analista de Testes).
*   **Objetivos (Goals):** Metas específicas que o agente tenta alcançar.
*   **Backstory:** Uma breve história que dá contexto à sua "personalidade" e especialização.

As Personas são capazes de executar **Jobs** (tarefas) de forma autônoma ou semi-autônoma. Para isso, elas utilizam um conjunto de ferramentas (Tools) pré-definidas, como:

*   `MemoryTool`: Para acessar e armazenar informações.
*   `TaskTool`: Para gerenciar e executar subtarefas.
*   Outras ferramentas especializadas conforme a necessidade do Job.

### Sistema de Gerenciamento de Tarefas (Jobs)

O sistema de Jobs é o coração da funcionalidade de automação do Project Wiz.

*   **Jobs:** Representam unidades de trabalho que as Personas podem executar. Cada Job possui um ciclo de vida definido (ex: Pendente, Em Progresso, Concluído, Falhou).
*   **Filas (Queues):** Os Jobs são organizados em filas, permitindo o processamento ordenado e a priorização de tarefas.
*   **Ciclo de Vida:** Um Job passa por diferentes status desde sua criação até a conclusão, permitindo o acompanhamento e gerenciamento do progresso.

## Arquitetura

### Visão Geral da Arquitetura

O Project Wiz é construído sobre uma arquitetura moderna e robusta, utilizando:

*   **Electron:** Para o desenvolvimento da aplicação desktop multiplataforma.
*   **React (com Vite):** Para a construção da interface do usuário.
*   **Node.js:** Como ambiente de execução para o backend e lógica core.
*   **TypeScript:** Para tipagem estática e desenvolvimento mais seguro.
*   **SQLite (com Drizzle ORM):** Para persistência de dados local.

### Princípios de Design

A arquitetura do projeto segue princípios de:

*   **Arquitetura Limpa (Clean Architecture):** Para separação de responsabilidades e desacoplamento entre as camadas da aplicação (Interface, Casos de Uso, Entidades, Infraestrutura).
*   **Domain-Driven Design (DDD):** Foco no domínio do problema, modelando entidades e lógica de negócios de forma clara e coesa.

### Componentes Chave

*   **Personas Core:** Módulo responsável pela lógica e gerenciamento dos agentes de IA.
*   **Sistema de Jobs/Queue:** Gerencia a criação, execução e o ciclo de vida das tarefas.
*   **Módulos LLM:** Integração com modelos de linguagem grande (LLMs) para alimentar a inteligência das Personas.
*   **Interface do Usuário (React):** Camada de apresentação da aplicação.
*   **Camada de Infraestrutura:** Responsável pela persistência de dados (SQLite com Drizzle ORM), comunicação com APIs externas, etc.

## Tecnologias Utilizadas

*   **Frontend:**
    *   React
    *   Vite
    *   Tailwind CSS
    *   shadcn/ui (biblioteca de componentes UI)
    *   React Router DOM
*   **Backend & Core:**
    *   Node.js
    *   Electron
    *   TypeScript
*   **IA:**
    *   (Detalhes da integração com LLMs a serem especificados conforme evolução)
*   **Banco de Dados:**
    *   SQLite
    *   Drizzle ORM
*   **Build/Package:**
    *   Electron Forge
    *   Electron Builder
    *   Vite
    *   TypeScript Compiler (tsc)
*   **Testes:**
    *   Vitest
    *   Testing Library (React)
*   **Linting:**
    *   ESLint
    *   Prettier

## Como Começar (Desenvolvimento)

### Pré-requisitos

*   Node.js (versão recomendada no `.nvmrc` ou a mais recente LTS)
*   npm ou yarn (ou pnpm, conforme `packageManager` no `package.json`)

### Instalação e Execução

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/seu-usuario/project-wiz.git
    cd project-wiz
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    # ou
    yarn install
    # ou
    pnpm install
    ```

3.  **Execute em modo de desenvolvimento:**
    ```bash
    npm run dev
    # ou
    yarn dev
    # ou
    pnpm dev
    ```
    Isso iniciará a aplicação Electron com hot-reload para o frontend e backend.

### Scripts Úteis

*   `npm run build`: Compila a aplicação para produção.
*   `npm run package`: Empacota a aplicação para distribuição.
*   `npm run make`: Cria instaladores para a aplicação.
*   `npm test`: Executa os testes unitários e de integração.
*   `npm run lint`: Executa o linter para verificar a qualidade do código.
*   `npm run lint:fix`: Tenta corrigir automaticamente os problemas de lint.
*   `npm run db:generate`: Gera as migrações do banco de dados com base nas definições do Drizzle ORM.
*   `npm run db:migrate`: Aplica as migrações pendentes ao banco de dados.
*   `npm run db:studio`: Abre o Drizzle Studio para visualização e gerenciamento do banco de dados.

## Status do Projeto

O Project Wiz está atualmente em **desenvolvimento ativo**. Muitas das funcionalidades core estão sendo implementadas e refinadas. Funcionalidades como a persistência completa de Personas e a expansão das suas capacidades de interação ainda estão em andamento.

## Como Contribuir

Agradecemos o interesse em contribuir com o Project Wiz! No momento, estamos focados em estabelecer a arquitetura e as funcionalidades principais. Em breve, forneceremos diretrizes mais detalhadas sobre como contribuir.

Por enquanto, sinta-se à vontade para:

1.  Abrir Issues para relatar bugs ou sugerir novas funcionalidades.
2.  Fork o repositório e explorar o código.

## Licença

Este projeto está licenciado sob a **Licença MIT**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
---
**Observação:** O arquivo `LICENSE` mencionado acima ainda não existe no repositório. Ele precisará ser criado com o texto da licença MIT.
