# Remover JSDoc de src/client/lib/export-history.ts para conformidade com SDR-0002

## Tipo
improvement

## Descrição
O arquivo `src/client/lib/export-history.ts` utiliza bloco JSDoc para documentar a função `exportDataAsFile`, o que viola a [SDR-0002](../../../docs/sdr/SDR-0002-Nao-utilizar-JSDocs.md) do projeto, que proíbe o uso de JSDoc em todo o código-fonte. 

Esta melhoria tem como objetivo remover o bloco JSDoc presente no arquivo, mantendo apenas comentários sucintos e objetivos, fora do padrão JSDoc, caso necessário para esclarecimento do código. 

## Critérios de Aceite
- Remover todo e qualquer bloco JSDoc do arquivo `src/client/lib/export-history.ts`.
- Garantir que não restem anotações ou sintaxe JSDoc.
- Se necessário, manter apenas comentários simples, objetivos e fora do padrão JSDoc.
- Garantir conformidade com a [SDR-0002 - Não utilizar JSDocs](../../../docs/sdr/SDR-0002-Nao-utilizar-JSDocs.md).

## Rastreamento e Referências
- [SDR-0002 - Não utilizar JSDocs](../../../docs/sdr/SDR-0002-Nao-utilizar-JSDocs.md)
- Regras gerais do projeto em [.roo/rules/rules.md](../../../.roo/rules/rules.md)