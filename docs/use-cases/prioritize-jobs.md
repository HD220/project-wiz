# Priorizar Jobs na Fila

## Objetivo
Reordenar os jobs pendentes na fila de processamento com base em regras de priorização definidas

## Atores
- Sistema de priorização
- Queue service
- Workers

## Pré-condições
- Deve existir pelo menos um job pendente na fila
- Queue service deve estar disponível

## Fluxo Principal
1. Sistema verifica jobs pendentes na fila
2. Aplica regras de priorização:
   - Prioridade definida pelo cliente
   - Tipo de job (emergencial/normal)
   - Tempo de espera na fila
3. Reordena fila conforme prioridades calculadas
4. Notifica workers sobre mudanças na fila

## Fluxos Alternativos
- Fila vazia: retorna erro `queue_empty`
- Cálculo de prioridade inválido: retorna erro `invalid_priority_score`
- Falha ao reordenar: retorna erro `reorder_failed`

## Pós-condições
- Jobs estão reordenados por prioridade na fila
- Workers são notificados da nova ordem

## Regras de Negócio
- Prioridade do cliente tem peso de 60% no cálculo
- Tipo de job tem peso de 30% (emergencial=100, normal=50)
- Tempo de espera tem peso de 10% (0.1 por minuto, máximo 30min)

## Fórmula de Priorização
`score = (priority * 0.6) + (typeWeight * 0.3) + (waitTimeFactor * 0.1)`

- **priority**: Valor 1-100 fornecido pelo cliente
- **typeWeight**:
  - 100 para jobs emergenciais
  - 50 para jobs normais
- **waitTimeFactor**: 
  - 0.1 por minuto de espera (máx. 30 minutos)

## Exemplo de Implementação
```typescript
// prioritize-jobs.usecase.ts
class PrioritizeJobsUseCase implements Executable<void, void> {
  async execute(): Promise<Result<void>> {
    const pendingJobs = await this.jobRepository.getPendingJobs();
    const prioritized = pendingJobs.map(job => ({
      ...job,
      score: this.calculatePriorityScore(job)
    })).sort((a, b) => b.score - a.score);
    
    await this.queueService.reorder(prioritized);
    return Result.ok();
  }

  private calculatePriorityScore(job: Job): number {
    const waitMinutes = Math.min(
      (Date.now() - job.createdAt.getTime()) / 60000, 
      30
    );
    return (job.priority * 0.6) + 
           (job.type === 'emergency' ? 100 : 50) * 0.3 + 
           (waitMinutes * 0.1);
  }
}
```

## Códigos de Erro
- `queue_empty`: Nenhum job pendente para priorização
- `invalid_priority_score`: Cálculo de prioridade retornou valor inválido
- `reorder_failed`: Falha ao reordenar fila no sistema de queue

## Diagrama de Sequência
```mermaid
sequenceDiagram
  participant UC as PrioritizeJobsUseCase
  participant Repo as JobRepository
  participant Queue as QueueService
  
  UC->>Repo: getPendingJobs()
  Repo-->>UC: List<Job>
  UC->>UC: calculatePriorityScore(job)
  UC->>Queue: reorder(prioritizedJobs)
  Queue-->>UC: success