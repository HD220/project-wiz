# Sub-sub-tarefa: Executar exclusão de arquivos de teste obsoletos

## Descrição:

Executar os comandos de exclusão para remover fisicamente os arquivos de teste identificados como obsoletos.

## Contexto:

Esta sub-sub-tarefa realiza a ação concreta de remover os testes obsoletos do sistema de arquivos. Ela depende da conclusão da tarefa pai 01.01, que fornece a lista de arquivos a serem excluídos. É crucial garantir que apenas os testes obsoletos sejam removidos e que nenhum teste novo seja criado nesta fase.

## Specific Instructions:

1.  Obtenha a lista final de arquivos obsoletos gerada na sub-sub-tarefa 01.01.12.
2.  Filtre a lista para incluir apenas os arquivos de teste (excluindo arquivos de código-fonte).
3.  Abra um terminal no diretório raiz do projeto (`d:\Documentos\Pessoal\Github\project-wiz`).
4.  Para cada caminho de arquivo de teste na lista filtrada, execute o comando de exclusão apropriado para o seu sistema operacional (ex: `Remove-Item` no Windows PowerShell, `rm` no Linux/macOS).
5.  Monitore a saída do terminal para garantir que os comandos de exclusão foram executados sem erros.
6.  Verifique manualmente nos diretórios correspondentes se os arquivos foram removidos.
7.  **Lembre-se rigorosamente de não criar nenhum teste novo** nesta fase.

## Expected Deliverable:

Confirmação no terminal e verificação manual de que todos os arquivos de teste obsoletos listados foram excluídos com sucesso do sistema de arquivos.