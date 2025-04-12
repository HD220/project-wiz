# Refatorar use-activity-log para aderência a Clean Code

## Arquivo alvo
`src/client/hooks/use-activity-log.ts`

## Problemas identificados

- **Hook muito grande (84 linhas):** O hook concentra muita lógica, dificultando leitura, manutenção e testes.
- **Viola SRP (Single Responsibility Principle):** O hook executa múltiplas responsabilidades, como manipulação de estado, exportação e interação com o DOM.
- **Baixa testabilidade da função de exportação:** A lógica de exportação está acoplada ao hook, dificultando testes isolados.
- **Manipulação direta do DOM:** O hook acessa e manipula elementos do DOM diretamente, o que não é recomendado em React hooks.
- **Muitos retornos:** O hook retorna múltiplos valores e funções, tornando a interface complexa.

## Refatoração necessária

- Dividir o hook em hooks e utilitários menores, cada um com responsabilidade única.
- Extrair a função de exportação para um utilitário separado, facilitando testes.
- Reduzir ou eliminar manipulação direta do DOM dentro do hook.
- Simplificar e reduzir o número de retornos do hook, tornando a interface mais clara e coesa.
- Garantir que cada parte do código seja facilmente testável de forma isolada.

## Justificativa

A refatoração é necessária para garantir aderência aos princípios de Clean Code e Clean Architecture, melhorar a manutenibilidade, facilitar testes automatizados e alinhar o código às melhores práticas de hooks React.

## Critérios de aceitação

- O hook deve ser dividido em partes menores e mais coesas.
- A função de exportação deve ser testável de forma isolada.
- Não deve haver manipulação direta do DOM dentro do hook principal.
- O número de retornos do hook deve ser reduzido e padronizado.
- Cobertura de testes deve ser ampliada para os novos utilitários e hooks extraídos.