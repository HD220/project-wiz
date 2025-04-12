# Refatorar use-repository-settings para seguir princípios de clean code

## Descrição

O hook `src/client/hooks/use-repository-settings.ts` apresenta violações aos princípios de clean code, dificultando sua manutenção, testabilidade e reutilização. Foram identificados os seguintes problemas:

- **Uso de dados mockados diretamente no hook (`repositories`)**: Isso acopla dados de exemplo à lógica do hook, tornando difícil a realização de testes e a reutilização do hook em outros contextos.
- **Mistura de lógica de estado com dados estáticos de exemplo**: O hook mistura a manipulação de estado real com dados mockados, o que prejudica a clareza e a separação de responsabilidades.
- **Baixa flexibilidade para injeção de dados**: O hook não permite a injeção de dados externos, limitando sua adaptabilidade e dificultando cenários de teste.

**Refatoração sugerida:**
- Extrair os dados mockados de `repositories` para fora do hook ou permitir sua injeção via parâmetro.
- Separar a lógica de estado da lógica de dados de exemplo, tornando o hook mais reutilizável, limpo e alinhado aos princípios de clean code.

## Critérios de Aceitação

- [ ] O hook não deve conter dados mockados diretamente em sua implementação.
- [ ] A lógica de estado deve estar separada da lógica de dados de exemplo.
- [ ] O hook deve permitir a injeção de dados externos (por parâmetro ou contexto).
- [ ] O código resultante deve estar alinhado aos princípios de clean code e facilitar testes.

## Tarefas

- [ ] Extrair os dados mockados de `repositories` para fora do hook.
- [ ] Adaptar o hook para receber dados externos via parâmetro ou contexto.
- [ ] Garantir que a lógica de estado e manipulação de dados estejam separadas.
- [ ] Atualizar ou criar testes para cobrir os novos cenários.
- [ ] Revisar o código para garantir aderência aos princípios de clean code.

## Notas Adicionais

Esta melhoria visa aumentar a testabilidade, reutilização e clareza do hook `use-repository-settings`, alinhando-o às boas práticas de desenvolvimento e à arquitetura do projeto.