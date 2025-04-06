# Implementar suporte ao modelo Mistral

## Descrição

Implementar suporte ao modelo Mistral LLM seguindo a mesma arquitetura do suporte atual ao Llama 2.

## Contexto

O README do projeto menciona suporte a múltiplos modelos LLM (incluindo Mistral), mas atualmente só há implementação para Llama 2. Precisamos estender o WorkerService para suportar Mistral.

## Tarefas

- [ ] Criar implementação do worker para Mistral
- [ ] Adicionar configurações específicas do Mistral no ModelSettings
- [ ] Atualizar WorkerService para detectar e carregar o modelo correto
- [ ] Adicionar testes de integração
- [ ] Documentar no guia de modelos LLM

## Critérios de Aceitação

- Mistral aparece como opção no Model Settings
- Pode ser selecionado e configurado
- Executa inferências corretamente
- Documentação atualizada em docs/llm-services.md

## Dependências

- WorkerService (já implementado)
- Sistema de configurações (já implementado)

## Referências

- [Documentação LLM Services](/docs/llm-services.md)
- [WorkerService.ts](/src/core/services/llm/WorkerService.ts)
- [Implementação Llama](/src/core/services/llm/llama/)
