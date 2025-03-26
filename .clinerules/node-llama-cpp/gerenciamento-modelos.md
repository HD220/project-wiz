# Gerenciamento de Modelos

## 2.1 Carregamento de Modelos

```typescript
const model = await llama.loadModel({
  modelPath: path.join(__dirname, "my-model.gguf"),
});
```

## 2.2 Criação de Contexto

```typescript
const context = await model.createContext();
```
