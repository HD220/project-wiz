# Refatorar use-conversations para aderência a Clean Code

## Arquivo alvo
`src/client/hooks/use-conversations.ts`

## Problemas identificados

- **Hook muito grande (118 linhas):** O hook concentra muita lógica, dificultando leitura, manutenção e testes.
- **Viola SRP (Single Responsibility Principle):** O hook executa múltiplas responsabilidades, como manipulação de estado, requisições, tratamento de erros e loading.
- **Mensagens de erro em português e inglês:** As mensagens de erro não seguem um padrão único, dificultando manutenção e internacionalização.
- **Repetição de padrões de loading/erro:** O código repete lógica para controle de loading e tratamento de erros.
- **Muitos retornos:** O hook retorna múltiplos valores e funções, tornando a interface complexa.

## Refatoração necessária

- Dividir o hook em hooks menores e utilitários, cada um com responsabilidade única.
- Padronizar todas as mensagens de erro para inglês, conforme padrão do projeto.
- Abstrair padrões repetidos de loading e erro em utilitários ou hooks reutilizáveis.
- Reduzir e padronizar o número de retornos do hook principal, tornando a interface mais clara e coesa.
- Garantir que cada parte do código seja facilmente testável de forma isolada.

## Justificativa

A refatoração é necessária para garantir aderência aos princípios de Clean Code e Clean Architecture, melhorar a manutenibilidade, facilitar testes automatizados e alinhar o código às melhores práticas de hooks React e internacionalização.

## Critérios de aceitação

- O hook deve ser dividido em partes menores e mais coesas.
- Todas as mensagens de erro devem estar padronizadas em inglês.
- Padrões de loading e erro devem ser abstraídos e reutilizáveis.
- O número de retornos do hook deve ser reduzido e padronizado.
- Cobertura de testes deve ser ampliada para os novos utilitários e hooks extraídos.