# Arquitetura e Design

## Visão Geral

O Project Wiz é uma aplicação Electron que utiliza React no frontend e Node.js no backend (com comunicação IPC). O objetivo é fornecer uma interface para automatizar tarefas de desenvolvimento usando LLMs.

## Estrutura de Pastas

A aplicação segue uma estrutura organizada por processos Electron e responsabilidades:

```plaintext
src/
├── client/       # Processo renderer (frontend)
│   ├── components/ # Componentes customizados
│   │   └── ui/    # Componentes shadcn/ui
│   ├── hooks/    # Custom hooks
│   ├── services/ # Serviços frontend
│   ├── utils/    # Utilitários específicos
│   ├── styles/   # Estilos globais
│   └── lib/      # Bibliotecas auxiliares
│
├── core/         # Processo main (backend)
│   ├── main/     # Código principal
│   ├── preload/  # Código de preload
│   ├── services/ # Serviços backend
│   │   └── llm/  # Implementação dos serviços LLM
│   ├── utils/    # Utilitários do backend
│   └── events/   # Comunicação IPC
│
└── shared/       # Recursos compartilhados
    ├── types/    # Tipos TypeScript
    ├── constants/# Constantes e enums
    └── config/   # Configurações
```

Esta estrutura está documentada no [ADR-0005](adr/ADR-0005-Estrutura-de-Pastas-Electron.md).

## Componentes Principais

### Frontend (src/client)
- **ui/**: Componentes React organizados por funcionalidade:
  - App.tsx: Componente principal
  - Dashboard, ActivityLog, Documentation, RepositorySettings, ModelSettings
- **hooks/**: Custom hooks (useLLM, useMobile, etc)
- **services/**: Chamadas de API e integrações frontend
- **utils/**: Utilitários específicos do frontend

### Core (src/core)
- **main/**:
  - main.ts: Processo principal do Electron
- **preload/**:
  - preload.ts: Exposição segura de APIs Node.js
- **services/**:
  - llm/: Implementação dos serviços LLM
  - Outros serviços backend
- **events/**:
  - bridge.ts: Comunicação IPC entre processos

### Shared (src/shared)
- **types/**: Tipos TypeScript compartilhados
- **constants/**: Constantes e enums globais
- **config/**: Configurações compartilhadas

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
