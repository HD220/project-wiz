# Implementar suporte a diferentes modelos LLM

## Status: Não implementado

**Justificativa:** 
Conforme [ADR-0007](/docs/adr/ADR-0007-Refatoracao-WorkerService-Mistral-GGUF.md), optou-se por uma abordagem diferente para suporte a modelos, focando em formatos GGUF que oferecem melhor compatibilidade. Portanto, esta implementação específica não será realizada.

## Descrição original

O sistema deve suportar diferentes modelos LLM (além do Llama) para permitir adicionar e remover modelos, ter uma interface para selecionar o modelo e ser compatível com la API do WorkerService.

## Critérios de Aceitação

- [ ] Deve permitir adicionar novos modelos LLM ao sistema.
- [ ] Deve permitir remover modelos LLM existentes do sistema.
- [ ] Deve ter uma interface para selecionar o modelo LLM a ser utilizado. A interface deve permitir a seleção do modelo a partir de uma lista de modelos disponíveis.
- [ ] Deve ser compatível com a API do WorkerService. A API do WorkerService deve ser adaptada para receber o modelo LLM a ser utilizado como parâmetro.

## Tarefas

- [ ] Implementar a lógica para adicionar e remover modelos LLM.
- [ ] Criar a interface para selecionar o modelo LLM.
- [ ] Adaptar o WorkerService para suportar diferentes modelos LLM.
- [ ] Testar a implementação com diferentes modelos LLM.

## Notas Adicionais

O WorkerService (src/core/services/llm/WorkerService.ts) deve ser adaptado para suportar a seleção de diferentes modelos LLM. A configuração dos modelos LLM deve ser feita através de um arquivo de configuração ou variáveis de ambiente.
