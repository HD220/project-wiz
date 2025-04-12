# ISSUE-0192: Hooks ou componentes acima de 50 linhas devem ser refatorados

## Descrição do problema
O hook `useAuth.ts` possui mais de 50 linhas, concentrando múltiplas responsabilidades em um único arquivo, o que dificulta a manutenção, testes e entendimento do código.

### Exemplo concreto
- Arquivo: `src/client/hooks/useAuth.ts`
- Linhas: 1-60+ (arquivo excede 50 linhas)

## Recomendação de correção/refatoração
Refatorar o hook em funções menores, extraindo responsabilidades auxiliares para funções utilitárias ou hooks dedicados. Garantir que cada função/hook tenha responsabilidade única e tamanho reduzido.

## Justificativa
- **SDR-0001**: Funções e componentes devem ser pequenos e focados em uma única responsabilidade.
- **Regras Gerais**: Facilita manutenção, testes e evolução do código.

## Contexto para execução autônoma
- Analisar o hook `useAuth.ts` e identificar blocos de responsabilidade.
- Extrair funções auxiliares e hooks dedicados conforme necessário.
- Garantir que o hook principal fique abaixo de 50 linhas.
- Atualizar testes e imports conforme necessário.