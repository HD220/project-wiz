# Refatorar git-status-panel: isolar lógica de status

## Problema

O componente `src/client/components/git-status-panel.tsx` pode estar manipulando diretamente a lógica de cálculo de status do repositório Git, misturando lógica de domínio/aplicação com a camada de apresentação. Isso viola os princípios de Clean Architecture, dificultando a manutenção, testabilidade e reutilização do código.

## Recomendação

Isolar toda a lógica de cálculo de status do repositório Git em um hook ou serviço dedicado, mantendo o componente responsável apenas pela apresentação dos dados. O novo hook ou serviço deve ser implementado em local apropriado, seguindo a arquitetura do projeto.

## Critérios de Aceite

- Nenhuma lógica de cálculo de status deve permanecer no componente de apresentação.
- O componente deve consumir apenas dados prontos para exibição.
- O hook ou serviço deve ser testável e reutilizável.