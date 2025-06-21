# Expandir interface IQueueRepository para suporte completo a estados de jobs

**Descrição**:
A interface IQueueRepository atual não possui métodos para marcar jobs como ativos ou com delay, limitando o controle do ciclo de vida dos jobs. Esta issue visa expandir a interface para suportar esses estados adicionais.

**Tarefas**:
1. Adicionar novos métodos à interface IQueueRepository:
   - `markJobAsStarted(id: string): Promise<void>` - Marca um job como iniciado/em processamento
   - `markJobAsDelayed(id: string, delayUntil: Date): Promise<void>` - Marca um job como atrasado/delayed

2. Implementar os métodos no DrizzleQueueRepository:
   - Adicionar colunas/status necessários na tabela de jobs
   - Implementar lógica de atualização de estado
   - Manter consistência com o padrão de transações existente

3. Atualizar WorkerService para usar os novos métodos:
   - Chamar `markJobAsStarted` antes de iniciar o processamento
   - Chamar `markJobAsDelayed` quando um job precisar ser reprocessado mais tarde

4. Adicionar testes para os novos comportamentos:
   - Testes unitários para os novos métodos do repositório
   - Testes de integração para o fluxo completo no WorkerService
   - Cobrir casos de sucesso e falha

**Critérios de Aceitação**:
- [ ] Interface mantém compatibilidade retroativa
- [ ] Métodos seguem o padrão de transações existente
- [ ] WorkerService marca jobs como ativos antes do processamento
- [ ] Testes cobrem todos os novos casos:
  - Job marcado como started
  - Job marcado como delayed
  - Falha ao marcar job inexistente
  - Consistência após falha

**Arquivos envolvidos**:
- `src/core/ports/repositories/iqueue-repository.interface.ts` (interface)
- `src/infrastructure/repositories/drizzle/queue.repository.ts` (implementação)
- `src/core/domain/services/worker.service.ts` (uso dos novos métodos)
- `src/infrastructure/queue/queue.integration.spec.ts` (testes)

**Detalhes de Implementação**:

1. **Interface IQueueRepository**:
```typescript
/**
 * Marca um job como iniciado/em processamento
 * @param id - Identificador do job
 * @returns Promise vazia indicando sucesso da operação
 */
markJobAsStarted(id: string): Promise<void>;

/**
 * Marca um job como atrasado/delayed para processamento futuro
 * @param id - Identificador do job
 * @param delayUntil - Data até quando o job deve ficar em estado delayed
 * @returns Promise vazia indicando sucesso da operação
 */
markJobAsDelayed(id: string, delayUntil: Date): Promise<void>;
```

2. **DrizzleQueueRepository**:
- Adicionar colunas `startedAt` e `delayedUntil` na tabela jobs
- Implementar métodos usando transações como nos demais
- Atualizar query `getNextJob` para ignorar jobs delayed

3. **WorkerService**:
- Chamar `markJobAsStarted` antes de `processor.process`
- Chamar `markJobAsDelayed` quando um job precisar ser reprocessado mais tarde

**Exemplo de Teste**:
```typescript
it('should mark job as started', async () => {
  const job = await createTestJob();
  await queueRepo.markJobAsStarted(job.getId());
  
  const updatedJob = await getJobFromDb(job.getId());
  expect(updatedJob.startedAt).not.toBeNull();
});

it('should mark job as delayed', async () => {
  const job = await createTestJob();
  const delayUntil = new Date(Date.now() + 10000);
  
  await queueRepo.markJobAsDelayed(job.getId(), delayUntil);
  
  const updatedJob = await getJobFromDb(job.getId());
  expect(updatedJob.delayedUntil).toEqual(delayUntil);
});
```

**Observações**:
- Manter consistência com o padrão existente de tratamento de erros
- Garantir que os métodos sejam atômicos dentro de transações
- Documentar os novos métodos adequadamente