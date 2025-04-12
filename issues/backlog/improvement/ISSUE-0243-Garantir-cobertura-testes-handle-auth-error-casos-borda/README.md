# ISSUE-0243 - Garantir cobertura de testes para handleAuthError em todos os casos de borda

## Tipo

improvement

## Descrição

A função `handleAuthError` deve ser testada para todos os tipos possíveis de entrada, incluindo:
- Instâncias de `Error`
- Strings
- Objetos literais
- `null`
- `undefined`
- Números
- Outros tipos inesperados

O objetivo é garantir robustez, previsibilidade e aderência aos princípios de clean code e testabilidade. Devem ser criados ou revisados testes unitários que cubram todos os cenários de borda, assegurando que a função se comporte corretamente independentemente do tipo de entrada.

## Critérios de Aceite

- Todos os tipos de entrada possíveis para `handleAuthError` estão cobertos por testes unitários.
- Os testes validam o comportamento esperado para cada cenário, incluindo tratamento de erros e respostas padronizadas.
- O código de teste segue os princípios de clean code: funções pequenas, nomes descritivos, baixo acoplamento e alta legibilidade.
- A rastreabilidade dos testes e dos requisitos está documentada nesta issue.

## Rastreamento e Referências

- Relacionado às melhorias de robustez e refatoração de `handleAuthError` (ver ISSUE-0240 e ISSUE-0242).
- Regras do projeto: ver `.roo/rules/rules.md` (Clean Code Principles, Testabilidade, DRY, SOLID).
- SDR-0001: Código-fonte, nomes e comentários em inglês.
- SDR-0002: Não utilizar JSDoc para documentação de código.
- ADR-0012: Clean Architecture para módulos LLM.
- docs/testing-strategy.md: Estratégia de testes do projeto.

## Observações

- Não implementar mudanças na função além do necessário para garantir testabilidade.
- Caso sejam identificados problemas de design ou testabilidade, criar issues específicas para refatoração.