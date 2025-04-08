# Handoff

## Status: Não implementado

**Justificativa:** 
Conforme [ADR-0007](/docs/adr/ADR-0007-Refatoracao-WorkerService-Mistral-GGUF.md), optou-se por uma abordagem diferente para suporte a modelos, focando em formatos GGUF.

## Contexto original

Esta issue tem como objetivo implementar o suporte a diferentes modelos LLM no sistema. Atualmente, o sistema suporta apenas o modelo Llama.

## Requisitos originais

- Permitir adicionar e remover modelos LLM.
- Possuir uma interface para selecionar o modelo LLM a ser utilizado.
- Ser compatível com la API do WorkerService.

## Detalhes da Implementação

- A interface de seleção de modelos deve ser implementada no frontend.
- A lógica para adicionar e remover modelos deve ser implementada no backend.
- O WorkerService deve ser adaptado para receber o modelo LLM a ser utilizado como parâmetro.
- A configuração dos modelos LLM deve ser feita através de um arquivo de configuração ou variáveis de ambiente.

## Observações

- O WorkerService (src/core/services/llm/WorkerService.ts) deve ser adaptado para suportar a seleção de diferentes modelos LLM.
- Considerar a utilização de um padrão de projeto como Factory ou Strategy para facilitar a adição de novos modelos LLM no futuro.

## Próximos Passos

N/A - Issue não será implementada conforme ADR-0007
