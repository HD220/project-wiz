# ISSUE-0204: Remover/adaptar JSDoc em componentes model-configuration

## Tipo

Melhoria

## Contexto

Os seguintes arquivos do diretório `src/client/components/model-configuration` utilizam JSDoc para documentar as props dos componentes:

- MaxTokensSlider.tsx
- MemoryLimitSlider.tsx
- ModelIdSelector.tsx
- TemperatureSlider.tsx

O uso de JSDoc para documentação de código viola a [SDR-0002](../../../docs/sdr/SDR-0002-Nao-utilizar-JSDocs.md), que determina explicitamente: "Do not use JSDoc for code documentation".

## Problema

A documentação das props desses componentes está atualmente implementada via JSDoc, o que não está em conformidade com o padrão do projeto. Isso pode gerar inconsistências e dificultar a manutenção futura, além de contrariar as regras estabelecidas.

## Objetivo

Remover ou adaptar toda a documentação JSDoc presente nos arquivos listados, garantindo que a documentação de props siga o padrão aceito pelo projeto (ex: comentários simples, tipagem TypeScript clara e descritiva, documentação externa se necessário).

## Critérios de Aceite

- Todo uso de JSDoc para documentação de props deve ser removido ou adaptado nos arquivos indicados.
- O código resultante deve estar em conformidade com a SDR-0002 e demais padrões do projeto.
- Não deve haver perda de informações relevantes sobre as props; se necessário, migrar explicações para comentários simples ou documentação externa.
- O PR deve referenciar esta issue e citar a SDR-0002.

## Referências

- [SDR-0002 - Não utilizar JSDocs](../../../docs/sdr/SDR-0002-Nao-utilizar-JSDocs.md)