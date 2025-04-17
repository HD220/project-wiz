# Guia de Validação de Parâmetros

## Visão Geral
Este documento descreve o sistema de validação de parâmetros implementado na refatoração do gitService, utilizando a biblioteca Zod.

## Esquemas de Validação
Os seguintes esquemas são utilizados para validação:

### `RepositoryParamsSchema`
```typescript
z.object({
  localPath: z.string().min(1, "Local path is required"),
  remoteUrl: z.string().url("Invalid remote URL"),
  credentialsId: z.string().optional(),
})
```

### `CommitParamsSchema`
```typescript
z.object({
  repositoryId: z.string().min(1),
  message: z.string().min(1, "Commit message is required"),
  files: z.array(z.string()).min(1, "At least one file must be specified"),
})
```

### `PullPushParamsSchema`
```typescript
z.object({
  repositoryId: z.string().min(1),
  branchName: z.string().min(1),
  credentialsId: z.string().optional(),
})
```

## Fluxo de Validação
1. Parâmetros são recebidos nos métodos do `ElectronGitService`
2. São validados usando `validateParams(schema, params)`
3. Erros são tratados centralmente em `handleIpcError`

## Mensagens de Erro
- Erros de validação incluem mensagens específicas por campo
- Erros de IPC são padronizados com prefixo `[ElectronGitService]`

## Boas Práticas
1. Sempre valide parâmetros no início do método
2. Use mensagens de erro claras e específicas
3. Mantenha os esquemas centralizados em `ipc-git.ts`
4. Reutilize esquemas sempre que possível

## Exemplo de Uso
```typescript
async addRepository(localPath: string, remoteUrl: string, credentialsId?: string) {
  const params = validateParams(RepositoryParamsSchema, { localPath, remoteUrl, credentialsId });
  // ... resto da implementação
}
```

## Referências
- [ADR-0030: Refatoração gitService](../architecture/decisions/adr-0030-refatoracao-gitservice.md)
- [Documentação Zod](https://zod.dev)