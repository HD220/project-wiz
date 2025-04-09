# Refatorar função `applyPrompt` do `prompt-processor.ts` para reduzir tamanho e responsabilidades

---

### Descrição

A função `applyPrompt`, localizada em `src/core/application/services/prompt-processor.ts`, possui quase 100 linhas e atualmente realiza múltiplas tarefas, incluindo:

- Validação de parâmetros
- Conversão de valores
- Sanitização
- Substituição de placeholders

Essa abordagem viola o princípio da responsabilidade única e dificulta a manutenção do código.

---

### Impacto

- Código difícil de entender e testar
- Aumenta o risco de introdução de bugs
- Dificulta futuras extensões e melhorias

---

### Sugestão de melhoria

- Extrair a validação para uma função separada
- Extrair a conversão para uma função separada
- Extrair a substituição para uma função separada
- Tornar `applyPrompt` um orquestrador simples dessas funções menores

**Importante:** Não alterar funcionalidades, apenas melhorar a estrutura e legibilidade do código.

---

### Critérios de aceitação

- A função `applyPrompt` deve ficar significativamente menor e mais legível
- Cada responsabilidade deve estar isolada em funções específicas
- Todos os testes existentes devem continuar passando
- Não deve haver alteração no comportamento externo da função

---

### Contexto adicional

Esta refatoração está alinhada com os princípios de Clean Code e Clean Architecture adotados no projeto, conforme documentado em `docs/refatoracao-clean-architecture/` e ADRs relacionadas.