# ISSUE-0196: Implementar fetch via IPC no hook use-available-models

## Descrição do problema

O hook `use-available-models` contém um TODO indicando que o fetch de modelos disponíveis deve ser feito a partir do domínio/infrastructure, mas atualmente utiliza simulação (mock).

### Exemplo concreto

Arquivo: `src/client/hooks/use-available-models.ts`
```ts
19 |     // TODO: Replace with real fetch from domain/infrastructure
```

## Recomendação de correção/refatoração

Implementar a busca real dos modelos disponíveis via IPC/message port, eliminando o uso de mocks ou simulações. O hook deve se comunicar apenas por canais definidos de IPC, conforme Clean Architecture.

## Justificativa

- **Aderência à Clean Architecture (ADR-0012):** O frontend não deve acessar diretamente o core/infrastructure, devendo usar IPC/message port para comunicação.
- **Redução de technical debt:** TODOs e mocks devem ser eliminados para garantir rastreabilidade e confiabilidade do código.
- **Conformidade com requisitos:** A listagem real de modelos é essencial para a funcionalidade do sistema.

---