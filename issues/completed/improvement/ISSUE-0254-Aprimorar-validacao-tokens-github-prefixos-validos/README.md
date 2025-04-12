# Aprimorar validação de tokens do GitHub para aceitar todos os prefixos válidos

## Descrição

A função `validateGitHubToken` localizada em `src/client/lib/validate-github-token.ts` atualmente valida apenas tokens do GitHub que começam com o prefixo `ghp_`. No entanto, o GitHub utiliza outros prefixos válidos para diferentes tipos de tokens, como `gho_`, `ghu_`, `ghs_`, `ghr_`, entre outros.

Esta limitação pode causar rejeição indevida de tokens válidos, prejudicando a experiência do usuário e a compatibilidade do sistema com as práticas atuais do GitHub.

## Objetivo

Atualizar a função `validateGitHubToken` para aceitar todos os prefixos válidos de tokens do GitHub, garantindo compatibilidade total e melhor experiência do usuário.

## Critérios de Aceitação

- A função deve reconhecer e validar tokens com todos os prefixos atualmente aceitos pelo GitHub (`ghp_`, `gho_`, `ghu_`, `ghs_`, `ghr_`, etc.).
- O código deve seguir os princípios de Clean Code e as regras do projeto.
- Devem ser mantidos testes (ou criados, se inexistentes) para cobrir todos os prefixos válidos.
- Não deve haver impacto negativo em outras funcionalidades relacionadas à autenticação com o GitHub.

## Rastreamento

- Arquivo alvo: `src/client/lib/validate-github-token.ts`

## Referências

- [SDR-0001](../../../docs/sdr/SDR-0001-Codigo-Fonte-Em-Ingles.md): Todo o código e comentários devem estar em inglês.
- [ADR-0012](../../../docs/adr/ADR-0012-Clean-Architecture-LLM.md): Seguir princípios de Clean Architecture.
- [Regras de Clean Code](../../../.roo/rules/rules.md#7-clean-code-principles): Nomes descritivos, funções pequenas, testabilidade, DRY, SOLID.

---
Tipo: improvement
Status: backlog