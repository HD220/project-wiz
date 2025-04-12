# Refatorar llm-session-control: isolar lógica de sessão

## Contexto

O componente [`src/client/components/llm-session-control.tsx`](../../../src/client/components/llm-session-control.tsx) atualmente manipula diretamente a lógica de controle de sessões LLM, misturando responsabilidades de domínio/aplicação com a camada de apresentação.

## Problema

- Lógica de domínio e aplicação (controle e manipulação de sessões LLM) está acoplada ao componente de UI.
- Isso viola princípios de Clean Architecture, dificultando manutenção, testabilidade e evolução do código.
- O componente se torna menos reutilizável e mais difícil de entender.

## Recomendação

- Isolar toda a lógica de manipulação de sessões LLM em um hook dedicado (`useLlmSessionControl` ou similar) ou em um serviço específico.
- O componente deve se concentrar apenas na apresentação e interação com o usuário, consumindo a lógica isolada via hook/serviço.
- Seguir os princípios de Clean Architecture, promovendo separação de responsabilidades, testabilidade e facilidade de manutenção.

## Critérios de Aceite

- Nenhuma lógica de domínio ou manipulação de sessão LLM deve permanecer no componente de apresentação.
- Toda a lógica deve ser movida para um hook ou serviço dedicado.
- O componente deve consumir apenas a interface exposta pelo hook/serviço.
- O código resultante deve ser mais simples, testável e alinhado à Clean Architecture.

## Referências

- [docs/adr/ADR-0012-Clean-Architecture-LLM.md](../../../docs/adr/ADR-0012-Clean-Architecture-LLM.md)
- [docs/refatoracao-clean-architecture/](../../../docs/refatoracao-clean-architecture/)