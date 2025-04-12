# ISSUE-0168: Refatorar EmptyViewer para acessibilidade do SVG

## Contexto

O componente `src/client/components/empty-viewer.tsx` está em conformidade com Clean Code, Clean Architecture e ADRs do projeto. No entanto, foi identificado um ponto de melhoria relacionado à acessibilidade do SVG utilizado no componente.

### Problema Identificado

- O SVG presente nas linhas 4-17 do componente não possui atributos de acessibilidade, como `role` e `aria-label`.
- Isso pode dificultar a navegação e compreensão do conteúdo por usuários que utilizam leitores de tela.

### Recomendação

Adicionar os atributos `role="img"` e `aria-label="Empty file icon"` ao elemento `<svg>`, garantindo que o ícone seja corretamente interpretado por tecnologias assistivas.

## Justificativa

A acessibilidade é um requisito fundamental para garantir que todos os usuários possam utilizar o sistema de forma eficiente e inclusiva. A ausência de atributos apropriados em elementos gráficos pode prejudicar a experiência de pessoas com deficiência visual.

Esta melhoria está alinhada com as boas práticas de desenvolvimento frontend e com o compromisso do projeto com acessibilidade.

## Checklist de Ações

- [ ] Adicionar os atributos `role="img"` e `aria-label="Empty file icon"` ao elemento `<svg>` do componente.
- [ ] Garantir que não haja impacto visual ou funcional no componente.
- [ ] Revisar se há outros pontos de acessibilidade relevantes no componente.
- [ ] Testar o componente com leitor de tela para validar a melhoria.

## Critérios de Aceite

- O SVG do componente possui os atributos de acessibilidade recomendados.
- O componente permanece funcional e visualmente inalterado.
- A melhoria é validada por meio de teste com leitor de tela.

---

## Relatórios e Referências

- Relatório de análise: acessibilidade do SVG em `empty-viewer.tsx`.
- [Documentação de acessibilidade SVG - MDN](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/svg#accessibility)

---

## Progresso e Handoff

Consulte o arquivo `handoff.md` nesta pasta para acompanhamento do progresso, decisões e próximos passos.