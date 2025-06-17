# Sub-sub-tarefa: Analisar diretórios de teste correspondentes para arquivos obsoletos

## Descrição:

Analisar os diretórios de teste (`tests/unit` e `tests/integration`) para identificar quais arquivos de teste estão associados ao código obsoleto identificado nas sub-sub-tarefas anteriores e devem ser removidos.

## Contexto:

A implementação anterior de agentes, workers e filas possui testes unitários e de integração correspondentes. Como o código de produção será removido ou refatorado significativamente, os testes associados a essa lógica antiga também são obsoletos e devem ser excluídos para evitar confusão e garantir que apenas testes relevantes para a nova arquitetura existam.

## Specific Instructions:

1.  Navegue pelos diretórios `tests/unit` e `tests/integration`.
2.  Examine os nomes e o conteúdo dos arquivos de teste (`.spec.ts`).
3.  Com base nos arquivos de código-fonte obsoletos identificados nas sub-sub-tarefas 01.01.01 a 01.01.10, identifique os arquivos de teste que testam especificamente essa lógica obsoleta.
4.  Crie uma lista temporária dos caminhos dos arquivos de teste identificados como obsoletos.
5.  Tenha cuidado para não incluir arquivos de teste que possam ser relevantes para utilitários genéricos ou outras partes do sistema que não são obsoletas.

## Expected Deliverable:

Uma lista temporária dos caminhos dos arquivos de teste obsoletos encontrados nos diretórios `tests/unit` e `tests/integration`. Esta lista será consolidada em uma sub-sub-tarefa posterior.