# ISSUE-0097: Implementar timeouts e limpeza automática no LlmService para evitar vazamento de memória

## Categoria
Bug

## Prioridade
Alta

## Contexto
Durante a revisão da ISSUE-0095, foi identificado que o risco de vazamento de memória no `LlmService` ainda persiste. O problema ocorre quando streams ou requisições não são finalizadas corretamente, acumulando entradas nos mapas internos (`pendingRequests` e `streamHandlers`). Isso pode causar aumento progressivo no consumo de memória, afetando a estabilidade da aplicação.

## Objetivo
Corrigir o risco de vazamento de memória no `LlmService` implementando mecanismos automáticos de timeout e limpeza para streams e requisições inativas ou abandonadas.

## Critérios de Aceitação
- Implementar timeout para streams e requisições inativas.
- Cancelar automaticamente streams que excederem o tempo limite configurado.
- Limpar entradas antigas dos mapas `pendingRequests` e `streamHandlers` após timeout ou cancelamento.
- Garantir que todos os listeners sejam removidos corretamente em fluxos de erro, cancelamento ou timeout.
- A solução não deve impactar negativamente o desempenho ou a experiência do usuário.

## Notas Técnicas
- Avaliar a possibilidade de parametrizar o tempo limite para facilitar ajustes futuros.
- Revisar fluxos de erro para garantir que não fiquem listeners ou referências pendentes.
- Testar cenários com múltiplas requisições simultâneas e cancelamentos abruptos.

## Impacto
Esta correção é fundamental para garantir a estabilidade do sistema, prevenindo vazamentos de memória que podem levar a travamentos ou degradação de performance ao longo do tempo.