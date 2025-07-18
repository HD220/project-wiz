# 4. Camada Frontend (Renderer Process)

**Versão:** 3.0  
**Status:** Design Final  
**Data:** 2025-01-17  

---

## 🎯 Visão Geral do Frontend

A camada de frontend é responsável por toda a interface e experiência do usuário. Construída com **React 19**, **TypeScript** e **TailwindCSS**, ela espelha a organização de domínios do backend para manter a consistência e a clareza. Seus pilares são: **Sistema de Roteamento**, **Gerenciamento de Estado** e **Arquitetura de Features**.

---

## 1. Sistema de Roteamento (TanStack Router)

Utilizamos o **TanStack Router** pelo seu roteamento **type-safe e baseado em arquivos**, que simplifica a criação de páginas e layouts.

-   **Estrutura**: As rotas são definidas pela estrutura de pastas em `src/renderer/app/`.
-   **Layouts Aninhados**: Arquivos `route.tsx` dentro de uma pasta criam um layout para todas as rotas filhas, permitindo estruturas complexas como a do Discord.
-   **Carregamento de Dados**: Cada rota pode ter uma função `loader` que busca os dados necessários antes da renderização, simplificando o gerenciamento de estados de loading e erro.

**Exemplo de Rota com Layout e Loader:**

```typescript
// src/renderer/app/project/$projectId/route.tsx
import { createFileRoute, Outlet } from '@tanstack/react-router';
import { ChannelSidebar } from '@/renderer/features/project/components/channel-sidebar';

// Este arquivo cria um layout para a rota /project/:projectId
export const Route = createFileRoute('/project/$projectId')({
  // Carrega os dados do projeto antes de renderizar qualquer rota filha
  loader: async ({ params }) => {
    return window.api.projects.findById(params.projectId);
  },
  component: ProjectLayout,
});

function ProjectLayout() {
  const project = Route.useLoaderData();
  // O Outlet renderizará as rotas filhas (ex: chat, issues)
  return (
    <div className="discord-layout">
      <ChannelSidebar project={project} />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
```

---

## 2. Arquitetura de Features (Domain-Driven)

A UI é organizada em `features`, que espelham os Bounded Contexts do backend. Isso mantém a lógica de frontend relacionada a um domínio de negócio no mesmo lugar.

**Estrutura de uma Feature:**

```
src/renderer/features/
└── project/                  # Feature relacionada ao domínio "Project"
    ├── components/           # Componentes React específicos do projeto
    │   ├── project-card.tsx
    │   └── kanban-board.tsx  # Componente do agregado Issues
    └── hooks/                # Hooks React para lógica do projeto
        ├── use-projects.ts
        └── use-issues.ts     # Hook do agregado Issues
```

-   **`components/`**: Contém componentes React que são específicos para esta feature. Por exemplo, `features/project/components/kanban-board.tsx` é usado para exibir as issues de um projeto.
-   **`hooks/`**: Contém hooks React que encapsulam a lógica de estado e acesso a dados para a feature. Por exemplo, `use-issues` buscaria as issues do backend e forneceria métodos para criá-las e atualizá-las.

---

## 3. Gerenciamento de Estado

Adotamos uma abordagem dupla para o gerenciamento de estado, usando a ferramenta certa para cada tipo de dado.

### TanStack Query: Estado do Servidor

É a nossa ferramenta padrão para gerenciar dados que vêm do backend. Todas as chamadas IPC que buscam ou modificam dados devem ser envolvidas pelo TanStack Query (geralmente dentro de um hook de feature).

-   **Benefícios**: Gerenciamento automático de cache, `loading` e `error` states, `refetching` e `optimistic updates`.

**Exemplo de Hook de Feature com TanStack Query:**

```typescript
// src/renderer/features/project/hooks/use-issues.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useIssues(projectId: string) {
  const queryClient = useQueryClient();

  // Query para buscar as issues
  const { data: issues, isLoading } = useQuery({
    queryKey: ['issues', projectId], // Chave de cache única
    queryFn: () => window.api.issues.listByProject(projectId),
  });

  // Mutation para atualizar o status de uma issue
  const { mutate: updateIssueStatus } = useMutation({
    mutationFn: (variables: { issueId: string; status: string }) =>
      window.api.issues.updateStatus(variables.issueId, variables.status),
    onSuccess: () => {
      // Invalida a query para buscar os dados atualizados
      queryClient.invalidateQueries({ queryKey: ['issues', projectId] });
    },
  });

  return { issues, isLoading, updateIssueStatus };
}
```

### Zustand: Estado Global da UI

Zustand é usado para estados que não pertencem ao servidor e que precisam ser compartilhados globalmente, como:

-   Estado de autenticação do usuário.
-   Preferências de UI (ex: tema dark/light).
-   Estado de componentes globais (ex: se uma sidebar está aberta ou fechada).

---

## 4. Componentes de UI Reutilizáveis

Componentes que são puramente visuais e não estão atrelados a nenhum domínio de negócio específico residem em `src/renderer/components/`.

-   **`components/ui/`**: Componentes base da biblioteca `shadcn/ui` (Button, Input, Card, etc.).
-   **`components/layout/`**: Componentes que definem a estrutura da aplicação, como `DiscordLayout`, `Sidebar`, `Header`, etc. Eles consomem dados, mas não contêm lógica de negócio própria.