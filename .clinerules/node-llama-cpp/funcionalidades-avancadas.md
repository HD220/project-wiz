# Funcionalidades Avançadas

### 5.1 Function Calling

```typescript
const functions = {
  getFruitPrice: defineChatSessionFunction({
    description: "Get the price of a fruit",
    params: {
      type: "object",
      properties: {
        name: { type: "string" },
      },
    },
    async handler(params) {
      // Lógica para retornar preço da fruta
    },
  }),
};
```

### 5.2 Embedding

```typescript
const context = await model.createEmbeddingContext();
```

```typescript
const embedding = await context.getEmbeddingFor("Hello world");
```
