# Sub-tarefa: Verificar isolamento das interfaces nos adapters de Infraestrutura

## Descrição:

Revisar as implementações dos adapters de Infraestrutura (`LLM Adapter`, `FileSystem Tool Adapter`, `Terminal Tool Adapter`) para garantir que eles dependam apenas das interfaces definidas nas camadas internas e não de outras implementações concretas de Infraestrutura.

## Contexto:

Na Clean Architecture, a camada de Infraestrutura deve depender apenas das camadas internas (Aplicação e Domínio) através das interfaces (Ports). É crucial garantir que os adapters implementados não tenham dependências diretas de outros adapters ou classes concretas dentro da própria camada de Infraestrutura, promovendo o isolamento e a substituibilidade.

## Specific Instructions:

1. Abra os arquivos dos adapters implementados: `src/infrastructure/adapters/llm/openai.llm.adapter.ts` (ou o nome do seu LLM adapter), `src/infrastructure/adapters/tools/filesystem.tool.adapter.ts`, e `src/infrastructure/adapters/tools/terminal.tool.adapter.ts`.
2. Para cada adapter, revise as injeções de dependência em seus construtores.
3. Verifique se todas as dependências são interfaces (Ports) definidas nas camadas de Domínio ou Aplicação.
4. Garanta que não há importações diretas ou referências a outras classes concretas dentro da pasta `src/infrastructure`.
5. Se encontrar alguma dependência incorreta, identifique a interface apropriada na camada de Domínio/Aplicação que deve ser utilizada em seu lugar.
6. Adicione comentários no código explicando as dependências injetadas.
7. Não crie testes nesta fase.

## Expected Deliverable:

Os arquivos dos adapters de Infraestrutura revisados, com as dependências verificadas para garantir o isolamento e a aderência aos princípios da Clean Architecture.