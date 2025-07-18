# 10. Funcionalidade: Gerenciamento de Agentes (Equipe de IA)

**Versão:** 3.0  
**Status:** Design Final  
**Data:** 2025-01-17  

---

## 🎯 Visão da Funcionalidade

O gerenciamento de Agentes transforma a complexa tarefa de configurar agentes de IA em um processo intuitivo de "formar uma equipe". O usuário pode montar um time de especialistas de IA para cada projeto, seja manualmente ou através de sugestões automáticas do sistema.

---

## 1. Contratação de Agentes

O sistema oferece duas maneiras de adicionar agentes a um projeto.

### Contratação Automática

-   **Visão**: Para simplificar o setup inicial, o sistema pode analisar o código de um projeto e sugerir ou "contratar" automaticamente os especialistas de IA mais relevantes.
-   **Implementação Técnica**:
    -   Esta funcionalidade é orquestrada pelo `ProjectService` no backend.
    -   Quando um projeto é criado ou quando o usuário solicita, uma análise é disparada. O sistema usa uma **Camada de Análise de Código** para inspecionar o repositório, identificando linguagens, frameworks e dependências (ex: `package.json`, `requirements.txt`).
    -   Com base na stack tecnológica identificada, o `ProjectService` interage com o `AgentService` para encontrar ou criar Agentes com a `expertise` correspondente e associá-las ao projeto.
    -   O usuário é notificado no canal `#general` sobre o novo "membro da equipe".

### Criação Manual

-   **Visão**: O usuário tem controle total para criar Agentes customizadas, definindo suas habilidades e personalidades através de um assistente (wizard).
-   **Implementação Técnica**:
    -   **Backend**: A lógica reside no Bounded Context `agents` (`src/main/agents/`). O `AgentService` lida com a criação e persistência dos agentes.
    -   **Frontend**: A UI é gerenciada pela feature `agents` (`src/renderer/features/agents/`).
        -   A rota `@/renderer/app/agents/create/` leva ao wizard de criação.
        -   O hook `use-agents.ts` fornece a função `createAgent`, que chama a API IPC.
        -   O wizard guia o usuário na definição de:
            -   **Nome e Aparência**: Avatar e nome do agente.
            -   **Role e Expertise**: Papel (ex: `developer`) e habilidades (`react`, `css`).
            -   **Personalidade**: Um `systemPrompt` que define o tom e o comportamento do agente. O sistema pode oferecer templates (ex: "Engenheiro Sênior prestativo", "Arquiteto de Software rigoroso").

---

## 2. Gerenciamento da Equipe

O usuário pode visualizar e gerenciar a equipe de Agentes de cada projeto.

### Implementação Técnica

-   **Backend**: O `ProjectService` e o `AgentService` colaboram para gerenciar a associação entre projetos e agentes, que é armazenada na tabela de junção `projectAgentsTable`.
-   **Frontend**: A lista de membros do projeto, incluindo usuários e Agentes, é exibida na sidebar direita da interface do projeto.
    -   O hook `use-project-members.ts` busca os dados dos membros.
    -   O usuário pode clicar em uma Persona para ver seus detalhes ou removê-la do projeto (o que a "demite" da equipe).
