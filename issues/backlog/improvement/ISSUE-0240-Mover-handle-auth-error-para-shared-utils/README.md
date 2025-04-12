# Mover handle-auth-error.ts para src/shared/utils conforme Clean Architecture

## Descrição

O helper `handleAuthError` está atualmente localizado em `src/client/lib/handle-auth-error.ts`, mas, conforme definido em [ADR-0012-Clean-Architecture-LLM](../../../docs/adr/ADR-0012-Clean-Architecture-LLM.md), utilitários compartilhados devem residir em uma camada comum, como `src/shared/utils`. 

Esta melhoria visa mover o arquivo para a estrutura correta, facilitando a reutilização e a manutenção do código, além de garantir aderência à Clean Architecture e às regras do projeto.

## Escopo

- Mover `src/client/lib/handle-auth-error.ts` para `src/shared/utils/handle-auth-error.ts`.
- Atualizar todos os imports/referências para o novo caminho.
- Garantir que não haja duplicidade e que o helper seja utilizado apenas da nova localização.
- Validar que a mudança está em conformidade com [ADR-0012](../../../docs/adr/ADR-0012-Clean-Architecture-LLM.md) e as regras do projeto.

## Rastreabilidade

- **Regra do Projeto:** Utilitários compartilhados devem estar em camadas comuns, conforme Clean Architecture ([rules.md](../../../.roo/rules/rules.md)).
- **ADR-0012:** [docs/adr/ADR-0012-Clean-Architecture-LLM.md](../../../docs/adr/ADR-0012-Clean-Architecture-LLM.md)
- **Motivação:** Facilitar reutilização, manutenção e aderência à arquitetura definida.

## Tipo

improvement