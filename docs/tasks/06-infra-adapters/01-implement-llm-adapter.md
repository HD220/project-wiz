# Sub-tarefa: Implementar LLM Adapter

## Descrição:

Implementar uma classe de adapter na camada de Infraestrutura que fornece a implementação concreta para a interface `LLMInterface.interface.ts`.

## Contexto:

A interface `LLMInterface` define o contrato para interação com modelos de linguagem na camada de Aplicação. O LLM Adapter na camada de Infraestrutura será responsável por traduzir essas chamadas genéricas para a API específica de um provedor de LLM (ex: OpenAI, Gemini) utilizando uma biblioteca ou SDK apropriado.

## Specific Instructions:

1. Crie um novo arquivo para o LLM Adapter (ex: `src/infrastructure/adapters/llm/openai.llm.adapter.ts` ou `gemini.llm.adapter.ts`).
2. Defina a classe do adapter e faça com que ela implemente a interface `LLMInterface.interface.ts`.
3. Injete as dependências necessárias para interagir com o provedor de LLM (ex: chave de API, configurações).
4. Implemente os métodos definidos na interface `LLMInterface`, utilizando a biblioteca/SDK do provedor de LLM para fazer as chamadas reais.
5. Garanta que o adapter traduza corretamente os parâmetros e retornos entre a interface genérica e a API específica do provedor.
6. Mantenha a lógica específica do provedor de LLM isolada dentro deste adapter.
7. Adicione comentários JSDoc explicando o propósito da classe, do construtor e dos métodos.
8. Não crie testes nesta fase.

## Expected Deliverable:

Um novo arquivo contendo a implementação de um LLM Adapter na camada de Infraestrutura, aderindo à interface `LLMInterface.interface.ts` e utilizando uma biblioteca/SDK para interagir com um provedor de LLM específico.