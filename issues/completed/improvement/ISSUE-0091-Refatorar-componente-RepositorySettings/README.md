### ISSUE: Refatorar componente RepositorySettings

**Descrição:**  
O componente `src/client/components/repository-settings.tsx` originalmente possuía mais de 350 linhas, misturando múltiplas tabs, listas, configurações e permissões, violando princípios de Clean Code.

**Objetivo:**  
Dividir em subcomponentes, separar lógica de dados, melhorar clareza e testabilidade.

---

## Status: **Concluído**

## Resumo da implementação:

- O componente foi reduzido para cerca de 80 linhas, atuando como container.
- A lógica de estado e manipulação foi extraída para o hook `useRepositorySettings`.
- A interface foi segmentada em subcomponentes reutilizáveis:
  - `RepositoryCard` para exibir repositórios
  - `RepositoryConfigForm` para configurações
  - `AccessTokenForm` para tokens de acesso
  - `AddRepositoryButton` para adicionar repositórios
- Cada aba da interface utiliza um subcomponente dedicado, melhorando clareza e modularidade.
- A testabilidade foi aprimorada pela separação de responsabilidades.

---

## Conclusão:

A refatoração atendeu aos objetivos definidos, melhorando a organização, legibilidade e manutenção do componente `RepositorySettings`.