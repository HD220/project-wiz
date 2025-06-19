# 08: Uso de Worktrees Git por Agentes de IA

## 8.1. Introdução

Para tarefas que envolvem a modificação ou análise de código-fonte gerenciado por Git, os Agentes de IA utilizarão **worktrees Git**. Um worktree Git permite que múltiplos branches sejam checados e trabalhados simultaneamente em diferentes diretórios, todos vinculados ao mesmo repositório Git local. Isso oferece um ambiente isolado para cada tarefa do agente, evitando conflitos entre tarefas concorrentes e simplificando a limpeza após a conclusão.

Esta abordagem é particularmente útil para:
*   Implementar novas funcionalidades em branches dedicados.
*   Realizar refatorações de código.
*   Corrigir bugs.
*   Executar análises de código ou testes em um estado específico do repositório.

## 8.2. Fluxo de Trabalho Proposto

O fluxo de trabalho para um Agente de IA utilizando um worktree Git para uma tarefa de desenvolvimento ou análise de código seria o seguinte:

1.  **Recebimento da Tarefa:**
    *   Um `Job` é atribuído a um `AIAgent` através do sistema de filas.
    *   O `Job.payload` conterá informações essenciais, como:
        *   `repositoryPath`: Caminho local para o repositório Git principal.
        *   `baseBranch`: O branch a partir do qual o worktree será criado (ex: `main`, `develop`, ou um branch de feature existente).
        *   `taskDescription`: A descrição da tarefa a ser realizada pelo agente.
        *   `newBranchName` (Opcional): Um nome sugerido para o branch do worktree. Se não fornecido, pode ser gerado (ex: `agent-task-<jobId>`).
        *   `gitUserEmail`, `gitUserName`: Para configurar o autor dos commits.
        *   (Opcional) `githubApiToken`, `targetRepositoryRemoteUrl` (ex: `owner/repo`): Se a criação de Pull Requests for necessária.

2.  **Criação do Worktree:**
    *   O `jobProcessor` do agente (fornecido pelo `AIAgentExecutionService`), através de uma ferramenta apropriada (ex: `GitTool` ou `ExecuteCommandTool`), executa o comando para criar um novo worktree.
    *   O caminho para o novo worktree deve ser um subdiretório de um diretório base seguro e gerenciado.
    *   Comando exemplo:
        ```bash
        git -C /path/to/main/repo worktree add -b agent-task-job123 ../agent_worktrees/job123_worktree main
        ```
        *   `-C /path/to/main/repo`: Executa o comando `git` como se estivesse no diretório do repositório principal.
        *   `worktree add -b <nome_branch_worktree>`: Cria um novo branch (`nome_branch_worktree`) e um novo worktree para ele.
        *   `../agent_worktrees/job123_worktree`: Caminho para o novo diretório do worktree.
        *   `main`: Branch base a partir do qual o novo branch do worktree será criado.

3.  **Execução da Tarefa no Worktree:**
    *   Todas as operações de arquivo (leitura, escrita, modificação) e comandos (lint, build, teste, `git add`, `git commit`) executados pelo agente para esta tarefa ocorrem **dentro** do diretório do worktree recém-criado.
    *   Ferramentas como `FileSystemTool` e `ExecuteCommandTool` seriam configuradas para operar com o caminho base do worktree.

4.  **Commit das Alterações (Se Aplicável):**
    *   Se a tarefa envolve modificações de código, o agente, através de uma ferramenta, executa os comandos Git necessários dentro do worktree:
        ```bash
        git config user.email "agent@example.com"
        git config user.name "AI Agent"
        git add .
        git commit -m "Commit gerado por IA: [descrição da tarefa ou do job]"
        ```

5.  **Push para o Repositório Remoto (Opcional):**
    *   Se as alterações precisarem ser compartilhadas ou revisadas:
        ```bash
        git push origin agent-task-job123
        ```

6.  **Criação de Pull Request (Opcional):**
    *   Após o push, o agente (ou uma ferramenta que ele utiliza) pode usar a API do provedor Git (ex: GitHub API via Octokit) para criar um Pull Request (PR) do branch do worktree (`agent-task-job123`) para o `baseBranch`.
    *   O `Job.payload` pode fornecer o token de API necessário.
    *   O resultado do job poderia incluir o link para o PR criado.

7.  **Limpeza do Worktree:**
    *   Independentemente do sucesso ou falha da tarefa principal (ou após a criação do PR), o worktree deve ser removido para liberar espaço e manter o repositório principal limpo.
    *   Comandos (executados a partir do repositório principal ou usando `-C`):
        ```bash
        # Remove o diretório do worktree e metadados associados
        git worktree remove agent_worktrees/job123_worktree
        # (Pode precisar de -f se houver modificações não commitadas ou não rastreadas)

        # Remove o branch local criado para o worktree (se não for mais necessário)
        git branch -d agent-task-job123
        # (Use -D para forçar a deleção se o branch não foi mergeado)
        ```
    *   A política de deleção de branches remotos (após PR mergeado/fechado) seria definida externamente.

## 8.3. Ferramentas de Agente Necessárias

Para implementar este fluxo, os Agentes de IA precisariam ter acesso às seguintes capacidades, provavelmente expostas como ferramentas via `IToolRegistry`:

*   **`ExecuteCommandTool`:** Para executar comandos de shell genéricos, incluindo todos os comandos `git` (`worktree add/remove`, `add`, `commit`, `push`, `config`), comandos de build, teste, lint, etc. Esta ferramenta deve operar de forma segura, idealmente dentro do diretório do worktree.
*   **`FileSystemTool`:** Para ler, escrever, listar arquivos e diretórios dentro do worktree.
*   **`GitHubApiTool` (ou similar para outros provedores Git):** (Opcional) Para interagir com a API do provedor Git para criar Pull Requests, verificar status, etc.

## 8.4. Considerações de Implementação

*   **Diretório Base para Worktrees:** Deve haver um diretório base configurável e seguro (ex: `<app_data>/agent_workspaces/`) onde todos os worktrees dos agentes são criados. Este diretório deve ser gerenciável e limpável.
*   **Isolamento e Segurança:** A `ExecuteCommandTool` deve ser cuidadosamente projetada para evitar a execução de comandos arbitrários perigosos. As operações devem ser restritas ao diretório do worktree.
*   **Limpeza Robusta:** Implementar um mecanismo de `try...finally` no `jobProcessor` do agente (ou no `Worker`) para garantir que a limpeza do worktree (`git worktree remove`) seja tentada mesmo se a tarefa principal do job falhar. Considerar cenários onde a aplicação pode ser encerrada abruptamente e como lidar com worktrees órfãos na próxima inicialização.
*   **Concorrência:** Worktrees Git são inerentemente isolados no sistema de arquivos, permitindo que múltiplos agentes trabalhem em paralelo no mesmo repositório base sem interferência direta em seus arquivos de trabalho.
*   **Gerenciamento de Configuração Git:** O `jobProcessor` ou suas ferramentas devem garantir que `user.name` e `user.email` sejam configurados dentro do worktree antes de fazer commits.
*   **Tratamento de Erros:** O `jobProcessor` deve ser capaz de capturar e interpretar erros dos comandos `git` ou de outras ferramentas, e relatar falhas de forma apropriada.

## 8.5. Exemplo de Sequência de Comandos (Ilustrativo no `jobProcessor`)

Um `jobProcessor` para uma tarefa de modificação de código poderia orquestrar algo assim (conceitualmente):

```typescript
// Dentro do jobProcessor, usando ferramentas
// const repoPath = job.payload.repositoryPath;
// const worktreeDir = `agent_worktrees/job_${job.id}`; // Nome único
// const newBranchName = `feature/agent_${job.id}`;
// const baseBranch = job.payload.baseBranch || 'main';

// 1. Criar worktree (via ExecuteCommandTool)
// await commandTool.execute(`git -C ${repoPath} worktree add -b ${newBranchName} ${worktreeDir} ${baseBranch}`);

// 2. Configurar Git no worktree
// await commandTool.execute(`git -C ${worktreeDir} config user.name "AI Agent"`);
// await commandTool.execute(`git -C ${worktreeDir} config user.email "agent@example.com"`);

// 3. Modificar arquivos (via FileSystemTool ou LLM gerando código para ser escrito)
// await fileTool.writeFile(`${worktreeDir}/src/newFeature.ts`, "// Código gerado pela IA...");

// 4. Fazer commit (via ExecuteCommandTool)
// await commandTool.execute(`git -C ${worktreeDir} add .`);
// await commandTool.execute(`git -C ${worktreeDir} commit -m "IA implementou newFeature"`);

// 5. (Opcional) Push e criar PR (via ExecuteCommandTool e GitHubApiTool)
// await commandTool.execute(`git -C ${worktreeDir} push origin ${newBranchName}`);
// await githubTool.createPullRequest(newBranchName, baseBranch, "PR da IA para newFeature", "Corpo do PR...");

// 6. Limpeza (em um bloco finally ou pelo Worker após o jobProcessor)
// await commandTool.execute(`git -C ${repoPath} worktree remove ${worktreeDir} -f`);
// await commandTool.execute(`git -C ${repoPath} branch -D ${newBranchName}`); // Se o PR foi mergeado/fechado ou a tarefa falhou
```

Esta abordagem fornece um mecanismo poderoso e isolado para que os Agentes de IA realizem tarefas complexas de desenvolvimento de software.
```
