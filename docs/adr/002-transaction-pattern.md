# ADR-002: Padrão de Transações no DrizzleQueueRepository

## Status
Proposto

## Contexto
O sistema de filas requer operações atômicas para garantir consistência dos dados, especialmente em operações como:
- Atualização do status de jobs
- Criação/atualização de filas com múltiplos jobs
- Operações de rollback em caso de falha

O gerenciamento anterior de transações era feito de forma ad-hoc, sem um padrão consistente, o que poderia levar a inconsistências.

## Decisão
Implementamos um wrapper `runInTransaction` que encapsula operações críticas em transações. O padrão segue:

```typescript
private async runInTransaction<T>(
  operation: (tx: SQLiteTransaction<any, any, any, any>) => Promise<T>
): Promise<T> {
  return new Promise((resolve, reject) => {
    this.db.transaction((tx) => {
      operation(tx).then(resolve).catch(reject);
    });
  });
}
```

Todos os métodos que modificam o estado da fila ou jobs devem usar este wrapper, como:

```typescript
async markJobAsCompleted(id: string, result: any): Promise<void> {
  return this.runInTransaction(async (tx) => {
    await tx.update(jobsTable)
      .set({ /* campos atualizados */ })
      .where(eq(jobsTable.id, id));
  });
}
```

## Consequências
**Benefícios:**
- Garantia de atomicidade nas operações
- Consistência dos dados mesmo em caso de falha
- Padronização do tratamento de transações
- Reúso em múltiplos repositórios
- Manutenção centralizada

**Trade-offs:**
- Overhead adicional de gerenciamento de transações
- Acoplamento ao Drizzle ORM
- Necessidade de testes específicos para cenários de rollback

**Métricas de Sucesso:**
- Redução de código duplicado em 80%
- Tempo médio de implementação de novos repositórios reduzido em 30%

## Alternativas Consideradas
1. **Transações automáticas por método**: 
   - Prós: Mais simples de implementar
   - Contras: Menos flexível para operações complexas

2. **Sem transações**: 
   - Prós: Melhor performance
   - Contras: Risco de inconsistência nos dados

## Referências Relacionadas
- [Documentação Arquitetural do Sistema de Filas](./arquitetura.md)
- [Implementação do DrizzleQueueRepository](../../src/infrastructure/repositories/drizzle/queue.repository.ts)