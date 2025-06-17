# Sub-sub-tarefa: Executar build/lint para verificar referências restantes

## Descrição:

Executar os comandos de build e lint do projeto para identificar quaisquer erros de compilação ou linting causados por referências a arquivos obsoletos que foram excluídos.

## Contexto:

Após a exclusão do código e testes obsoletos, é essencial verificar se o restante do codebase ainda contém referências a esses arquivos. Executar o build e o lint são as formas mais eficazes de identificar esses problemas automaticamente. Esta sub-sub-tarefa depende da conclusão das tarefas pai 01.02 e 01.03.

## Specific Instructions:

1.  Abra um terminal no diretório raiz do projeto (`d:\Documentos\Pessoal\Github\project-wiz`).
2.  Execute o comando de build do projeto (ex: `npm run build` ou `yarn build`).
3.  Execute o comando de lint do projeto (ex: `npm run lint` ou `yarn lint`).
4.  Capture a saída dos comandos, prestando atenção especial a erros relacionados a módulos ou arquivos não encontrados.
5.  Ignore avisos (warnings) nesta fase, focando apenas nos erros que impedem o build ou linting.

## Expected Deliverable:

A saída dos comandos de build e lint, listando quaisquer erros de referência a arquivos obsoletos. Esta saída será usada na sub-sub-tarefa posterior para corrigir os erros.