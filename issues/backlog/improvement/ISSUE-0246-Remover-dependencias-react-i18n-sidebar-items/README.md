# ISSUE-0246: Remover dependências de React e i18n dos utilitários de navegação (sidebar-items.tsx)

## Tipo

improvement

## Descrição

O arquivo `src/client/lib/sidebar-items.tsx` atualmente depende diretamente de `React` e `@lingui/macro`, o que viola os princípios de Clean Architecture definidos no [ADR-0012](../../../docs/adr/ADR-0012-Clean-Architecture-LLM.md) e dificulta o reuso e a testabilidade dos utilitários de navegação. 

Esta issue tem como objetivo refatorar o(s) utilitário(s) de navegação para eliminar qualquer dependência de frameworks de UI (como React) e de bibliotecas de internacionalização (como @lingui/macro), mantendo apenas dados puros e chaves de tradução. A responsabilidade de apresentação e tradução deve ser isolada em camadas superiores, conforme as regras do projeto.

## Critérios de Aceite

- O arquivo `src/client/lib/sidebar-items.tsx` não deve importar ou depender de `React` nem de `@lingui/macro`.
- Os dados de navegação devem ser exportados em formato puro (objetos, arrays, etc.), contendo apenas chaves de tradução, sem elementos JSX ou funções de tradução.
- A responsabilidade de renderização e tradução deve ser transferida para a camada de apresentação.
- O código resultante deve estar em conformidade com o [ADR-0012 - Clean Architecture](../../../docs/adr/ADR-0012-Clean-Architecture-LLM.md) e com as [regras do projeto](../../../.roo/rules/rules.md).
- O código deve ser facilmente testável e reutilizável em diferentes contextos.

## Rastreamento e Referências

- [ADR-0012 - Clean Architecture](../../../docs/adr/ADR-0012-Clean-Architecture-LLM.md)
- [Regras do Projeto](../../../.roo/rules/rules.md)
- [src/client/lib/sidebar-items.tsx](../../../src/client/lib/sidebar-items.tsx)