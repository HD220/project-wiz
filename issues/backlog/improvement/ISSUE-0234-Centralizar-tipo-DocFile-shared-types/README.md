# Centralizar definição do tipo DocFile em src/shared/types para reuso e manutenção

## Descrição

Atualmente, o tipo `DocFile` está definido em um arquivo de mock (`../mocks/mock-doc-files`), o que viola a separação de camadas e dificulta o reuso em diferentes contextos do projeto. Para garantir aderência à Clean Architecture (ver [ADR-0012](../../../docs/adr/ADR-0012-Clean-Architecture-LLM.md)), é necessário centralizar a definição do tipo `DocFile` em `src/shared/types/doc-file.ts`.

**Objetivo:**  
- Definir o tipo `DocFile` em `src/shared/types/doc-file.ts`.
- Garantir que o tipo seja utilizado tanto em produção quanto em testes, promovendo reuso e manutenção.
- Eliminar dependências de mocks para definição de tipos de domínio.

## Rastreabilidade

- **Regra:** Seguir Clean Architecture e centralizar tipos compartilhados para evitar acoplamento inadequado entre camadas (ver `.roo/rules/rules.md` e `.roo/rules-code/rules.md`).
- **ADR:** [ADR-0012 - Clean Architecture LLM](../../../docs/adr/ADR-0012-Clean-Architecture-LLM.md)
- **Problema atual:** Definição de tipo em mock impede reuso e manutenção adequada.

## Critérios de Aceite

- O tipo `DocFile` deve estar definido em `src/shared/types/doc-file.ts`.
- Todos os usos do tipo devem importar da nova localização.
- Não deve haver definição de tipos de domínio em arquivos de mock.
- A solução deve respeitar as regras do projeto e Clean Architecture.

## Tipo

improvement