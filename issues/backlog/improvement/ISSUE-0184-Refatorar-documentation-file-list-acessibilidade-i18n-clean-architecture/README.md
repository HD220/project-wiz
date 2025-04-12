# ISSUE-0184: Refatorar documentation-file-list para acessibilidade, i18n e Clean Architecture

## Contexto

O componente `documentation-file-list.tsx` é responsável por exibir a lista de arquivos de documentação no frontend. Atualmente, o componente apresenta oportunidades de melhoria em relação à acessibilidade, internacionalização, padronização de props, extração de hooks, isolamento de subcomponentes, testabilidade e alinhamento com Clean Code e Clean Architecture.

## Objetivo

Refatorar completamente o componente `documentation-file-list.tsx` para garantir:

- Aderência total aos princípios de Clean Code e Clean Architecture.
- Conformidade com padrões de acessibilidade (WCAG/ARIA).
- Internacionalização completa (i18n), com suporte multilíngue.
- Extração de hooks customizados para lógica de negócio e estado.
- Padronização e tipagem clara das props.
- Isolamento de subcomponentes reutilizáveis.
- Facilidade de testabilidade (unitária e de integração).
- Documentação das decisões de arquitetura e design tomadas durante a refatoração.

## Critérios de Aceitação

- [ ] O componente deve ser totalmente acessível, com navegação por teclado e uso correto de ARIA.
- [ ] Todo texto visível deve ser internacionalizável via sistema i18n do projeto.
- [ ] Lógica de estado e efeitos deve ser extraída para hooks dedicados.
- [ ] Props devem ser padronizadas, tipadas e documentadas.
- [ ] Subcomponentes devem ser isolados quando necessário, seguindo o padrão do projeto.
- [ ] O componente deve ser facilmente testável, com exemplos de uso e cobertura de casos principais.
- [ ] Todas as decisões relevantes devem ser documentadas em ADRs ou no handoff.md.
- [ ] O código deve seguir as convenções de nomenclatura (kebab-case, inglês).
- [ ] Não deve haver regressão funcional.

## Requisitos Técnicos

- Seguir Clean Architecture (ver ADR-0012).
- Utilizar shadcn-ui para componentes visuais (ver ADR-0002).
- Seguir padrão de internacionalização do projeto (ver docs/i18n-guide.md).
- Garantir acessibilidade conforme docs/ui-components.md e WCAG.
- Documentar decisões em docs/adr/ se necessário.
- Seguir padrão de organização de hooks e subcomponentes do projeto.

## Dependências

- Nenhuma dependência externa identificada, mas pode haver dependências internas de outros componentes/documentação.

## Riscos

- Possível impacto em funcionalidades dependentes do componente.
- Risco de regressão se não houver testes adequados.
- Complexidade na extração de hooks e isolamento de subcomponentes.

## Referências

- [ADR-0002: shadcn-ui](../../../../docs/adr/ADR-0002-Componentes-shadcn-ui.md)
- [ADR-0012: Clean Architecture LLM](../../../../docs/adr/ADR-0012-Clean-Architecture-LLM.md)
- [ADR-0015: Padrão de nomenclatura kebab-case](../../../../docs/adr/ADR-0015-Padrao-Nomenclatura-Kebab-Case.md)
- [docs/i18n-guide.md](../../../../docs/i18n-guide.md)
- [docs/ui-components.md](../../../../docs/ui-components.md)

## Observações

- Todas as decisões e progresso devem ser registrados em `handoff.md`.
- Caso surjam decisões arquiteturais relevantes, criar ADRs conforme necessário.