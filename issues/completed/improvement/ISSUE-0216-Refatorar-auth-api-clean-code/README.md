# Refatorar auth-api para aderência a Clean Code

## Arquivo alvo
`src/client/hooks/auth-api.ts`

## Problemas identificados

- **Pequena duplicação no tratamento de erros HTTP:** O código repete lógica para verificar e tratar respostas HTTP inválidas.
- **Mensagens de erro não padronizadas:** As mensagens de erro lançadas ou retornadas não seguem um padrão consistente, dificultando manutenção e internacionalização.
- **Dependência direta de `fetch`:** O uso direto de `fetch` acopla o hook à implementação nativa, dificultando a criação de testes automatizados e mocks.

## Refatoração necessária

- Extrair a verificação de resposta HTTP para um utilitário reutilizável, eliminando duplicação.
- Padronizar todas as mensagens de erro para inglês, seguindo o padrão do projeto.
- Permitir a injeção de um cliente HTTP alternativo (por exemplo, via parâmetro ou contexto), facilitando a testabilidade do hook.

## Justificativa

A refatoração é necessária para garantir aderência aos princípios de Clean Code e Clean Architecture, melhorar a manutenibilidade, facilitar testes automatizados e alinhar o código aos padrões de internacionalização e modularidade do projeto.

## Critérios de aceitação

- Não deve haver duplicação de lógica de tratamento de erro HTTP.
- Todas as mensagens de erro devem estar padronizadas em inglês.
- O hook deve permitir a injeção de um cliente HTTP alternativo para facilitar testes.
- Cobertura de testes deve ser ampliada para os novos utilitários e cenários de erro.