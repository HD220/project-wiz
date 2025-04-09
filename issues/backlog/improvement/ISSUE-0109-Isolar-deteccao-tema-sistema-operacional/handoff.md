# Handoff - ISSUE-0109 - Isolar detecção do tema do sistema operacional

## Resumo
Isolar a lógica de detecção do tema do sistema operacional em um adaptador externo, removendo a dependência direta do `window.matchMedia` do componente `ThemeProvider`.

## Passos sugeridos
1. Criar um adaptador (ex: `src/client/adapters/themeDetector.ts`) que encapsule o uso do `window.matchMedia`.
2. O adaptador deve expor uma interface clara, por exemplo, `isDarkMode(): boolean` ou um listener para mudanças.
3. Refatorar o `ThemeProvider` para usar esse adaptador.
4. Garantir que o adaptador possa ser mockado facilmente em testes.
5. Manter o comportamento atual para o usuário final.

## Benefícios
- Facilita testes unitários do `ThemeProvider`
- Segue princípios da Clean Architecture, separando dependências externas
- Melhora a manutenibilidade do código

## Riscos
- Mudança deve ser transparente, sem alterar a experiência do usuário
- Testar em diferentes sistemas operacionais para garantir compatibilidade