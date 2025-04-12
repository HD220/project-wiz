# Refatorar model-configuration: isolar lógica de transformação/mapeamento de models

## Contexto

O componente `src/client/components/model-configuration.tsx` atualmente pode estar manipulando diretamente lógica de transformação ou mapeamento de models, misturando lógica de domínio/aplicação com a camada de apresentação (UI). Essa abordagem viola os princípios de Clean Architecture, dificultando a manutenção, testabilidade e evolução do código.

## Problema

- Lógica de transformação ou mapeamento de models está acoplada ao componente de apresentação.
- Mistura de responsabilidades entre UI e domínio/aplicação.
- Dificuldade para testar e reutilizar a lógica de transformação/mapeamento.

## Objetivo

Refatorar o componente para isolar toda a lógica de transformação/mapeamento de models em um hook ou serviço dedicado, seguindo os princípios de Clean Architecture.

## Critérios de Aceitação

- Toda a lógica de transformação/mapeamento de models deve ser extraída do componente e centralizada em um hook ou serviço dedicado.
- O componente `model-configuration.tsx` deve se concentrar apenas na apresentação e interação com o usuário.
- O novo hook ou serviço deve ser facilmente testável e reutilizável.
- O código resultante deve seguir os padrões de nomenclatura, modularidade e organização do projeto.
- Não deve haver regressão de funcionalidades.

## Referências

- [docs/adr/ADR-0012-Clean-Architecture-LLM.md](../../../docs/adr/ADR-0012-Clean-Architecture-LLM.md)
- [docs/refatoracao-clean-architecture/README.md](../../../docs/refatoracao-clean-architecture/README.md)