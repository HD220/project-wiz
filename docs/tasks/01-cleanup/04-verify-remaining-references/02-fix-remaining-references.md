# Sub-sub-tarefa: Corrigir referências restantes a arquivos obsoletos

## Descrição:

Analisar os erros de build e lint identificados na sub-sub-tarefa anterior e corrigir as referências restantes a arquivos obsoletos no código-fonte.

## Contexto:

Os erros de build e lint indicam partes do código que ainda tentam importar ou usar símbolos definidos nos arquivos obsoletos que foram excluídos. Esta sub-sub-tarefa foca em modificar o código remanescente para remover ou ajustar essas referências, garantindo que o projeto compile e passe no lint sem erros relacionados a arquivos ausentes. Esta sub-sub-tarefa depende da conclusão da sub-sub-tarefa 01.04.01.

## Specific Instructions:

1.  Obtenha a saída dos comandos de build e lint da sub-sub-tarefa 01.04.01.
2.  Para cada erro listado na saída:
    *   Identifique o arquivo e a linha onde o erro ocorre.
    *   Analise o código na localização do erro.
    *   Determine se a referência obsoleta pode ser simplesmente removida (se o código não for mais necessário) ou se precisa ser substituída por uma referência a um novo componente na nova arquitetura (embora a implementação dos novos componentes venha em tarefas posteriores, a referência pode ser comentada ou substituída por um placeholder se necessário para o build/lint passar).
    *   Modifique o arquivo de código-fonte para corrigir a referência obsoleta.
3.  Repita o build e o lint conforme necessário até que não haja mais erros relacionados a arquivos ausentes.
4.  **Não crie testes** nesta fase.

## Expected Deliverable:

O código-fonte do projeto modificado para remover ou ajustar todas as referências a arquivos obsoletos, resultando em um build e linting bem-sucedidos sem erros relacionados a arquivos ausentes.