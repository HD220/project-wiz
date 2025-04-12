# ISSUE-0231: Refatorar use-prompt-share para Clean Code

**Tipo:** improvement  
**Arquivo alvo:** `src/client/hooks/prompt/use-prompt-share.ts`

## Problemas identificados

- **Acoplamento forte a serviços concretos e repositório:** O hook depende diretamente de implementações específicas, dificultando testes, manutenção e evolução.
- **Tratamento de erros via exceção:** O uso de exceções para controle de fluxo dificulta o consumo padronizado do hook e pode gerar comportamentos inesperados.
- **Não há injeção de dependências:** O hook não permite a substituição de serviços ou repositórios, reduzindo flexibilidade e testabilidade.
- **Tipagem insuficiente:** Parâmetros e retornos não possuem tipagem explícita em todos os pontos, o que pode causar bugs e dificulta o entendimento.

## O que precisa ser refatorado

- Permitir injeção de dependências (serviços e repositórios), facilitando testes e desacoplamento.
- Padronizar o tratamento de erros, retornando objetos de erro ao invés de lançar exceções.
- Garantir tipagem explícita e estrita em todos os parâmetros e retornos do hook e funções internas.

## Critérios de aceitação

- O hook deve permitir injeção de dependências para facilitar testes e manutenção.
- O tratamento de erros deve ser padronizado, sem uso de exceções para controle de fluxo.
- Todos os parâmetros e retornos devem ser tipados explicitamente, sem uso de `any`.
- O código deve seguir os princípios de Clean Code e Clean Architecture definidos no projeto.
- Cobertura de testes unitários para os principais fluxos e cenários de erro.