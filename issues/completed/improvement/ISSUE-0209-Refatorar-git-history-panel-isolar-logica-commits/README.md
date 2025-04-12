# Refatorar git-history-panel: isolar lógica de formatação e filtragem de commits

## Contexto

O componente `src/client/components/git-history-panel.tsx` atualmente pode estar manipulando diretamente lógica de formatação e/ou filtragem de commits, misturando responsabilidades de domínio/aplicação com a camada de apresentação (UI).

Essa abordagem viola princípios de Clean Architecture e dificulta a manutenção, testabilidade e evolução do código, pois lógica de negócio fica acoplada à interface.

## Melhorias Recomendadas

- Isolar toda a lógica de formatação e filtragem de commits em um hook dedicado (ex: `useGitHistoryFormatting`) ou serviço específico.
- Garantir que o componente de apresentação (`git-history-panel`) receba apenas os dados já processados/prontos para exibição.
- Seguir os princípios de Clean Architecture, separando claramente as responsabilidades de domínio/aplicação e apresentação.
- Avaliar se parte da lógica pode ser compartilhada com outros componentes (ex: painel de branches, painel de commits) e, se sim, centralizar em um serviço/utilitário.

## Critérios de Aceite

- Nenhuma lógica de formatação ou filtragem de commits deve permanecer no componente de UI.
- O componente deve consumir apenas dados já preparados para exibição.
- O novo hook/serviço deve ser testável de forma isolada.
- O código resultante deve estar mais simples, legível e alinhado à Clean Architecture.

## Observações

Esta issue trata apenas da análise e refatoração arquitetural. Não implementar novas funcionalidades ou alterar comportamentos além do necessário para isolar a lógica.