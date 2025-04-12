# ISSUE-0230: Refatorar use-prompt-manager para Clean Code

**Tipo:** improvement  
**Arquivo alvo:** `src/client/hooks/prompt/use-prompt-manager.ts`

## Problemas identificados

- **Uso de `any` em vários pontos:** O uso do tipo `any` prejudica a segurança de tipos, dificulta manutenção e pode introduzir bugs silenciosos.
- **Repetição de lógica de loading/erro em funções assíncronas:** Há duplicação de código para controle de estados de carregamento e erro, violando o princípio DRY.
- **Função `reload` com múltiplas responsabilidades:** A função realiza diversas operações, dificultando entendimento, manutenção e testes.
- **Acoplamento forte ao repositório concreto:** O hook depende diretamente de implementações concretas, dificultando testes e futuras mudanças.
- **Testabilidade prejudicada:** O uso de funções anônimas internas e de `any` dificulta a criação de testes unitários e mocks.
- **Retorno extenso:** O hook retorna muitos dados e funções, indicando excesso de responsabilidade e violação do princípio de responsabilidade única.

## O que precisa ser refatorado

- Tipar corretamente todos os parâmetros e resultados, eliminando o uso de `any`.
- Abstrair o tratamento de loading e erro em funções utilitárias ou hooks auxiliares.
- Dividir a função `reload` em funções menores, cada uma com uma responsabilidade clara.
- Permitir injeção de dependências (ex: repositório), facilitando testes e desacoplamento.
- Extrair funções internas para fora do hook, tornando-as puras e testáveis.
- Avaliar a segmentação do hook em hooks menores, cada um responsável por uma parte do estado ou lógica.

## Critérios de aceitação

- Todo o código deve seguir os princípios de Clean Code e Clean Architecture definidos no projeto.
- Não deve haver uso de `any`.
- O tratamento de loading/erro deve ser centralizado e reutilizável.
- O hook deve ser facilmente testável, com dependências injetáveis.
- O retorno do hook deve ser simplificado e segmentado conforme necessário.
- Cobertura de testes unitários para as funções extraídas e principais fluxos do hook.