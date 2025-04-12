# ISSUE-0195: Implementar fetch via IPC no hook use-repository-metrics

## Descrição do problema

O hook `use-repository-metrics` contém um TODO indicando que o fetch de métricas deve ser feito via IPC a partir do processo principal (main process), mas atualmente está desabilitado o acesso direto ao banco de dados.

### Exemplo concreto

Arquivo: `src/client/hooks/use-repository-metrics.ts`
```ts
24 |         // TODO: Implement fetch via IPC from main process
25 |         // Temporarily disable direct DB access
```

## Recomendação de correção/refatoração

Implementar a busca de métricas do repositório via IPC/message port, eliminando qualquer tentativa de acesso direto ao core/infrastructure pelo frontend. O hook deve se comunicar apenas por canais definidos de IPC, conforme Clean Architecture.

## Justificativa

- **Aderência à Clean Architecture (ADR-0012):** O frontend não deve acessar diretamente o core/infrastructure, devendo usar IPC/message port para comunicação.
- **Redução de technical debt:** TODOs e dependências diretas devem ser eliminados para garantir desacoplamento e testabilidade.
- **Conformidade com requisitos:** A busca de métricas é essencial para a funcionalidade do dashboard e deve ser implementada corretamente.

---