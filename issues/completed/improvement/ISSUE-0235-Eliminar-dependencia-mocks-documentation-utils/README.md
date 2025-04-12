# ISSUE-0235: Eliminar dependência de mocks em utilitários de produção (documentation-utils.ts)

## Tipo
Improvement

## Contexto

O arquivo `src/client/lib/documentation-utils.ts` atualmente importa o tipo `DocFile` de um mock localizado em `../mocks/mock-doc-files`. Esta prática viola a separação de camadas definida nas regras do projeto e pode causar inconsistências, dificultando a manutenção e a testabilidade do código.

## Escopo

- Centralizar a definição do tipo `DocFile` em `src/shared/types`.
- Atualizar o utilitário `src/client/lib/documentation-utils.ts` para importar `DocFile` exclusivamente do local compartilhado.
- Eliminar qualquer dependência de mocks em código de produção.
- Garantir que nenhum outro utilitário de produção dependa de arquivos de mock.

## Justificativa

- Alinha-se ao ADR-0012 (Clean Architecture para módulos LLM), reforçando a separação de camadas e a independência entre produção e testes/mocks.
- Reduz riscos de inconsistências e facilita a manutenção futura.
- Atende às regras gerais do projeto sobre organização, rastreabilidade e boas práticas de arquitetura.

## Referências

- [ADR-0012 - Clean Architecture para módulos LLM](../../../docs/adr/ADR-0012-Clean-Architecture-LLM.md)
- [Regras do Projeto](../../../.roo/rules/rules.md)

## Critérios de Aceite

- O tipo `DocFile` está centralizado em `src/shared/types`.
- O utilitário `documentation-utils.ts` importa apenas do local compartilhado.
- Não há mais dependências de mocks em utilitários de produção.
- Documentação e rastreabilidade mantidas conforme padrões do projeto.