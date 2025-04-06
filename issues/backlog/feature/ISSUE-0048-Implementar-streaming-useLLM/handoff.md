# Handoff: Implementar streaming no useLLM

## Contexto

O hook `useLLM` precisa ser modificado para receber os dados do LLM em tempo real e exibir um indicador de carregamento.

## Requisitos

- Exibir a resposta do LLM em tempo real.
- Utilizar Server-Sent Events (SSE) ou WebSockets.
- Possuir um indicador de carregamento.

## Informações adicionais

- O hook `useLLM` está localizado em `src/client/hooks/use-llm.ts`.
- Considerar o uso de SSE ou WebSockets para a comunicação em tempo real.
- O indicador de carregamento deve ser visualmente claro e informativo.

## Próximos passos

- Implementar a lógica para receber os dados do LLM em tempo real.
- Implementar o indicador de carregamento.
- Testar a implementação.
