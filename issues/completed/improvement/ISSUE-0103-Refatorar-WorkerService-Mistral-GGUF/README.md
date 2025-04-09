# Refatoração completa do WorkerService para suporte a Mistral GGUF, fila de prompts e múltiplos workers

## Status: Não implementado

**Justificativa:** 
Conforme [ADR-0007](/docs/adr/ADR-0007-Refatoracao-WorkerService-Mistral-GGUF.md), optou-se por uma abordagem diferente para suporte a modelos, focando em formatos GGUF. A refatoração completa do WorkerService não será realizada conforme originalmente planejado.

## Contexto atual e problemas identificados

O WorkerService atual já possui uma implementação básica para suporte a modelos LLM via node-llama-cpp, incluindo:
- Worker único com utilityProcess.fork
- Sistema básico de fila de prompts
- Gerenciamento de múltiplos modelos com cache
- Monitoramento de uso de memória

No entanto, existem algumas limitações:
1. O suporte a Mistral GGUF está implementado mas não está totalmente integrado ao WorkerService principal
2. A fila de prompts não está completamente implementada (apenas armazenamento básico)
3. Falta uma interface comum (LLMAdapter) para abstrair diferentes modelos LLM
4. O gerenciamento de múltiplos workers precisa ser melhorado

## Objetivos originais da refatoração

1. Criar uma arquitetura modular para suporte a múltiplos modelos LLM
2. Implementar uma fila de prompts robusta com priorização
3. Melhorar o gerenciamento de workers e recursos
4. Garantir alta disponibilidade e escalabilidade

## Benefícios esperados

- Suporte unificado a diferentes modelos LLM (Llama, Mistral, etc)
- Melhor desempenho com fila de prompts priorizada
- Uso mais eficiente de recursos com múltiplos workers
- Maior facilidade para adicionar novos modelos no futuro

## Impacto no sistema

- Mudanças no WorkerService e componentes relacionados
- Atualização dos testes existentes
- Potencial impacto no uso de memória e CPU
- Melhorias na estabilidade e desempenho geral

## Diagrama de arquitetura original

```
[WorkerService]
├── [WorkerPool]
│   ├── Worker 1 (Llama)
│   ├── Worker 2 (Mistral)
│   └── ...
├── [PromptQueue]
│   ├── Fila prioritária
│   └── Gerenciamento de estado
└── [ModelManager]
    ├── Carregamento de modelos
    └── Gerenciamento de memória
```

## Tarefas técnicas

- [ ] Criar interface LLMAdapter
- [ ] Implementar MistralAdapter baseado no código existente
- [ ] Refatorar WorkerPool para gerenciar múltiplos workers
- [ ] Implementar PromptQueue com priorização
- [ ] Atualizar testes existentes
- [ ] Adicionar novos testes para funcionalidades implementadas

## Critérios de aceitação

- Suporte a Mistral GGUF funcionando
- Fila de prompts operacional com priorização
- Gerenciamento de múltiplos workers eficiente
- 80% de cobertura de testes
- Documentação atualizada

## Links relacionados

- ADR-0007: Refatoração do WorkerService para Suporte a Modelos Mistral (GGUF)
- ISSUE-0041: Implementar gerenciamento de múltiplos workers
- ISSUE-0042: Implementar fila de prompts
- ISSUE-0022: Implementar testes WorkerService

## Estimativa original: 2 semanas