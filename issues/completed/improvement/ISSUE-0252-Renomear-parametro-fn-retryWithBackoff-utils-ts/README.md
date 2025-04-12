# Renomear parâmetro fn para nome mais descritivo em retryWithBackoff (utils.ts)

## Tipo

improvement

## Descrição

A função `retryWithBackoff` localizada em `src/client/lib/utils.ts` utiliza atualmente o parâmetro `fn`, que é genérico e pouco descritivo. Para melhorar a clareza do código e aderir aos princípios de clean code, é necessário renomear este parâmetro para um nome mais explícito, como `asyncOperation` ou `operation`.

### Objetivo

- Substituir o nome do parâmetro `fn` por um nome mais descritivo em toda a implementação e chamadas de `retryWithBackoff`.
- Garantir que a alteração mantenha a compatibilidade e não quebre funcionalidades existentes.

### Justificativa e Rastreabilidade

- **Clean Code Principles:** O uso de nomes descritivos para funções e parâmetros é fundamental para a legibilidade e manutenção do código (ver seção 7.1 das regras do projeto).
- **Projeto:** Esta melhoria está alinhada com as regras gerais do projeto descritas em `.roo/rules/rules.md`, especialmente quanto à clareza, simplicidade e aderência ao padrão de nomes.
- **Referências:** 
  - [Clean Code Principles - Use descriptive names](../../../../.roo/rules/rules.md)
  - [SDR-0001 - Código-fonte em inglês](../../../../docs/sdr/SDR-0001-Codigo-Fonte-Em-Ingles.md)

### Critérios de Aceite

- O parâmetro `fn` deve ser renomeado para um nome mais descritivo em `retryWithBackoff` e em todos os locais de uso.
- O código deve permanecer funcional e testável.
- O nome escolhido deve refletir claramente o propósito do parâmetro (ex: `asyncOperation` ou `operation`).

---