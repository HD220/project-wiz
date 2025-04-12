# Handoff – ISSUE-0172: Sanitizar conteúdo do FileViewer

## Resumo da melhoria

O componente `FileViewer` (`src/client/components/file-viewer.tsx`) foi aprimorado para prevenir riscos de XSS ao exibir conteúdo de arquivos. Agora, o conteúdo é sanitizado utilizando a biblioteca [DOMPurify](https://github.com/cure53/DOMPurify) sempre que a fonte não for explicitamente confiável.

## Decisões e implementação

- **Sanitização:** DOMPurify foi adicionado como dependência do projeto e importado no componente.
- **Prop de controle:** Foi criada a prop opcional `isContentTrusted?: boolean` (padrão: `false`).
  - Quando `isContentTrusted` é `false` ou não informada, o conteúdo é sanitizado e exibido via `dangerouslySetInnerHTML`.
  - Quando `isContentTrusted` é `true`, o conteúdo é exibido como texto puro (sem sanitização extra).
- **Padrões:** Todo o código, nomes e comentários seguem o padrão em inglês conforme SDR-0001.
- **Segurança:** O uso de `dangerouslySetInnerHTML` só ocorre após sanitização, mitigando riscos de XSS.

## Exemplo de uso

```tsx
// Conteúdo de fonte não confiável (default: sanitiza)
<FileViewer content={fileContent} />

// Conteúdo de fonte confiável (não sanitiza, exibe como texto)
<FileViewer content={trustedContent} isContentTrusted />
```

## Observações

- Recomenda-se **NÃO** definir `isContentTrusted` como `true` para conteúdos vindos de usuários ou fontes externas.
- A solução está alinhada com Clean Code, Clean Architecture e ADRs do projeto.
- Caso o componente venha a exibir outros tipos de conteúdo no futuro, revisar a necessidade de sanitização adicional.

## Próximos passos

- Testar o componente com diferentes tipos de conteúdo (texto puro, HTML malicioso, etc).
- Avaliar se outros pontos do sistema requerem abordagem semelhante.

---
Implementação concluída e registrada conforme fluxo de handoff.