# 9. Funcionalidade: Gerenciamento de Projetos

**Versão:** 3.0  
**Status:** Design Final  
**Data:** 2025-01-17  

---

## 🎯 Visão da Funcionalidade

O gerenciamento de projetos é a espinha dorsal da colaboração no Project Wiz. Cada projeto funciona como um workspace autocontido, com sua própria base de código, equipe de agentes e canais de comunicação. A interface é modelada a partir de servidores do Discord para criar uma experiência familiar.

---

## 1. Ciclo de Vida do Projeto

O usuário pode criar, listar e arquivar projetos.

### Implementação Técnica

-   **Backend**: A lógica está centralizada no Bounded Context `project` (`src/main/project/`).
    -   O `ProjectService` (`@/main/project/project.service.ts`) gerencia todas as operações de CRUD (Criar, Ler, Atualizar, Deletar) para os projetos.
    -   O `projects.schema.ts` define a estrutura da tabela de projetos no banco de dados.
-   **Frontend**: A UI é gerenciada pela feature `project` (`src/renderer/features/project/`).
    -   O hook `use-projects.ts` busca a lista de projetos do usuário e fornece a função `createProject`.
    -   Componentes como `project-card.tsx` e `project-form.tsx` são usados para exibir e criar projetos.

### Fluxo de Criação

1.  O usuário clica no botão para adicionar um novo projeto.
2.  Um modal com o `ProjectForm` é exibido.
3.  O usuário pode optar por:
    -   **Criar um projeto do zero**: O sistema inicializa um novo repositório Git localmente.
    -   **Clonar de uma URL**: O sistema clona o repositório Git fornecido.
4.  O `ProjectService` no backend é chamado, que por sua vez utiliza o `GitService` para a operação de repositório e cria os registros necessários no banco de dados, incluindo os canais padrão.

---

## 2. Configurações do Projeto

Cada projeto possui um painel de configurações específico.

### Implementação Técnica

-   **Backend**: As configurações são salvas como um campo JSON na tabela `projectsTable`. O `ProjectService` fornece métodos para atualizar essas configurações.
-   **Frontend**: A rota `@/renderer/app/project/[project-id]/settings/` leva à página de configurações.
    -   Um hook `use-project-settings.ts` é responsável por buscar e salvar as configurações do projeto específico.

### Funcionalidades de Configuração

-   **Contratação Automática de Personas**: Uma das configurações mais importantes. Quando ativada, o sistema pode analisar a base de código do projeto (usando a camada de Análise de Código) para identificar as tecnologias usadas (ex: React, Python, Docker) e automaticamente "contratar" (associar) Personas com a expertise correspondente ao projeto.
-   **Gerenciamento de Nome e Descrição**: Permite ao usuário atualizar as informações básicas do projeto.
