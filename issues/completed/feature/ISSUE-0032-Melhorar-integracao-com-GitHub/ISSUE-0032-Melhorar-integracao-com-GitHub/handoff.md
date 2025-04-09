## Handoff

### Implementação

Foi implementada a integração com o GitHub utilizando a API do Octokit. As seguintes tarefas foram realizadas:

-   Criação do serviço `GithubService` para encapsular a lógica de interação com a API do GitHub.
-   Exposição da função `getIssue` através do `contextBridge` para permitir a comunicação entre o frontend e o backend.
-   Modificação do componente `RepositorySettings` para chamar a função `getIssue` exposta no `preload.ts`.

### Próximos passos

-   Implementar a autenticação com Octokit.
-   Adicionar suporte à criação de PRs.
-   Implementar análise de issues.
-   Documentar a integração.
-   Criar testes unitários e de integração.

### Arquivos modificados

-   `src/core/main.ts`
-   `src/core/preload.ts`
-   `src/client/components/repository-settings.tsx`

### Commits

-   Adicionado handler para a função `getIssue` no `src/core/main.ts`.
-   Exposto a função `getIssue` no `src/core/preload.ts`.
-   Modificado o componente `RepositorySettings` para chamar a função `getIssue` exposta no `preload.ts`.