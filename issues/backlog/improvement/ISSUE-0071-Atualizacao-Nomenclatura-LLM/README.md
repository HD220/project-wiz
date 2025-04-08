# Atualização de Nomenclatura dos Serviços LLM

## Descrição
Implementar as mudanças de nomenclatura definidas no ADR-0006:
- Renomear classes e arquivos
- Atualizar imports e referências
- Ajustar testes unitários

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

## Links Relacionados
- [ADR-0006](/docs/adr/ADR-0006-Nomenclatura-Servicos-LLM.md)