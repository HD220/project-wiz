# Remover JSDoc e traduzir comentários para inglês em utils.ts

## Context

The file `src/client/lib/utils.ts` currently uses JSDoc blocks, which is explicitly prohibited by [SDR-0002](../../../../docs/sdr/SDR-0002-Nao-utilizar-JSDocs.md). Additionally, it contains comments and documentation in Portuguese, violating [SDR-0001](../../../../docs/sdr/SDR-0001-Codigo-Fonte-Em-Ingles.md), which requires all source code, comments, and internal messages to be written in English.

## Scope

- Remove all JSDoc blocks from `src/client/lib/utils.ts`.
- Translate all comments/documentation from Portuguese to English.
- Keep only succinct and objective comments where necessary, following clean code principles.

## Traceability

- [SDR-0001: All source code, including comments, must be in English.](../../../../docs/sdr/SDR-0001-Codigo-Fonte-Em-Ingles.md)
- [SDR-0002: Do not use JSDoc for code documentation.](../../../../docs/sdr/SDR-0002-Nao-utilizar-JSDocs.md)

## Classification

Type: improvement

## Acceptance Criteria

- No JSDoc blocks remain in `src/client/lib/utils.ts`.
- All comments are in English and are succinct and relevant.
- The file fully complies with SDR-0001 and SDR-0002.