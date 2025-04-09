# Padronização de Nomenclatura de Arquivos

## Objetivo
Padronizar todos os nomes de arquivos para usar apenas letras minúsculas e hífens, seguindo as convenções do projeto.

## Mudanças Planejadas

### Pasta src/core/services/llm/interfaces
| Nome Antigo         | Novo Nome          |
|---------------------|--------------------|
| IModelManager.ts    | model-manager.ts   |
| IPromptService.ts   | prompt-service.ts  |
| IWorkerEvents.ts    | worker-events.ts   |
| IWorkerManager.ts   | worker-manager.ts  |

### Pasta src/core/services/llm/managers
| Nome Antigo         | Novo Nome          |
|---------------------|--------------------|
| PromptService.ts    | prompt-service.ts  |
| WorkerManager.ts    | worker-manager.ts  |

## Impacto
- Atualização de todos os imports nos arquivos do projeto
- Atualização da documentação
- Necessário atualizar referências no código

## Plano de Execução
1. Renomear arquivos
2. Atualizar imports
3. Atualizar documentação
4. Validar builds e testes