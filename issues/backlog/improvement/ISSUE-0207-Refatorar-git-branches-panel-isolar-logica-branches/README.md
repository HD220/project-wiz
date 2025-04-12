# Refatorar git-branches-panel: isolar lógica de manipulação de branches

## Contexto

O componente `src/client/components/git-branches-panel.tsx` atualmente pode estar manipulando dados de branches Git diretamente, misturando lógica de domínio/aplicação com a camada de apresentação. Essa abordagem viola os princípios de Clean Architecture, dificultando a manutenção, testabilidade e evolução do código.

## Problema

- Lógica de manipulação de branches Git está acoplada ao componente de UI.
- Mistura de responsabilidades: apresentação e domínio/aplicação no mesmo componente.
- Dificulta a reutilização, testes unitários e manutenção.

## Objetivo da Melhoria

Isolar toda a lógica de manipulação de branches Git em um hook ou serviço dedicado, garantindo que o componente `git-branches-panel` seja responsável apenas pela apresentação dos dados. Essa separação deve seguir os princípios de Clean Architecture adotados no projeto.

## Critérios de Aceite

- Toda a lógica de manipulação de branches deve ser extraída do componente e centralizada em um hook ou serviço dedicado.
- O componente deve receber apenas dados e callbacks necessários para renderização e interação.
- O código resultante deve ser mais modular, testável e alinhado à Clean Architecture.
- Documentar as mudanças realizadas no handoff.md da issue.

## Referências

- [ADR-0012: Clean Architecture nos módulos LLM](../../../docs/adr/ADR-0012-Clean-Architecture-LLM.md)
- [docs/refatoracao-clean-architecture/](../../../docs/refatoracao-clean-architecture/)