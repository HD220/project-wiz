# ISSUE-0095 Corrigir risco de vazamento de memória no LlmService

## Contexto
Foi identificado risco de vazamento de memória no serviço LLM, utilizado para comunicação com modelos de linguagem.

## Diagnóstico
- O serviço é implementado pela classe `LlmBridgeGateway`.
- Ela mantém mapas `pendingRequests` e `streamHandlers` para gerenciar requisições e streams.
- O vazamento pode ocorrer se esses mapas crescerem indefinidamente, por streams não finalizados ou requisições não limpas.

## Ações realizadas
- Instrumentação do código com logs detalhados para monitorar:
  - Criação e remoção de entradas nos mapas.
  - Tamanho atual dos mapas.
  - Cancelamento e finalização de streams.
- O objetivo é confirmar se o problema está nesses pontos antes da correção definitiva.

## Próximos passos
- Executar o sistema e coletar os logs.
- Confirmar se os mapas crescem sem limite.
- Se confirmado, implementar:
  - Timeout para limpar entradas antigas.
  - Cancelamento automático de streams inativos.
  - Tratamento para falhas de comunicação.

## Critérios de aceitação
- Vazamento eliminado.
- Serviço estável, sem crescimento anormal de memória.
- Testes cobrindo o cenário.
- Documentação da correção no handoff da issue.