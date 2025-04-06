# ISSUE-0054: Implementar temas customizáveis

## Descrição

Implementar temas customizáveis na aplicação, permitindo que o usuário escolha entre temas claros e escuros. O tema selecionado deve ser persistido para que a aplicação seja aberta com o tema preferido do usuário.

## Requisitos

- Permitir a troca de temas (claro/escuro).
- Persistir o tema selecionado no armazenamento local do navegador.
- Aplicar o tema selecionado ao inicializar a aplicação.

## Contexto

A aplicação utiliza o `ThemeProvider` para gerenciar o tema atual. É necessário modificar o `ThemeProvider` para permitir a troca de temas e persistir a escolha do usuário.

## Possíveis soluções

- Utilizar `localStorage` para persistir o tema selecionado.
- Criar um componente de seleção de tema que atualize o estado do `ThemeProvider`.
- Utilizar a biblioteca `styled-components` ou similar para facilitar a estilização dos componentes com base no tema selecionado.

## Observações

O componente `src/client/components/providers/theme.tsx` é o ponto de partida para a implementação desta funcionalidade.
