# Tarefa Pai: Excluir arquivos de código obsoletos

## Descrição:

Esta tarefa pai coordena a exclusão física dos arquivos de código-fonte identificados como obsoletos durante a fase de análise (conforme ADR-005), incluindo implementações anteriores baseadas em BullMQ que foram substituídas por Drizzle ORM (ADR-004).

## Contexto:

A remoção do código obsoleto é um passo importante para garantir um ambiente limpo para a nova implementação com Drizzle ORM. Esta tarefa depende da conclusão da tarefa pai 01.01, que fornece a lista de arquivos a serem excluídos conforme análise das ADRs 004 e 005. Esta tarefa foi decomposta em sub-tarefas mais granulares para executar a exclusão.

## Sub-tarefas:

Esta tarefa pai é composta pela seguinte sub-tarefa:

- [01.02.01 - Executar exclusão de arquivos de código obsoletos](02-delete-obsolete-code/01-execute-code-deletion.md)

## Expected Deliverable:

A conclusão da sub-tarefa listada acima, resultando na exclusão bem-sucedida de todos os arquivos de código-fonte obsoletos.
