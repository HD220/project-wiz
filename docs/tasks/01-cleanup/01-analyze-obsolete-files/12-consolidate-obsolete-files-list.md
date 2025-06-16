# Sub-sub-tarefa: Consolidar lista final de arquivos obsoletos

## Descrição:

Consolidar as listas temporárias de arquivos obsoletos geradas nas sub-sub-tarefas de análise anteriores em uma única lista final de arquivos a serem excluídos.

## Contexto:

As sub-sub-tarefas de análise (01.01.01 a 01.01.11) geraram listas temporárias de arquivos obsoletos por diretório ou arquivo específico. Esta sub-sub-tarefa finaliza a fase de análise combinando todas essas listas em uma única lista mestra que será usada nas sub-tarefas de exclusão (01.02 e 01.03).

## Specific Instructions:

1.  Colete as listas temporárias de arquivos obsoletos geradas nas sub-sub-tarefas 01.01.01 a 01.01.11.
2.  Combine todas as listas temporárias em uma única lista mestra.
3.  Remova quaisquer duplicatas, se houver.
4.  Revise a lista final para garantir que ela contenha apenas os arquivos que devem ser excluídos e que nenhum arquivo a ser refatorado (como `src/infrastructure/repositories/job-drizzle.repository.ts`) foi incluído por engano.
5.  Salve a lista final em um arquivo (ex: `docs/tasks/obsolete_files_list.md`).

## Expected Deliverable:

Um arquivo (`docs/tasks/obsolete_files_list.md`) contendo a lista final e consolidada de todos os arquivos de código-fonte e teste identificados como obsoletos e a serem excluídos nas sub-tarefas 01.02 e 01.03.