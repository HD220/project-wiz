# Handoff – Refatoração FileListItem (Acessibilidade)

## Progresso

- Removida a prop `key` do componente `Button` em `FileListItem`, pois não é necessária fora de listas mapeadas.
- Adicionado o atributo `aria-current="page"` ao `Button` quando o item está selecionado (`isSelected`), reforçando a indicação de seleção para tecnologias assistivas.
- Confirmado que o componente `Button` é semanticamente um `<button>`, garantindo acessibilidade nativa (foco, role, ativação por teclado).
- Mantida a estrutura e semântica do conteúdo textual do botão, garantindo clareza e acessibilidade.

## Decisões e Justificativas

- **Remoção de `key`:** A prop `key` só é necessária em elementos de listas mapeadas pelo React. Sua presença fora desse contexto é redundante e pode confundir revisores.
- **Acessibilidade (ARIA):** O uso de `aria-current="page"` segue recomendações de acessibilidade para indicar o item atualmente ativo/selecionado em listas navegáveis.
- **Clean Code e ADRs:** O código segue os princípios de Clean Code (nomes claros, simplicidade, sem duplicação) e as ADRs do projeto, especialmente quanto à semântica, acessibilidade e padronização de componentes.

## Próximos Passos

- Validar a acessibilidade do componente em uso real.
- Caso surjam novos requisitos de acessibilidade, abrir nova issue específica.