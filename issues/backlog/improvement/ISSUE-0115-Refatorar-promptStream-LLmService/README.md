# Refatorar função `promptStream` da `LlmService` para reduzir complexidade e responsabilidades

## Descrição

A função `promptStream`, localizada no arquivo `src/core/application/services/llm-service.ts`, possui aproximadamente 28 linhas e atualmente realiza múltiplas tarefas, tais como:

- Gerenciamento de Promise  
- Configuração de listeners para eventos  
- Tratamento de callbacks e erros  
- Definição de funções internas (`handleResponse`, `handleError`)  

Essa abordagem viola o princípio da responsabilidade única, dificultando a manutenção e a compreensão do código.

## Impacto

- Código difícil de entender e testar  
- Aumento do risco de introdução de bugs  
- Dificuldade para futuras extensões e melhorias  

## Sugestão

- Extrair as funções internas para métodos privados da classe  
- Dividir a lógica em funções menores e com foco único  
- Tornar a função principal um simples orquestrador da chamada e do fluxo de dados  

**Importante:**  
Não alterar funcionalidades, apenas melhorar a estrutura e legibilidade do código.

## Tipo

Improvement

## Escopo

Refatoração

## Prioridade

Média