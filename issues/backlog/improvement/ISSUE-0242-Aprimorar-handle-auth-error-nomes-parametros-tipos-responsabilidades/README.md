# Aprimorar handleAuthError: nomes de parâmetros, tratamento de tipos e segmentação de responsabilidades

## Tipo
improvement

## Descrição

A função `handleAuthError` apresenta atualmente as seguintes limitações:
- Utiliza nomes de parâmetros pouco descritivos, dificultando o entendimento do propósito de cada argumento (exemplo: nomes genéricos ao invés de algo como `fallbackMessage`).
- Não trata todos os tipos possíveis de erro, limitando-se a instâncias de `Error` e `string`, ignorando casos como objetos literais, `null`, `undefined` e outros tipos inesperados.
- Possui múltiplas responsabilidades sutis, centralizando lógica de formatação, fallback e decisão de mensagem em um único bloco, o que dificulta testes e manutenção.

### Objetivo

Refatorar a função `handleAuthError` para:
- Tornar os nomes dos parâmetros mais explícitos e autoexplicativos.
- Tratar de forma robusta outros tipos de erro (objetos literais, `null`, `undefined`, etc.), garantindo mensagens adequadas para cada cenário.
- Segmentar as responsabilidades em funções menores, puras e mais testáveis, seguindo os princípios de Clean Code e facilitando a manutenção futura.

## Rastreamento e Referências

- **Clean Code Principles:** Utilizar nomes descritivos, funções pequenas, responsabilidade única, código testável e modular. Referência: [docs/adr/ADR-0012-Clean-Architecture-LLM.md](../../../docs/adr/ADR-0012-Clean-Architecture-LLM.md)
- **SDR-0001:** Todo o código, nomes e comentários internos devem ser escritos em inglês. Referência: [docs/sdr/SDR-0001-Codigo-Fonte-Em-Ingles.md](../../../docs/sdr/SDR-0001-Codigo-Fonte-Em-Ingles.md)
- **Regras do Projeto:** Não adicionar escopo além do explicitamente solicitado. Refatorar sempre que violar Clean Code antes de implementar novas funcionalidades. Referência: [.roo/rules/rules.md](../../../.roo/rules/rules.md)

## Critérios de Aceite

- Todos os nomes de parâmetros da função e funções auxiliares devem ser claros e autoexplicativos.
- Todos os tipos de erro possíveis devem ser tratados de forma adequada.
- A lógica deve ser segmentada em funções menores, puras e testáveis.
- O código resultante deve estar em conformidade com Clean Code, ADR-0012 e SDR-0001.