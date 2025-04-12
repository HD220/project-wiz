# Refatorar use-history para Clean Code e Testabilidade

## Arquivo alvo
`src/client/hooks/use-history.ts`

## Problemas identificados

- **Uso de singleton fixo:**
  - O hook utiliza diretamente o singleton `historyService`, dificultando a realização de testes unitários e a manutenção do código.
  - O acoplamento com a instância fixa impede a criação de mocks e dificulta a simulação de cenários em testes.

## O que precisa ser refatorado

- Permitir a injeção do serviço de histórico (`historyService`) como dependência opcional do hook.
- Garantir que, em ambiente de produção, o hook utilize o singleton por padrão, mas permita a substituição em testes.
- Reduzir o acoplamento e aumentar a flexibilidade para testes unitários.

## Critérios de aceitação

- O hook deve funcionar normalmente em produção, utilizando o singleton padrão.
- Deve ser possível injetar uma implementação mockada do serviço em testes.
- O código deve ser modular e de fácil manutenção.