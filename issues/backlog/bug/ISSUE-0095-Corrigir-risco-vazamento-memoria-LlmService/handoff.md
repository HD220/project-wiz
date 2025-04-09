# Handoff - ISSUE-0095 - Corrigir risco de vazamento de memória na `LlmService`

## Contexto

Foi identificado que a classe `LlmService` (`src/core/application/services/llm-service.ts`) adiciona listeners para `'response'` e `'error'` no método `promptStream`, mas **não remove esses listeners** após a conclusão da operação.

## Problema

- Potencial vazamento de memória devido a listeners acumulados
- Pode causar comportamentos inesperados em chamadas subsequentes
- Dificulta o gerenciamento do ciclo de vida dos workers

## Objetivo da Correção

- Garantir que todos os listeners adicionados sejam removidos após a resposta final ou erro
- Avaliar se a interface `IWorkerService` deve expor método `off` para remoção de listeners
- Documentar a necessidade de gerenciamento correto de listeners

## Critérios de Aceite

- Listeners são removidos corretamente após a conclusão da operação
- Não há vazamento de memória detectável relacionado a listeners
- Código documentado explicando a importância da remoção
- Testes cobrindo o ciclo completo, incluindo adição e remoção de listeners

## Prioridade

Alta

## Dependências

- Revisão da interface `IWorkerService`
- Testes de stress para validar ausência de vazamento

## Status

Backlog