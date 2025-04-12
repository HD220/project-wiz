# Handoff: Refatorar ExportButton (acessibilidade e i18n)

## Status Inicial

- Issue criada para refatoração do componente `export-button.tsx`, visando melhorias de acessibilidade e internacionalização.
- Contexto, problemas identificados, checklist e critérios de aceite detalhados no [README.md](./README.md).

## Progresso

- [x] Análise do componente atual e identificação de todos os textos hardcoded.
- [x] Planejamento da extração para i18n e definição das chaves de tradução.
- [x] Implementação dos atributos de acessibilidade no SVG.
- [ ] Testes de acessibilidade e revisão de código.
- [ ] Atualização dos testes automatizados (se aplicável).
- [ ] Revisão final e validação dos critérios de aceite.

## Decisões Tomadas

- Utilizado o sistema de internacionalização LinguiJS, seguindo o padrão já adotado no projeto.
- O texto "Export All" foi extraído para i18n com a chave: `exportButton.exportAll`.
- O SVG do botão recebeu os atributos `role="img"` e `aria-label="Export icon"` para garantir acessibilidade conforme boas práticas.
- Mantido o código em inglês, sem JSDoc, conforme SDRs do projeto.

## Dificuldades Encontradas

- Nenhuma dificuldade relevante até o momento.

## Próximos Passos

- Garantir que a chave `exportButton.exportAll` esteja presente nos arquivos de tradução (.po) em `src/locales/`.
- Realizar testes manuais e/ou automatizados de acessibilidade e internacionalização no componente.
- Validar critérios de aceite e submeter para revisão.

---