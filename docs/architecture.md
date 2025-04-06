# Arquitetura e Design

## Visão Geral

O Project Wiz é uma aplicação Electron que utiliza React no frontend e Node.js no backend (com comunicação IPC). O objetivo é fornecer uma interface para automatizar tarefas de desenvolvimento usando LLMs.

## Componentes Principais

- **Frontend (src/client)**:
  - **App.tsx**: Componente principal da aplicação, responsável por renderizar a interface do usuário e gerenciar o layout.
  - **Componentes da interface do usuário**: Componentes React que implementam as diferentes seções da aplicação (Dashboard, ActivityLog, Documentation, RepositorySettings, ModelSettings).
  - **Hooks**: Custom hooks para lidar com a lógica da aplicação (ex: `use-llm.ts` para interagir com os modelos LLM).
- **Core (src/core)**:
  - **main.ts**: Processo principal do Electron, responsável por criar a janela da aplicação e gerenciar a comunicação com o sistema operacional.
  - **preload.ts**: Script de pré-carregamento que expõe APIs do Node.js para o frontend de forma segura.
  - **events/bridge.ts**: Gerencia a comunicação entre o processo principal e o processo de renderização (frontend) usando IPC.
  - **services/**: Contém os serviços da aplicação, como o serviço de LLM (em desenvolvimento).
- **Backend (Em desenvolvimento)**:
  - API para comunicação com o GitHub (usando Octokit) e os modelos LLM.
  - Lógica para automatizar tarefas de desenvolvimento.

## Fluxo de Dados

1.  **Interação do Usuário**: O usuário interage com a interface do usuário (React).
2.  **Chamadas de API**: A interface do usuário envia solicitações para o backend (via IPC).
3.  **Processamento no Backend**: O backend processa as solicitações, que podem envolver:
    - Comunicação com o GitHub (usando Octokit).
    - Comunicação com os modelos LLM.
    - Execução de tarefas de desenvolvimento.
4.  **Retorno dos Resultados**: O backend retorna os resultados para o frontend (via IPC).
5.  **Atualização da Interface**: O frontend atualiza a interface do usuário com os resultados.

## Tecnologias Utilizadas

- Electron
- React
- TypeScript
- Vite
- Shadcn/ui (para componentes da interface)
- Node.js
- GitHub API (via Octokit)
- Modelos LLM (ex: Mistral, Llama 2)
