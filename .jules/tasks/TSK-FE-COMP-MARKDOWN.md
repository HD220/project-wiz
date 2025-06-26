# Tarefa: FE-COMP-MARKDOWN - Implementar MarkdownRenderer

**ID da Tarefa:** `FE-COMP-MARKDOWN`
**Título Breve:** Implementar `MarkdownRenderer` (markdown-render.tsx equivalente).
**Descrição Completa:**
Reimplementar um componente `MarkdownRenderer` que seja capaz de renderizar strings de Markdown como HTML formatado. Este componente utilizará a biblioteca `react-markdown` e pode incluir plugins comuns de `rehype` ou `remark` para funcionalidades adicionais (ex: syntax highlighting para blocos de código, GFM - GitHub Flavored Markdown). É crucial garantir a sanitização do HTML renderizado para prevenir ataques XSS.

---

**Status:** `Concluído`
**Dependências (IDs):** `-` (Dependencies `react-markdown`, `remark-gfm`, `rehype-sanitize`, `rehype-highlight` confirmed in `package.json`)
**Complexidade (1-5):** `2`
**Prioridade (P0-P4):** `P1` (Essencial para exibir conteúdo formatado, como mensagens de chat)
**Responsável:** `Jules`
**Branch Git Proposta:** `feat/fe-comp-markdown`
**Commit da Conclusão (Link):** `(Link para o commit no branch feat/fe-comp-markdown após o push)`

---

## Critérios de Aceitação
- Componente `MarkdownRenderer.tsx` criado em `src_refactored/presentation/ui/components/common/MarkdownRenderer.tsx`. **(Concluído)**
- Utiliza `react-markdown` para renderizar conteúdo Markdown. **(Concluído)**
- Configurado com plugins `rehype-sanitize`, `rehype-highlight` e `remark-gfm`. **(Concluído)**
- Sanitização de HTML robusta implementada para prevenir XSS usando `rehype-sanitize` com schema estendido para permitir classes para highlighting. **(Concluído)**
- Suporte para elementos comuns de Markdown. **(Concluído via plugins)**
- Syntax highlighting para blocos de código configurado com `rehype-highlight`. **(Concluído - CSS de tema para highlight.js é uma consideração externa)**

---

## Notas/Decisões de Design
- Utilizou `react-markdown` v10.1.0.
- Plugins:
    - `remark-gfm` para GitHub Flavored Markdown.
    - `rehype-sanitize` para segurança XSS. O schema padrão foi estendido para permitir `className`/`class` em elementos `code`, `span`, `pre` para suportar classes adicionadas por `rehype-highlight`.
    - `rehype-highlight` para sintaxe highlighting em blocos de código. A estilização visual dos blocos de código dependerá de um tema CSS de `highlight.js` (ex: `github.css` ou `atom-one-dark.css`) ser importado globalmente ou estar disponível via Tailwind.
- Aplicada classe base `prose dark:prose-invert max-w-none` da Tailwind Typography para estilização padrão do conteúdo Markdown.
- O componente aceita a string markdown como `children` e um `className` opcional para o contêiner.

---

## Comentários
- `(Data da migração): Tarefa migrada para novo formato.`
- `(Data Atual): Implementado e submetido o componente MarkdownRenderer.`

---

## Histórico de Modificações da Tarefa (Opcional)
-
