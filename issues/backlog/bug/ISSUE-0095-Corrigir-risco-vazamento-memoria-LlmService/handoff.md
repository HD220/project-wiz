# Handoff Técnico - ISSUE-0095 Corrigir risco de vazamento de memória no LlmService

## Diagnóstico

- O `LlmService` é implementado pela classe `LlmBridgeGateway`.
- Ela mantém dois mapas internos:
  - `pendingRequests`: requisições assíncronas pendentes.
  - `streamHandlers`: streams ativos para respostas parciais.
- O risco de vazamento está relacionado ao crescimento indefinido desses mapas, caso entradas não sejam removidas corretamente.

## Hipóteses principais do vazamento

- Streams que não recebem evento `'streamEnd'` e não são cancelados manualmente.
- Requisições que não recebem resposta ou erro, permanecendo no mapa.
- Comunicação interrompida ou falha que impede a limpeza.

## Ações realizadas

- Inseridos logs detalhados para:
  - Criação e remoção de entradas nos mapas.
  - Tamanho atual dos mapas após cada operação.
  - Cancelamento e finalização de streams.
- Esses logs permitirão confirmar se o problema está nesses pontos.

## Próximos passos recomendados

- Executar o sistema e coletar os logs.
- Analisar se os mapas crescem indefinidamente.
- Se confirmado, implementar:
  - Timeout para limpar entradas antigas.
  - Cancelamento automático de streams inativos.
  - Tratamento para falhas de comunicação.

## Status atual

- Diagnóstico detalhado preparado.
- Código instrumentado para coleta de dados.
- Aguardando logs de execução para confirmação final e correção.