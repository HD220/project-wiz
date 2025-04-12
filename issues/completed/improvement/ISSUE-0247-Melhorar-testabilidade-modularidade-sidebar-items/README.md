# ISSUE-0247: Melhorar testabilidade e modularidade dos dados de navegação (sidebar-items.tsx)

## Tipo

improvement

## Contexto

O array de navegação localizado em `src/client/lib/sidebar-items.tsx` atualmente não é facilmente testável ou reutilizável fora do contexto React, pois contém funções que retornam JSX e dependências diretas de UI. Isso dificulta a aplicação de testes unitários, a reutilização dos dados em outros contextos (por exemplo, geração de menus em ambientes não-React) e viola princípios de clean code e clean architecture.

## Escopo

- Refatorar o arquivo `src/client/lib/sidebar-items.tsx` para garantir que os dados de navegação sejam:
  - Serializáveis (podendo ser representados como JSON).
  - Agnósticos de framework (sem dependências de React ou JSX).
  - Facilmente testáveis e reutilizáveis em diferentes camadas da aplicação.
- Separar dados puros de navegação da lógica de apresentação.
- Garantir aderência aos princípios de clean code e à ADR-0012 (Clean Architecture para módulos LLM).

## Critérios de Aceite

- O novo formato dos dados de navegação não deve conter funções que retornam JSX ou referências diretas a componentes React.
- Os dados devem ser facilmente exportáveis/importáveis e testáveis em isolamento.
- A lógica de apresentação (ex: renderização de ícones) deve ser desacoplada dos dados.
- Cobertura de testes unitários para os dados de navegação.
- Documentação breve sobre o novo formato e uso.

## Rastreabilidade

- **Regras do projeto:** Clean code (nomes descritivos, modularidade, testabilidade, SRP), clean architecture (ADR-0012).
- **Referências:** 
  - [ADR-0012 - Clean Architecture para módulos LLM](../../../docs/adr/ADR-0012-Clean-Architecture-LLM.md)
  - [Regras de Clean Code e Estrutura de Issues](../../../.roo/rules/rules.md)

## Observações

- Não alterar o comportamento visual da sidebar, apenas a estrutura dos dados e sua testabilidade.
- Garantir retrocompatibilidade na integração com componentes existentes.