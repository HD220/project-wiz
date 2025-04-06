## Handoff

### Contexto

A implementação do cache de prompts e respostas visa otimizar o desempenho do sistema, reduzindo a latência e o consumo de recursos.

### Requisitos

- Implementar um cache eficiente para armazenar prompts e respostas.
- Utilizar um algoritmo de cache como LRU (Least Recently Used).
- Permitir a configuração do tamanho máximo do cache.
- Implementar a invalidação do cache quando necessário.
- Escrever testes unitários para garantir a funcionalidade do cache.

### Informações Adicionais

- O cache deve ser implementado no `WorkerService` (src/core/services/llm/WorkerService.ts).
- Considerar a utilização de bibliotecas de cache existentes.
- Analisar a necessidade de persistência do cache em disco.

### Próximos Passos

- Implementar o cache no `WorkerService`.
- Configurar o tamanho máximo do cache.
- Implementar a invalidação do cache.
- Escrever testes unitários.
- Documentar a implementação.
