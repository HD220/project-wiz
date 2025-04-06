# Handoff - Implementação do hook useLLM

## Arquivos Relevantes

- `src/client/hooks/use-llm.ts` (implementação do hook)
- `src/core/services/llm/WorkerService.ts` (serviço backend)
- `src/core/events/bridge.ts` (comunicação IPC)

## Dependências

- WorkerService já implementado
- Sistema de eventos IPC configurado

## Exemplo de Uso Esperado

```typescript
function MyComponent() {
  const { isLoading, error, loadModel, generate, getLoadedModel } = useLLM();

  const handleGenerate = async () => {
    await loadModel("gpt-4");
    const result = await generate("Explique clean code");
    console.log(result);
  };

  return (
    <div>
      {isLoading && <p>Carregando...</p>}
      {error && <p>Erro: {error.message}</p>}
      <button onClick={handleGenerate}>Gerar texto</button>
    </div>
  );
}
```

## Considerações

- Usar `useState` e `useEffect` para gerenciar estado
- Implementar cleanup no unmount
- Tratar erros de forma adequada
- Tipar todas as chamadas IPC
- Documentar cada método com JSDoc

## Testes

Criar testes em `src/client/hooks/__tests__/use-llm.test.ts` cobrindo:

- Estados iniciais
- Fluxo de carregamento de modelo
- Geração de texto
- Tratamento de erros
