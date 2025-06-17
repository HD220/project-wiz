# Tarefa Pai: Excluir arquivos de teste obsoletos

## Descrição:

Esta tarefa pai coordena a exclusão física dos arquivos de teste identificados como obsoletos durante a fase de análise, incluindo testes para implementações anteriores baseadas em BullMQ que foram substituídas por Drizzle ORM (conforme ADR-004 e ADR-005).

## Contexto:

A remoção dos testes obsoletos é crucial para garantir um conjunto de testes limpo e alinhado com a nova arquitetura Drizzle ORM. Esta tarefa depende da conclusão da tarefa pai 01.01, que fornece a lista de arquivos a serem excluídos conforme análise das ADRs 004 e 005. Esta tarefa foi decomposta em sub-tarefas mais granulares para executar a exclusão.

## Sub-tarefas:

Esta tarefa pai é composta pela seguinte sub-tarefa:

- [01.03.01 - Executar exclusão de arquivos de teste obsoletos](03-delete-obsolete-tests/01-execute-test-deletion.md)

## Expected Deliverable:

A conclusão da sub-tarefa listada acima, resultando na exclusão bem-sucedida de todos os arquivos de teste obsoletos.
