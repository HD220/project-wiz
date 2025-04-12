# Refatorar use-llm-metrics para Clean Code e Testabilidade

## Arquivo alvo
`src/client/hooks/use-llm-metrics.ts`

## Problemas identificados

- **Forte dependência de objeto global:**
  - O hook depende diretamente de `window.llmMetricsAPI`, dificultando a realização de testes unitários e a manutenção do código.
  - O acoplamento com o objeto global impede a criação de mocks e dificulta a simulação de cenários em testes.

## O que precisa ser refatorado

- Permitir a injeção da dependência da API (`llmMetricsAPI`) como parâmetro opcional do hook.
- Garantir que, em ambiente de produção, o hook utilize o objeto global por padrão, mas permita a substituição em testes.
- Reduzir o acoplamento e aumentar a flexibilidade para testes unitários.

## Critérios de aceitação

- O hook deve funcionar normalmente em produção, utilizando o objeto global.
- Deve ser possível injetar uma implementação mockada da API em testes.
- O código deve ser modular e de fácil manutenção.