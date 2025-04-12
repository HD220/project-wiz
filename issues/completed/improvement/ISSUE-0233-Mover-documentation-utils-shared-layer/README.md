# ISSUE-0233: Mover src/client/lib/documentation-utils.ts para src/shared/lib conforme Clean Architecture

## Tipo

improvement

## Descrição

O utilitário `documentation-utils.ts` está atualmente localizado em `src/client/lib`, o que viola os princípios de Clean Architecture definidos no projeto (ver [ADR-0012 - Clean Architecture para módulos LLM](../../../docs/adr/ADR-0012-Clean-Architecture-LLM.md)). 

Segundo as regras do projeto e o ADR-0012, utilitários que não dependem de detalhes específicos da camada client devem ser movidos para uma camada compartilhada, como `src/shared/lib`. Isso garante melhor separação de responsabilidades, facilita a reutilização e reduz o acoplamento entre camadas.

### Escopo

- Mover o arquivo `src/client/lib/documentation-utils.ts` para `src/shared/lib/documentation-utils.ts`.
- Garantir que o utilitário não dependa de detalhes da camada client. Caso haja dependências, refatorar para removê-las ou criar um novo issue para tratar dependências complexas.
- Atualizar todos os imports no projeto para refletir a nova localização.
- Garantir que a mudança siga as regras de Clean Code e Clean Architecture do projeto.

### Rastreabilidade

- Regras do projeto: ver `.roo/rules/rules.md` e `.roo/rules-code/rules.md`.
- ADR relevante: [ADR-0012 - Clean Architecture para módulos LLM](../../../docs/adr/ADR-0012-Clean-Architecture-LLM.md).

### Critérios de Aceite

- O utilitário deve estar em `src/shared/lib`.
- Não deve haver dependências da camada client.
- Todos os imports devem estar atualizados.
- A alteração deve estar documentada no handoff.md da issue.

---