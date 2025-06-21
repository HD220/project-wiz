# Implementar métodos faltantes do IRepository no DrizzleQueueRepository

**Descrição**:
O `DrizzleQueueRepository` atualmente não implementa todos os métodos obrigatórios da interface `IRepository`, lançando "Method not implemented". Esta issue visa completar a implementação seguindo os padrões existentes.

**Tarefas**:
1. Implementar os métodos faltantes:
   - `create(queue: Queue): Promise<Queue>`
   - `findById(id: string): Promise<Queue | null>`
   - `update(queue: Queue): Promise<Queue>`
   - `delete(id: string): Promise<boolean>`
   - `findAll(): Promise<Queue[]>`

2. Adicionar testes unitários para cada novo método:
   - Testes devem cobrir casos de sucesso e erro
   - Seguir padrão dos testes existentes em `queue.integration.spec.ts`

3. Garantir consistência com a implementação existente:
   - Usar transações como no método `save()`
   - Manter o mesmo padrão de mapeamento de entidades
   - Seguir a estrutura de erros e validações

**Critérios de Aceitação**:
- [ ] Todos os métodos implementados conforme interface
- [ ] Transações utilizadas corretamente em todas as operações
- [ ] Testes cobrindo:
  - Criação de fila com e sem jobs
  - Busca por ID existente e não existente
  - Atualização de fila e jobs associados
  - Exclusão de fila e jobs associados
  - Listagem de todas as filas
- [ ] Manutenção da compatibilidade com o sistema existente

**Arquivos envolvidos**:
- `src/infrastructure/repositories/drizzle/queue.repository.ts` (implementação)
- `src/infrastructure/queue/queue.integration.spec.ts` (testes)
- `src/core/ports/repositories/irepository.interface.ts` (interface)

**Detalhes de Implementação**:

1. **create(queue: Queue)**:
   - Deve inserir a fila na tabela `queues`
   - Se houver jobs associados, deve inseri-los na tabela `jobs`
   - Deve retornar a fila criada

2. **findById(id: string)**:
   - Deve buscar a fila pelo ID
   - Se encontrada, deve carregar os jobs associados
   - Deve retornar null se não existir

3. **update(queue: Queue)**:
   - Similar ao `save()`, mas deve retornar a fila atualizada
   - Deve atualizar tanto a fila quanto os jobs

4. **delete(id: string)**:
   - Deve remover a fila e todos os jobs associados
   - Deve retornar true se a operação foi bem sucedida

5. **findAll()**:
   - Deve retornar todas as filas do sistema
   - Pode implementar paginação se necessário

**Exemplo de Implementação (create)**:
```typescript
async create(queue: Queue): Promise<Queue> {
  return db.transaction(async (tx) => {
    await tx.insert(queuesTable).values({
      id: queue.getId(),
      name: queue.getName(),
      concurrency: (queue as any).concurrency || 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const jobs = (queue as any).jobs as Job[];
    if (jobs?.length) {
      await tx.insert(jobsTable).values(
        jobs.map(job => this.toJobData(job))
    }

    return queue;
  });
}
```

**Observações**:
- Manter consistência com o padrão de transações existente
- Utilizar os mesmos mapeamentos de entidade para banco de dados
- Garantir que todos os métodos lidem adequadamente com erros