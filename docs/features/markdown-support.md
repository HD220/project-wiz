# Suporte a Markdown no Chat

## Visão Geral
O sistema agora suporta renderização de mensagens em markdown, com:
- Sintaxe básica (títulos, listas, ênfase)
- Blocos de código com highlight de sintaxe
- Links e imagens
- Tabelas e outros elementos GFM

## Como Usar

### Enviando mensagens markdown
Para enviar uma mensagem como markdown, defina `isMarkdown: true` na mensagem:

```ts
const message: ChatMessage = {
  id: '123',
  content: '# Título\n```js\nconst x = 1\n```',
  sender: { type: 'user', id: 'user-1' },
  timestamp: new Date(),
  isMarkdown: true
}
```

### Segurança
Todo conteúdo markdown é sanitizado automaticamente para prevenir XSS. Os seguintes elementos são removidos:
- Scripts
- Event handlers
- Iframes e objetos embutidos

### Temas
O componente suporta automaticamente os temas dark/light do sistema. Para blocos de código:
- Tema light: github.css
- Tema dark: github-dark.css

## Performance
O parser de markdown foi otimizado para:
- Renderização em menos de 50ms para mensagens médias
- Processamento assíncrono para não bloquear a UI
- Cache interno de mensagens já processadas

## Exemplos

### Mensagem simples
```markdown
**Negrito** e _itálico_

- Lista
- Com
- Itens
```

### Código
```markdown
```ts
interface User {
  id: string
  name: string
}
```
```

### Tabelas
```markdown
| Feature | Suporte |
|---------|---------|
| Markdown | ✅ |
| Segurança | ✅ |
| Temas | ✅ |