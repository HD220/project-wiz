# ISSUE-0054: Implementar temas customizáveis - Handoff

## Visão geral

Esta issue tem como objetivo implementar temas customizáveis na aplicação, permitindo que o usuário escolha entre temas claros e escuros. O tema selecionado deve ser persistido para que a aplicação seja aberta com o tema preferido do usuário.

## Detalhes da implementação

- **Componente principal:** `src/client/components/providers/theme.tsx`
- **Persistência:** Utilizar `localStorage` para armazenar o tema selecionado pelo usuário.
- **Seleção de tema:** Criar um componente de seleção de tema (ex: `src/client/components/mode-toggle.tsx`) que atualize o estado do `ThemeProvider`.
- **Estilização:** Utilizar a biblioteca `styled-components` ou similar para facilitar a estilização dos componentes com base no tema selecionado.

## Testes

- Verificar se a troca de temas funciona corretamente.
- Verificar se o tema selecionado é persistido no `localStorage`.
- Verificar se a aplicação abre com o tema selecionado pelo usuário.

## Próximos passos

- Implementar a lógica de troca de temas no componente `src/client/components/providers/theme.tsx`.
- Criar o componente de seleção de tema.
- Implementar a persistência do tema selecionado no `localStorage`.
- Testar a implementação.

## Observações

O componente `src/client/components/mode-toggle.tsx` já existe e pode ser adaptado para a seleção de tema.
