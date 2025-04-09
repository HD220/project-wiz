# ISSUE-0095 - Corrigir risco de vazamento de memória na `LlmService` devido a listeners não removidos

## Descrição

Na classe `LlmService` (`src/core/application/services/llm-service.ts`), o método `promptStream` adiciona listeners para eventos `'response'` e `'error'` no `worker`, mas **não remove esses listeners** após a conclusão da operação.

## Impacto

- Pode causar vazamento de memória
- Listeners acumulados podem gerar comportamentos inesperados
- Dificulta o gerenciamento correto do ciclo de vida

## Sugestão

- Implementar mecanismo para remover os listeners após a resposta final ou erro
- Avaliar se a interface `IWorkerService` deve suportar método `off` para remoção
- Documentar a necessidade de gerenciamento correto de listeners

## Prioridade

Alta (pode afetar estabilidade e performance)

## Status

Backlog

## Tipo

Bug