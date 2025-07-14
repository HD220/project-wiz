# Visão Geral Técnica (overview.md)

## Descrição Resumida

O **project-wiz** é uma aplicação de desktop multiplataforma (Windows, macOS, Linux) construída com Electron, React e TypeScript. Seu principal objetivo é fornecer uma interface integrada para que desenvolvedores e equipes possam interagir com modelos de linguagem grande (LLMs), gerenciar projetos de software e se comunicar de forma eficiente.

A aplicação funciona como um assistente de desenvolvimento, permitindo aos usuários:

- Conectar-se a diferentes provedores de LLM (como OpenAI, Anthropic, etc.).
- Criar e gerenciar projetos, organizando conversas e interações com a IA.
- Manter conversas com agentes de IA em canais ou mensagens diretas.
- Automatizar tarefas de desenvolvimento e obter insights a partir de modelos de IA.

O público-alvo são desenvolvedores de software, engenheiros de IA, gerentes de projeto e equipes de tecnologia que buscam otimizar seu fluxo de trabalho com o auxílio de inteligência artificial.

## Principais Tecnologias

A aplicação utiliza um stack de tecnologias moderno e robusto:

- **Framework Principal:** [Electron](https://www.electronjs.org/) para a criação da aplicação de desktop.
- **Frontend:**
  - [React](https://react.dev/) para a construção da interface de usuário.
  - [TypeScript](https://www.typescriptlang.org/) para tipagem estática.
  - [Vite](https://vitejs.dev/) como ferramenta de build e servidor de desenvolvimento.
  - [SWC](https://swc.rs/) como compilador Rust para JavaScript/TypeScript.
  - [TanStack Router](https://tanstack.com/router/) para gerenciamento de rotas.
  - [Tailwind CSS](https://tailwindcss.com/) para estilização.
  - [LinguiJS](https://lingui.dev/) para internacionalização (i18n).
- **Backend (Processo Principal do Electron):**
  - [TypeScript](https://www.typescriptlang.org/) e [Node.js](https://nodejs.org/).
  - [Drizzle ORM](https://orm.drizzle.team/) para interação com o banco de dados.
  - [SQLite](https://www.sqlite.org/) como banco de dados local.
- **Testes:**
  - [Vitest](https://vitest.dev/) para testes unitários e de integração.
- **Build e Empacotamento:**
  - [Electron Forge](https://www.electronforge.io/) para empacotar e distribuir a aplicação.

## Diagrama Geral de Componentes

A aplicação é dividida em três processos principais, seguindo o padrão do Electron:

1.  **Processo Principal (Main Process):**
    - Responsável pela lógica de negócios, gerenciamento de janelas, acesso ao sistema de arquivos e comunicação com o banco de dados.
    - Carrega os módulos da aplicação (ex: `AgentManagementModule`, `ProjectManagementModule`).
    - Expõe funcionalidades para o Processo de Renderer através de IPC (Comunicação Inter-Processos).

2.  **Processo de Pré-carregamento (Preload Process):**
    - Script que roda em um contexto privilegiado, com acesso tanto ao DOM do navegador quanto às APIs do Node.js.
    - Atua como uma ponte segura entre o Renderer e o Main Process, expondo APIs específicas através do objeto `window`.

3.  **Processo de Renderização (Renderer Process):**
    - Responsável pela interface do usuário (UI), construída em React.
    - É executado em uma janela do Chromium e não tem acesso direto às APIs do Node.js por questões de segurança.
    - Comunica-se com o Main Process através das APIs expostas pelo Preload Script para executar operações de backend.

## Links para Documentos Técnicos Relacionados

- [Arquitetura e Fluxo de Dados](./architecture.md)
- [Módulos do Sistema](./modules.md)
- [Configuração do Ambiente e Deploy](./devops.md)
- [Padrões e Convenções](./contributing.md)
