# Arquitetura e Fluxo de Dados (architecture.md)

## Arquitetura Atual

A aplicação **project-wiz** adota uma arquitetura de múltiplos processos, padrão do **Electron**, combinada com princípios de **Design Orientado a Domínio (DDD)** e uma estrutura modular para organizar a lógica de negócios.

1.  **Arquitetura de Processos do Electron:**
    - **Main Process (`src/main`):** O coração da aplicação. É um processo Node.js com acesso total às APIs do sistema operacional. Ele gerencia o ciclo de vida da aplicação, as janelas (BrowserWindow), os menus e, mais importante, toda a lógica de negócios, acesso a banco de dados e comunicação com serviços externos. A lógica é isolada do processo de renderização para segurança e performance.
    - **Renderer Process (`src/renderer`):** A interface do usuário (UI), executada em uma janela do Chromium. É uma aplicação React (SPA) que não tem acesso direto a APIs do Node.js. Toda comunicação com o backend (Main Process) é feita de forma assíncrona através de uma ponte segura.
    - **Preload Script (`src/renderer/preload.ts`):** Uma ponte segura entre o Renderer e o Main Process. Ele expõe funcionalidades específicas do Main Process para o Renderer através de um `contextBridge`, garantindo que apenas as APIs necessárias sejam acessíveis e que a comunicação seja segura.

2.  **Design Orientado a Domínio (DDD) e Arquitetura Hexagonal (Ports and Adapters):**
    - O backend (`src/main`) é fortemente inspirado por DDD. A lógica de negócios é organizada em **módulos de domínio** (ex: `agent-management`, `project-management`).
    - Cada módulo encapsula um subdomínio específico da aplicação e contém suas próprias camadas:
      - **Domain:** Entidades, agregados e regras de negócio puras.
      - **Application:** Casos de uso (serviços de aplicação) que orquestram a lógica de domínio.
      - **Persistence:** Repositórios que implementam interfaces definidas no domínio para persistir dados (adaptadores de banco de dados).
      - **IPC (Inter-Process Communication):** Controladores que expõem os casos de uso para o Renderer Process (adaptadores de entrada).

## Estrutura de Pastas e Módulos

A estrutura de pastas reflete essa arquitetura de forma clara:

```
/src
├── main/                   # Lógica do Main Process (Backend)
│   ├── errors/             # Classes de erro customizadas
│   ├── interfaces/         # Contratos (interfaces) para serviços e repositórios
│   ├── kernel/             # Núcleo da aplicação (IoC, Event Bus, Module Loader)
│   ├── modules/            # Módulos de domínio (DDD)
│   │   ├── agent-management/
│   │   ├── project-management/
│   │   └── ...
│   ├── persistence/        # Configuração do DB (Drizzle), schemas e migrações
│   └── main.ts             # Ponto de entrada do Main Process
│
├── renderer/               # Lógica do Renderer Process (Frontend)
│   ├── app/                # Componentes de rota e layouts (TanStack Router)
│   ├── components/         # Componentes React reutilizáveis
│   ├── features/           # Lógica de UI relacionada aos módulos do backend
│   ├── hooks/              # Hooks React customizados
│   ├── lib/                # Utilitários e bibliotecas
│   └── main.tsx            # Ponto de entrada da aplicação React
│
└── shared/                 # Código compartilhado entre Main e Renderer
    └── types/              # Definições de tipos (DTOs) para comunicação IPC
```

- **`src/main/kernel`**: Contém o núcleo da arquitetura do backend. O `dependency-container.ts` configura a injeção de dependência (IoC), o `module-loader.ts` carrega os módulos de domínio, e o `event-bus.ts` permite a comunicação desacoplada entre módulos.
- **`src/main/modules`**: Onde a lógica de negócio reside. Cada subpasta é um Bounded Context do DDD, com sua própria arquitetura interna.
- **`src/renderer/features`**: Espelha a estrutura dos módulos do backend, mas contém a lógica de UI (componentes, hooks, estado) para interagir com eles.
- **`src/shared`**: Essencial para a comunicação segura. Define os Data Transfer Objects (DTOs) que são trocados entre o Main e o Renderer, garantindo um contrato de dados consistente.

## Fluxo de Dados

Um fluxo de requisição típico, como "criar um novo projeto", segue os seguintes passos:

1.  **Usuário (UI):** O usuário preenche um formulário na interface React (`renderer/features/project-management/components/create-project-form.tsx`) e clica em "Salvar".

2.  **Componente React:** O componente chama uma função que invoca a API exposta pelo Preload Script.

    ```typescript
    // Exemplo no Renderer Process
    const handleCreateProject = async (data) => {
      await window.api.project.create(data);
    };
    ```

3.  **Preload Script (`preload.ts`):** O script recebe a chamada e a encaminha para o canal IPC correspondente, enviando os dados para o Main Process.

    ```typescript
    // Exemplo no Preload Script
    contextBridge.exposeInMainWorld("api", {
      project: {
        create: (data) => ipcRenderer.invoke("project:create", data),
      },
    });
    ```

4.  **IPC Handler (Main Process):** Um handler no Main Process, geralmente no `ipc` de um módulo (`main/modules/project-management/ipc/project.handlers.ts`), escuta no canal `project:create`.

5.  **Serviço de Aplicação:** O handler invoca o serviço de aplicação correspondente (`ProjectService.ts`), que contém o caso de uso para criar um projeto.

6.  **Domínio e Repositório:** O serviço de aplicação executa a lógica de domínio (validações, criação da entidade `Project`) e chama o repositório (`ProjectRepository.ts`) para persistir os dados no banco de dados SQLite via Drizzle ORM.

7.  **Retorno:** O resultado (sucesso ou erro) é retornado pela cadeia de chamadas:
    - O repositório retorna para o serviço.
    - O serviço retorna para o handler IPC.
    - O handler IPC retorna o resultado para o Preload Script através do `ipcRenderer.invoke`.
    - O Preload Script retorna o resultado para o componente React, que atualiza a UI para refletir a mudança (ex: exibindo uma notificação de sucesso ou erro).

Este fluxo garante que a UI (Renderer) permaneça desacoplada e segura, enquanto a lógica de negócios complexa é gerenciada de forma robusta e organizada no Main Process.
