# Remover JSDoc de src/client/lib/handle-auth-error.ts para conformidade com SDR-0002

## Tipo

improvement

## Descrição

O arquivo `src/client/lib/handle-auth-error.ts` utiliza bloco JSDoc para documentar a função `handleAuthError`, o que viola a [SDR-0002](../../../docs/sdr/SDR-0002-Nao-utilizar-JSDocs.md), que proíbe o uso de JSDoc em todo o código-fonte do projeto.

Esta issue tem como objetivo remover o bloco JSDoc presente no arquivo, garantindo a conformidade com as regras do projeto. Caso necessário, devem ser mantidos apenas comentários sucintos e objetivos, fora do padrão JSDoc, para preservar a clareza do código.

## Critérios de Aceite

- Remover todo e qualquer bloco JSDoc do arquivo `src/client/lib/handle-auth-error.ts`.
- Garantir que não restem comentários no padrão JSDoc.
- Se necessário, adicionar comentários breves e objetivos, fora do padrão JSDoc, para manter a clareza do código.
- Referenciar a [SDR-0002](../../../docs/sdr/SDR-0002-Nao-utilizar-JSDocs.md) e as regras gerais do projeto.

## Rastreabilidade

- [SDR-0002 - Não utilizar JSDocs](../../../docs/sdr/SDR-0002-Nao-utilizar-JSDocs.md)
- [Regras do Projeto](../../../.roo/rules/rules.md)