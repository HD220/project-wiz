# Refatorar SVGs inline de sidebar-items.tsx para componentes de ícone reutilizáveis

## Descrição

O arquivo `src/client/lib/sidebar-items.tsx` contém múltiplos SVGs inline repetidos nos itens do menu lateral. Esta issue tem como objetivo extrair cada SVG para um componente React separado (por exemplo: `DashboardIcon`, `DocumentationIcon`, etc.) localizado em `src/client/components/icons/`. Essa abordagem reduz duplicação, melhora a legibilidade e facilita a manutenção e alteração dos ícones no futuro.

### Escopo

- Identificar todos os SVGs inline presentes em `src/client/lib/sidebar-items.tsx`.
- Extrair cada SVG para um componente React funcional, nomeando-os de acordo com sua função (ex: `DashboardIcon`, `DocumentationIcon`).
- Armazenar os novos componentes em `src/client/components/icons/`.
- Substituir as ocorrências dos SVGs inline pelos novos componentes nos itens do menu.
- Garantir que não haja duplicação de código SVG e que a legibilidade do arquivo de itens do menu seja aprimorada.

### Rastreabilidade

- **Arquivo de origem dos SVGs:** `src/client/lib/sidebar-items.tsx`
- **Destino dos componentes de ícone:** `src/client/components/icons/`
- **Referências:** 
  - [Regras do Projeto - Clean Code e Clean Architecture](../../../../.roo/rules/rules.md)
  - [ADR-0012 - Clean Architecture para módulos LLM](../../../../docs/adr/ADR-0012-Clean-Architecture-LLM.md)

### Justificativa

Esta melhoria está alinhada com os princípios de Clean Code e Clean Architecture (ADR-0012), promovendo modularidade, reutilização e facilidade de manutenção. A extração dos SVGs para componentes dedicados elimina duplicação, facilita alterações futuras e melhora a clareza do código.

## Critérios de Aceite

- Todos os SVGs inline do menu lateral foram extraídos para componentes React em `src/client/components/icons/`.
- O arquivo `src/client/lib/sidebar-items.tsx` não contém mais SVGs inline.
- Não há duplicação de código SVG.
- O código resultante está mais legível e fácil de manter.