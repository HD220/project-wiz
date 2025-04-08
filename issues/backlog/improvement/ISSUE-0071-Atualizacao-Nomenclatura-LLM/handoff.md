# Handoff - Atualização de Nomenclatura LLM

## Tarefas
- [ ] Renomear `WorkerManager` → `ProcessManager`
- [ ] Renomear `WorkerService` → `InferenceService`
- [ ] Renomear `worker.ts` → `InferenceProcess.ts`
- [ ] Atualizar todos os imports
- [ ] Ajustar testes unitários

## Critérios de Aceitação
- [ ] Nomenclatura conforme ADR-0006
- [ ] Zero imports quebrados
- [ ] 100% dos testes passando
- [ ] Documentação atualizada

## Dependências
- [ADR-0006](/docs/adr/ADR-0006-Nomenclatura-Servicos-LLM.md)

## Notas Técnicas
```typescript
// Exemplo de mudança:
// Antigo:
import { WorkerManager } from './WorkerManager';

// Novo:
import { ProcessManager } from '../processes/ProcessManager';
```

## Histórico de Revisões
- 2025-04-07: Handoff criado