# Sub-tarefa: Aplicar Object Calisthenics nos adapters de Infraestrutura

## Descrição:

Revisar e refatorar as implementações dos adapters de Infraestrutura (`LLM Adapter`, `FileSystem Tool Adapter`, `Terminal Tool Adapter`) para garantir a aderência rigorosa aos princípios de Object Calisthenics.

## Contexto:

A aplicação dos princípios de Object Calisthenics nos adapters da camada de Infraestrutura é fundamental para garantir que a lógica de interação com serviços externos seja implementada de forma limpa, modular e fácil de entender. Esta sub-tarefa foca em refinar o código desses adapters para atingir alta qualidade.

## Specific Instructions:

1. Abra os arquivos dos adapters implementados: `src/infrastructure/adapters/llm/openai.llm.adapter.ts` (ou o nome do seu LLM adapter), `src/infrastructure/adapters/tools/filesystem.tool.adapter.ts`, e `src/infrastructure/adapters/tools/terminal.tool.adapter.ts`.
2. Para cada classe e método, verifique a aderência aos princípios de Object Calisthenics:
    *   Um nível de indentação por método.
    *   Não usar a palavra-chave `else`.
    *   Encapsular primitivos e strings em Value Objects (se aplicável e não feito anteriormente).
    *   First-Class Collections (se aplicável e não feito anteriormente).
    *   Um ponto por linha (limitar encadeamento de métodos).
    *   Não abreviar nomes.
    *   Manter classes pequenas (idealmente abaixo de 50 linhas).
    *   Manter métodos pequenos (idealmente abaixo de 15 linhas).
    *   No máximo duas variáveis de instância por classe (favorecer composição).
    *   Métodos devem descrever o que um objeto *faz*, não apenas expor estado.
    *   Evitar comentários onde o código pode ser auto-explicativo.
3. Refatore o código conforme necessário para corrigir quaisquer violações dos princípios.
4. Não crie testes nesta fase.

## Expected Deliverable:

Arquivos de código-source para os adapters de Infraestrutura revisados e refatorados, demonstrando alta aderência aos princípios de Object Calisthenics.