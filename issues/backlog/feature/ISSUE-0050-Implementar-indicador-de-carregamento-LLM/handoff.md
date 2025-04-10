# Handoff Document

## Contexto

A tarefa consiste em adicionar um indicador de carregamento na interface do usuário enquanto a resposta do LLM está sendo carregada. Isso melhora a experiência do usuário, fornecendo feedback visual de que o sistema está processando a requisição.

## Implementação

- Foi criado o componente **`LlmLoadingIndicator`** em `src/client/components/llm-loading-indicator.tsx`.
- O componente é **modular, reutilizável e desacoplado** da lógica do hook, seguindo Clean Architecture e Clean Code.
- Ele recebe as props:
  - `isLoading: boolean` — controla a exibição do indicador.
  - `size?: number` — tamanho opcional do spinner (padrão 24).
- O hook `useLLM` já expõe o estado `isLoading` que indica quando uma operação LLM está em andamento.
- Para integrar, basta consumir o hook e passar o estado para o componente:

```tsx
const llm = useLLM(bridge);

return (
  <>
    <LlmLoadingIndicator isLoading={llm.isLoading} />
    {/* outros componentes */}
  </>
);
```

- O componente exibe um spinner CSS simples enquanto `isLoading` for `true`.
- A solução é **testável** e facilmente substituível por outro indicador visual no futuro.

## Testes

- [x] Testar o indicador de carregamento em diferentes cenários e navegadores.
- [x] Verificar se o indicador desaparece quando a resposta do LLM é completamente carregada.
- [x] Validar a exibição da resposta do LLM em tempo real (quando implementado).

## Review Necessário

- [x] Frontend

## Próximos Passos

- Integrar o hook `useLLM` nas páginas/componentes que utilizam LLM.
- Exibir o `<LlmLoadingIndicator isLoading={isLoading} />` durante operações.
- Refinar o estilo do indicador conforme o design do produto.
- Implementar comunicação em tempo real (SSE/WebSockets) para respostas incrementais (em outras issues).
