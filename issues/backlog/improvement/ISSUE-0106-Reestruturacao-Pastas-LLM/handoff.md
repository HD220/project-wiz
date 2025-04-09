# Handoff - Reestruturação de Pastas LLM

## Tarefas
- [ ] Criar estrutura de pastas:
  ```
  src/core/services/llm/
  ├── core/
  ├── processes/
  ├── ipc/
  └── interfaces.ts
  ```
- [ ] Mover arquivos para novos locais
- [ ] Atualizar imports relativos
- [ ] Ajustar configurações de build

## Critérios de Aceitação
- [ ] Estrutura implementada conforme ADR-0006
- [ ] Build passando sem erros
- [ ] Zero imports quebrados
- [ ] Documentação atualizada

## Dependências
- [ADR-0006](/docs/adr/ADR-0006-Nomenclatura-Servicos-LLM.md)

## Notas Técnicas
```typescript
// Exemplo de novo import:
// Antigo:
import { WorkerManager } from './WorkerManager';

// Novo: 
import { ProcessManager } from '../processes/ProcessManager';
```

## Histórico de Revisões
- 2025-04-07: Handoff criado