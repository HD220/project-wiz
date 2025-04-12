# Mover export-history.ts para src/shared/utils conforme Clean Architecture

## Descrição

O utilitário `exportDataAsFile` está atualmente localizado em `src/client/lib/export-history.ts`, mas deveria estar em uma camada compartilhada, como `src/shared/utils`, conforme definido em [ADR-0012-Clean-Architecture-LLM](../../../docs/adr/ADR-0012-Clean-Architecture-LLM.md). 

Esta melhoria visa mover o arquivo para a estrutura correta, garantindo que o utilitário não dependa de detalhes da camada client, promovendo reutilização e aderência à Clean Architecture.

## Objetivo

- Mover `src/client/lib/export-history.ts` para `src/shared/utils/export-history.ts`.
- Garantir que o utilitário não dependa de implementações ou detalhes específicos da camada client.
- Atualizar imports em todo o projeto para refletir a nova localização.
- Garantir rastreabilidade e aderência às regras do projeto e ADR-0012.

## Rastreabilidade

- [ADR-0012-Clean-Architecture-LLM](../../../docs/adr/ADR-0012-Clean-Architecture-LLM.md)
- Regras do projeto: Clean Code, Clean Architecture, separação de responsabilidades.

## Classificação

- Tipo: improvement
- Status: backlog