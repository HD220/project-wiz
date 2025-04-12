# Refatorar `permissions-list.tsx` para eliminar repetição de markup e melhorar legibilidade

## Contexto

O componente `src/client/components/permissions-list.tsx` apresenta problemas de repetição de código (violação do princípio DRY) e função excessivamente longa devido à duplicação de SVG e markup dos itens de permissão. Embora esteja alinhado com Clean Architecture e ADRs do projeto, a estrutura atual dificulta a manutenção e a evolução futura do componente.

## Problemas Identificados

- **Violação de DRY:** O SVG do ícone de check e o markup dos itens de permissão estão duplicados.
- **Função extensa:** A repetição de markup torna a função maior do que o necessário, prejudicando a legibilidade e a manutenibilidade.

## Objetivo

Refatorar o componente para:
- Extrair o SVG para um componente reutilizável (`CheckIcon`).
- Mapear os itens de permissão a partir de um array, eliminando duplicação de markup.
- Reduzir o tamanho da função principal, melhorando clareza e manutenção.
- Garantir aderência aos princípios de Clean Code e às ADRs do projeto.

## Critérios de Aceite

- O componente não deve conter duplicação de SVG ou markup de itens.
- O SVG deve ser extraído para um componente próprio e reutilizável.
- Os itens de permissão devem ser renderizados a partir de um array de dados.
- O código resultante deve ser mais legível, modular e fácil de manter.
- Não alterar o comportamento visual ou funcional do componente.

## Checklist de Ações

- [ ] Analisar o componente atual e identificar todos os pontos de repetição.
- [ ] Extrair o SVG do ícone de check para um componente `CheckIcon`.
- [ ] Criar um array de dados para os itens de permissão.
- [ ] Refatorar o componente para mapear os itens a partir do array, utilizando o `CheckIcon`.
- [ ] Garantir que a refatoração não altere o comportamento do componente.
- [ ] Revisar e testar o componente refatorado.
- [ ] Atualizar a documentação interna, se necessário.
- [ ] Registrar progresso e decisões no `handoff.md`.

## Referências

- Relatório de análise: problemas de DRY e função extensa em `permissions-list.tsx`.
- ADRs e padrões de Clean Code definidos no projeto.

---