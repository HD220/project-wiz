# ISSUE-0194: Implementar coleta real de métricas no WorkerServiceAdapter

## Descrição do problema

O método `getMetrics` do `WorkerServiceAdapter` contém um TODO indicando que a coleta de métricas é simulada e precisa ser substituída por uma implementação real.

### Exemplo concreto

Arquivo: `src/core/infrastructure/worker/adapters/WorkerServiceAdapter.ts`
```ts
34 |   async getMetrics() {
35 |     // TODO: substituir por coleta real
36 |     return {
...
```

## Recomendação de correção/refatoração

Implementar a coleta real de métricas do worker, eliminando o retorno simulado. Integrar com as fontes de dados reais conforme a arquitetura definida.

## Justificativa

- **Aderência à Clean Architecture (ADR-0012):** Implementações devem ser reais e desacopladas de mocks ou simulações em produção.
- **Redução de technical debt:** TODOs devem ser eliminados para garantir rastreabilidade e confiabilidade do código.
- **Conformidade com requisitos:** Métricas reais são essenciais para monitoramento e diagnóstico do sistema.

---