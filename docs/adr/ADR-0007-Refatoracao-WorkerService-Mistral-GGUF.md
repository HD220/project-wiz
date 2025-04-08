# ADR 0007: Refatoração do WorkerService para Suporte a Modelos Mistral (GGUF) com node-llama-cpp

## Status

REJECTED

## Motivo da Rejeição

Esta funcionalidade não será implementada conforme decisão do time, que optou por priorizar outras features no roadmap atual.

## Contexto

O objetivo é refatorar o `WorkerService` para suportar modelos Mistral (GGUF) usando `node-llama-cpp`, garantindo o uso de `utilityProcess.fork` e evitando a criação de um worker para cada modelo.

A arquitetura atual do `WorkerService` pode não ser otimizada para o carregamento e gerenciamento eficiente de múltiplos modelos GGUF, especialmente o Mistral. Criar um worker para cada modelo pode levar a um alto consumo de recursos e baixa escalabilidade.

**Restrições:**

*   Obrigatório usar `utilityProcess.fork`.
*   Não criar um worker para cada modelo.

## Decisão

Implementar um único processo worker gerenciado pelo `WorkerService`. O worker deve ser capaz de carregar e descarregar modelos GGUF dinamicamente, conforme necessário. A mensagem enviada ao worker deve especificar qual modelo GGUF deve ser usado para a inferência. Implementar um cache de modelos no worker para evitar recarregamentos desnecessários. Monitorar o uso de memória do worker e liberar modelos não utilizados. Implementar tratamento de erros robusto no worker.

## Consequências

*   Melhor utilização de recursos.
*   Maior escalabilidade.
*   Maior flexibilidade para adicionar novos modelos.
*   Complexidade adicional no gerenciamento do worker e dos modelos.
*   Necessidade de implementar um cache de modelos eficiente.
*   Necessidade de monitorar o uso de memória para evitar problemas de desempenho.

## Alternativas consideradas

*   **Criar um worker para cada modelo:** Descartado devido ao alto consumo de recursos e baixa escalabilidade.
*   **Usar um pool de workers:** Descartado devido à complexidade adicional no gerenciamento do pool e na distribuição das tarefas.

## Implementação

*   Modificar o `WorkerService` para gerenciar um único worker.
*   Implementar a lógica de carregamento e descarregamento de modelos no worker.
*   Adicionar tratamento de erros e logging no worker.
*   Implementar testes unitários e de integração.

## Links relacionados

*   [Link para a issue relacionada](link)