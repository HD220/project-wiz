# Tipagem IPC para Comunicação Git

## Visão Geral
Este documento descreve o sistema de tipagem para comunicação IPC entre o main e renderer processes no módulo gitService.

## Canais IPC
Os seguintes canais estão definidos:

```typescript
type IpcGitChannel =
  | "git:addRepository"
  | "git:listRepositories"
  | "git:getStatus"
  | "git:commitChanges"
  | "git:pushChanges"
  | "git:pullChanges"
  | "git:createBranch"
  | "git:switchBranch"
  | "git:deleteBranch"
  | "git:listBranches"
  | "git:getHistory"
  | "git:syncWithRemote";
```

## Estrutura de Resposta
Todas as respostas seguem o formato:

```typescript
interface IpcGitResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
```

## Tipos Associados
Cada canal está associado a tipos específicos:

| Canal | Tipo de Parâmetro | Tipo de Retorno |
|-------|-------------------|-----------------|
| git:addRepository | RepositoryParams | RepositoryInfo |
| git:listRepositories | - | RepositoryInfo[] |
| git:getStatus | string | StatusInfo |
| git:commitChanges | CommitParams | void |
| git:pushChanges | PullPushParams | void |
| git:pullChanges | PullPushParams | void |
| git:createBranch | BranchParams | void |
| git:switchBranch | BranchParams | void |
| git:deleteBranch | BranchParams | void |
| git:listBranches | string | BranchInfo[] |
| git:getHistory | string, string? | CommitInfo[] |
| git:syncWithRemote | string, string? | void |

## Boas Práticas
1. Sempre use os tipos definidos em ipc-git.ts
2. Valide parâmetros antes de enviar via IPC
3. Trate erros verificando a propriedade `success`
4. Mantenha consistência nos nomes dos canais (prefixo `git:`)

## Exemplo de Uso
```typescript
// Renderer process
const response = await window.electron.invoke<RepositoryInfo[]>("git:listRepositories");
if (!response.success) {
  throw new Error(response.error);
}
return response.data!;

// Main process
ipcMain.handle("git:listRepositories", async () => {
  try {
    const repos = await gitService.listRepositories();
    return { success: true, data: repos };
  } catch (err) {
    return { success: false, error: err.message };
  }
});
```

## Referências
- [ADR-0030: Refatoração gitService](../architecture/decisions/adr-0030-refatoracao-gitservice.md)
- [Documentação Electron IPC](https://www.electronjs.org/docs/latest/api/ipc-main)