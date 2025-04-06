# Handoff - ISSUE-0049: Implementar streaming no WorkerService

## Contexto

O `WorkerService` precisa ser modificado para enviar os dados do LLM em tempo real para o frontend. Atualmente, o `WorkerService` envia a resposta completa do LLM após a conclusão do processamento.

## Tarefa

- Modificar o `WorkerService` para utilizar Server-Sent Events (SSE) ou WebSockets para enviar os dados do LLM em tempo real.
- Implementar um mecanismo para exibir um indicador de carregamento no frontend enquanto a resposta do LLM está sendo gerada.
- Garantir que a implementação seja robusta e lide com erros de conexão e outros problemas.
- Documentar as decisões de design e implementação no código e em um ADR (Architectural Decision Record).

## Próximos passos

- Analisar o código do `WorkerService` e identificar os pontos onde as modificações precisam ser feitas.
- Escolher entre SSE e WebSockets, considerando os prós e contras de cada tecnologia.
- Implementar a comunicação em tempo real.
- Implementar o indicador de carregamento no frontend.
- Testar a implementação em diferentes cenários.
- Criar um ADR documentando as decisões tomadas.

## Observações

- Considerar a utilização de bibliotecas ou frameworks que facilitem a implementação de SSE ou WebSockets.
- Manter a compatibilidade com as versões anteriores do sistema.
- Coordenar com a equipe de frontend para garantir a integração adequada da solução.

## Código relevante

- `src/core/services/llm/WorkerService.ts`
