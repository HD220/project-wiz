# ADR-0012 - Gerenciamento de Streams e Requisições no LlmService para Prevenir Vazamento de Memória

## Contexto
Foi identificado risco de vazamento de memória no serviço LLM (`LlmService`), utilizado para comunicação com modelos de linguagem. O problema estava relacionado ao crescimento indefinido dos mapas `pendingRequests` e `streamHandlers` na classe `LlmBridgeGateway`, que gerenciam requisições e streams.

## Problema
Sem um gerenciamento adequado, entradas antigas permaneciam nos mapas, levando a consumo excessivo de memória, especialmente em cenários com muitas requisições ou streams longos/interrompidos.

## Decisão
- Implementar **timeouts configuráveis** para limpar entradas antigas automaticamente.
- Implementar **cancelamento automático** de streams inativos ou abandonados.
- Adicionar **tratamento para falhas de comunicação**, garantindo que recursos sejam liberados mesmo em erros.
- Instrumentar o código com **logs detalhados** para monitorar criação, remoção e tamanho dos mapas.

## Alternativas Consideradas
- Coleta manual periódica via cron ou agendamento externo.
- Uso de garbage collection explícita ou WeakMaps (não adequado para controle ativo).
- Monitoramento externo com alertas, sem ação automática.

## Consequências
- Redução significativa do risco de vazamento de memória.
- Maior estabilidade e previsibilidade do serviço.
- Código um pouco mais complexo devido à lógica de timeout e cancelamento, porém controlada.
- Facilidade para diagnóstico futuro via logs.

## Status
Implementado e validado com testes automatizados.

## Data
10/04/2025

## Decisores
Equipe de desenvolvimento do projeto Wiz