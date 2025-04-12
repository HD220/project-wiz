# Refatorar use-git-commit para Clean Code

## Arquivo alvo
`src/client/hooks/use-git-commit.ts`

## Problemas identificados

- **Tipagem inadequada:** O parâmetro `selectedRepo` está tipado como `any`, o que prejudica a segurança de tipos, a legibilidade e a manutenção do código.
- **Normalização de estados:** O tratamento de erros e loading pode não estar padronizado, dificultando o uso consistente do hook e a identificação de falhas.
- **Testabilidade:** O uso de tipos genéricos e ausência de normalização dificulta a criação de testes confiáveis.

## Refatoração necessária

- Substituir o tipo `any` de `selectedRepo` por um tipo mais específico e adequado ao domínio.
- Garantir a normalização dos estados de erro e loading, seguindo o padrão dos hooks do projeto.
- Melhorar a clareza dos nomes e a documentação interna, facilitando manutenção e testes.

## Critérios de aceitação

- O hook deve utilizar tipagem estrita e descritiva para todos os parâmetros e retornos.
- Estados de erro e loading devem ser tratados e expostos de forma padronizada.
- O código deve ser mais legível, seguro e de fácil manutenção.