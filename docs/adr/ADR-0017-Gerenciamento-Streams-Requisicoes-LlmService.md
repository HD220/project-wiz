# ADR-0017: Gerenciamento de Streams e Requisições no LlmService para Prevenir Vazamento de Memória

## Status

- 🟢 **Aceito**

---

## Contexto

Foi identificado risco de vazamento de memória no serviço LLM (`LlmService`), utilizado para comunicação com modelos de linguagem. O problema estava relacionado ao crescimento indefinido dos mapas `pendingRequests` e `streamHandlers` na classe `LlmBridgeGateway`, que gerenciam requisições e streams. Sem um gerenciamento adequado, entradas antigas permaneciam nos mapas, levando a consumo excessivo de memória, especialmente em cenários com muitas requisições ou streams longos/interrompidos.

---

## Decisão

- Implementar **timeouts configuráveis** para limpar entradas antigas automaticamente.
- Implementar **cancelamento automático** de streams inativos ou abandonados.
- Adicionar **tratamento para falhas de comunicação**, garantindo que recursos sejam liberados mesmo em erros.
- Instrumentar o código com **logs detalhados** para monitorar criação, remoção e tamanho dos mapas.

---

## Consequências

**Positivas:**
- Redução significativa do risco de vazamento de memória.
- Maior estabilidade e previsibilidade do serviço.
- Facilidade para diagnóstico futuro via logs.

**Negativas:**
- Código um pouco mais complexo devido à lógica de timeout e cancelamento, porém controlada.

---

## Alternativas Consideradas

- **Coleta manual periódica via cron ou agendamento externo** — rejeitado por não ser reativo.
- **Uso de garbage collection explícita ou WeakMaps** — rejeitado por não permitir controle ativo.
- **Monitoramento externo com alertas, sem ação automática** — rejeitado por não resolver o problema de forma autônoma.

---

## Links Relacionados

- [ISSUE-0095 - Corrigir risco de vazamento de memória no LlmService](../../issues/completed/bug/ISSUE-0095-Corrigir-risco-vazamento-memoria-LlmService/README.md)