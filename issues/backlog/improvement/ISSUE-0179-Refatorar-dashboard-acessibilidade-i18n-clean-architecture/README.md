# Refatorar dashboard: acessibilidade, i18n e Clean Architecture

## Contexto

O componente `dashboard.tsx` precisa ser refatorado para aderir aos princípios de Clean Code, Clean Architecture, ADRs do projeto e padrões de acessibilidade e internacionalização. Atualmente, o componente apresenta oportunidades de melhoria em modularidade, clareza, reutilização de lógica e alinhamento com as decisões arquiteturais já registradas.

## Escopo

- Refatoração granular do componente `dashboard.tsx`, abrangendo:
  - Melhoria de acessibilidade (ARIA, navegação, contraste, etc.)
  - Internacionalização completa (i18n)
  - Extração de lógicas para hooks reutilizáveis
  - Padronização de props e nomenclatura conforme ADRs/SDRs
  - Isolamento de subcomponentes
  - Cobertura de testes (unitários e de integração)
  - Documentação do progresso e decisões no handoff.md

## Critérios de Aceitação

- Todas as subtarefas concluídas e rastreadas no handoff.md
- Alinhamento com ADRs e SDRs do projeto
- Código resultante aderente a Clean Code e Clean Architecture
- Progresso documentado e decisões justificadas no handoff.md