# Handoff

## Contexto

Esta issue tem como objetivo implementar o suporte a diferentes modelos LLM no sistema. Atualmente, o sistema suporta apenas o modelo Llama.

## Requisitos

- Permitir adicionar e remover modelos LLM.
- Possuir uma interface para selecionar o modelo LLM a ser utilizado.
- Ser compatível com a API do WorkerService.

## Detalhes da Implementação

- A interface de seleção de modelos deve ser implementada no frontend.
- A lógica para adicionar e remover modelos deve ser implementada no backend.
- O WorkerService deve ser adaptado para receber o modelo LLM a ser utilizado como parâmetro.
- A configuração dos modelos LLM deve ser feita através de um arquivo de configuração ou variáveis de ambiente.

## Observações

- O WorkerService (src/core/services/llm/WorkerService.ts) deve ser adaptado para suportar a seleção de diferentes modelos LLM.
- Considerar a utilização de um padrão de projeto como Factory ou Strategy para facilitar a adição de novos modelos LLM no futuro.

## Próximos Passos

- Implementar a interface de seleção de modelos no frontend.
- Implementar a lógica para adicionar e remover modelos no backend.
- Adaptar o WorkerService para suportar a seleção de diferentes modelos LLM.
- Criar um arquivo de configuração ou utilizar variáveis de ambiente para configurar os modelos LLM.
- Testar a implementação com diferentes modelos LLM.
