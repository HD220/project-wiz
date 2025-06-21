# Relatório de Consistência e Rastreabilidade

## Matriz de Rastreabilidade

| Componente Arquitetural | Casos de Uso Relacionados                                                                                | Issues Técnicas                                                    | Status Implementação                 |
| ----------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------ |
| **FQueue (Queue)**      | [Add Job to Queue](./use-cases/add-job-to-queue.md)<br>[Prioritize Jobs](./use-cases/prioritize-jobs.md) | [Implement Queue Manager](./issues/implement-queue-manager.md)     | Parcial (plano-implementacao.md)     |
| **Worker**              | [Process Job](./use-cases/process-job.md)                                                                | [Implement Worker Pool](./issues/implement-worker-pool.md)         | Parcial (arquitetura.md)             |
| **Agente**              | [Process Job](./use-cases/process-job.md)                                                                | [Implement Job Processor](./issues/implement-job-processor.md)     | Documentado (arquitetura.md)         |
| **Task**                | [Process Job](./use-cases/process-job.md)                                                                | [Implement Job Processor](./issues/implement-job-processor.md)     | Documentado (arquitetura.md)         |
| **Retry Mechanism**     | [Retry Failed Job](./use-cases/retry-failed-job.md)                                                      | [Implement Retry Mechanism](./issues/implement-retry-mechanism.md) | Documentado (plano-implementacao.md) |

## Gaps Identificados

1. **Componente Worker Pool**:
   - Documentado nas issues mas não aparece explicitamente na arquitetura
   - Necessário alinhar com o componente Worker descrito na arquitetura

2. **Priorização de Jobs**:
   - Caso de uso existe mas não está mapeado no plano de implementação
   - Falta detalhe na arquitetura sobre como a priorização é implementada

3. **Monitoramento**:
   - Documentado em queue-monitoring.md mas não aparece no plano ou arquitetura
   - Necessário integrar com os componentes FQueue e Worker

4. **Dependências entre Jobs**:
   - Mencionado na arquitetura mas sem casos de uso específicos
   - Falta detalhe de implementação no plano

## Itens Pendentes

### Documentação
- [ ] Atualizar arquitetura.md com Worker Pool
- [ ] Adicionar seção de priorização no plano-implementacao.md
- [ ] Criar caso de uso para dependências entre jobs
- [ ] Integrar documentação de monitoramento com arquitetura

### Implementação
- [ ] Definir interface clara entre Worker e Worker Pool
- [ ] Especificar política de priorização na FQueue
- [ ] Detalhar implementação de dependências no JobRepository

## Recomendações

1. **Consolidar Terminologia**:
   - Unificar termos: FQueue vs Queue vs QueueManager
   - Definir relação clara entre Worker, Worker Pool e Agente

2. **Atualizar Plano de Implementação**:
   - Incluir todos os casos de uso identificados
   - Adicionar seção específica para políticas (retry, priorização)

3. **Criar Diagrama de Componentes**:
   - Mostrar relações entre todos os componentes
   - Incluir interfaces e fluxos principais

4. **Verificar Consistência de Estados**:
   - Garantir que diagramas de estado nos casos de uso batam com a arquitetura