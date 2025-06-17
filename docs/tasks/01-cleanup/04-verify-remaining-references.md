# Tarefa Pai: Verificar referências restantes após exclusão

## Descrição:

Esta tarefa pai coordena a verificação do código-fonte restante para garantir que não há referências pendentes à implementação antiga (BullMQ) ou erros causados pela exclusão dos arquivos obsoletos, conforme definido nas ADRs 004 e 005.

## Contexto:

Após remover o código e os testes obsoletos da implementação anterior, é crucial verificar se o código remanescente está totalmente adaptado à nova arquitetura com Drizzle ORM. Esta tarefa depende da conclusão das tarefas pai 01.02 e 01.03. Esta tarefa foi decomposta em sub-tarefas mais granulares para executar a verificação e correção de acordo com as decisões arquiteturais.

## Sub-tarefas:

Esta tarefa pai é composta pelas seguintes sub-tarefas:

- [01.04.01 - Executar build/lint para verificar referências restantes](04-verify-remaining-references/01-run-build-lint.md)
- [01.04.02 - Corrigir referências restantes a arquivos obsoletos](04-verify-remaining-references/02-fix-remaining-references.md)

## Expected Deliverable:

A conclusão de todas as sub-tarefas listadas acima, resultando em um projeto que compila e passa no lint sem erros de referência a arquivos obsoletos.
