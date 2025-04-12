# Refatorar RefreshButton: acessibilidade e internacionalização

## Contexto

O componente `RefreshButton` (`src/client/components/refresh-button.tsx`) está alinhado com Clean Code, Clean Architecture e ADRs do projeto, mas apresenta oportunidades de melhoria em acessibilidade e internacionalização (i18n).

## Problemas Identificados

1. **Acessibilidade:** O SVG utilizado no botão não possui atributos de acessibilidade. Isso pode dificultar o uso por leitores de tela e impactar a experiência de usuários com deficiência.
   - Recomenda-se adicionar `aria-hidden="true"` se o ícone for meramente decorativo, ou `<title>`/`aria-label` se for informativo.

2. **Internacionalização:** O texto "Refresh" está hardcoded no componente.
   - É necessário substituir por uma função de tradução, conforme o padrão i18n do projeto (exemplo: `t('refresh')`).

## Justificativa

- Garantir inclusão e acessibilidade para todos os usuários.
- Aderir ao padrão de internacionalização adotado no projeto, facilitando a tradução da interface.
- Reduzir riscos de não conformidade com padrões de acessibilidade e i18n.

## Checklist de Ações

- [ ] Adicionar atributos de acessibilidade ao SVG do botão.
- [ ] Substituir o texto hardcoded "Refresh" por função de tradução.
- [ ] Validar aderência ao padrão i18n do projeto.
- [ ] Revisar e/ou atualizar testes relacionados ao componente (se existirem).
- [ ] Realizar revisão de código e testes manuais de acessibilidade.

## Critérios de Aceite

- O componente deve estar acessível para leitores de tela.
- O texto do botão deve ser traduzível via sistema i18n do projeto.
- Não deve haver regressão de funcionalidade.

---

## Progresso e Handoff

Acompanhe o progresso e decisões no arquivo `handoff.md` desta pasta.