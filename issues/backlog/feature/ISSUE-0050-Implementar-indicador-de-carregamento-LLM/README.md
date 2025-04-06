# Implementar indicador de carregamento LLM

## Descrição

Adicionar um indicador de carregamento na interface do usuário enquanto a resposta do LLM está sendo carregada. Isso melhora a experiência do usuário, fornecendo feedback visual de que o sistema está processando a requisição.

## Critérios de Aceitação

- [ ] Exibir um indicador de carregamento enquanto a resposta do LLM está sendo carregada.
- [ ] O indicador de carregamento deve ser visualmente claro e informativo.
- [ ] A resposta do LLM deve ser exibida em tempo real, utilizando Server-Sent Events (SSE) ou WebSockets.
- [ ] O indicador de carregamento deve desaparecer quando a resposta do LLM for completamente carregada.

## Tarefas

- [ ] Implementar o indicador de carregamento na interface do usuário.
- [ ] Configurar a comunicação com o backend para receber a resposta do LLM em tempo real.
- [ ] Testar o indicador de carregamento em diferentes cenários e navegadores.

## Notas Adicionais

Considerar a utilização de um componente de loading já existente na biblioteca de componentes da interface do usuário.
