# ISSUE-0239: Mover github-token-messages.ts para sistema de i18n e garantir uso exclusivo pela camada de apresentação

## Tipo
improvement

## Descrição

O arquivo `src/client/lib/github-token-messages.ts` atualmente contém mensagens de interface hardcoded em inglês e está localizado em um diretório inadequado, o que viola a separação de camadas definida pela Clean Architecture (ver [ADR-0012](../../../docs/adr/ADR-0012-Clean-Architecture-LLM.md)). 

**Problemas identificados:**
- Mensagens de interface estão hardcoded, dificultando a internacionalização e manutenção.
- O arquivo está fora do diretório de i18n, contrariando a organização recomendada.
- O uso dessas mensagens pode estar ocorrendo fora da camada de apresentação, violando a separação de responsabilidades.

**Ações propostas:**
- Migrar todas as mensagens do arquivo `src/client/lib/github-token-messages.ts` para o sistema de internacionalização (i18n) do projeto, preferencialmente em `src/client/i18n/` ou estrutura equivalente.
- Garantir que apenas a camada de apresentação (UI) consuma essas mensagens, evitando dependências em camadas de domínio, aplicação ou infraestrutura.
- Refatorar imports e usos conforme necessário para garantir a conformidade com a Clean Architecture.

## Rastreabilidade

- **Regras do projeto:** Ver seção "Clean Code Principles" e "Accepted Architecture Decisions (ADRs)" em `.roo/rules/rules.md`.
- **ADR relevante:** [ADR-0012 - Clean Architecture para módulos LLM](../../../docs/adr/ADR-0012-Clean-Architecture-LLM.md).

## Critérios de aceitação

- Todas as mensagens do arquivo original migradas para o sistema de i18n.
- O arquivo `github-token-messages.ts` removido ou esvaziado.
- Nenhuma mensagem hardcoded remanescente.
- Uso das mensagens restrito à camada de apresentação.
- Conformidade com as regras de Clean Code e Clean Architecture do projeto.