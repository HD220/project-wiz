# ISSUE-0122: Atualizar plano de refatoração Clean Architecture

## Contexto

O plano de refatoração Clean Architecture, localizado em `docs/refatoracao-clean-architecture/README.md`, encontra-se desatualizado e não reflete o status real da execução, especialmente nas camadas core (**Application**, **Domain** e **Infrastructure**). 

A auditoria em andamento (ver [ISSUE-0121](../../improvement/ISSUE-0121-Auditar-execucao-refatoracao-core/README.md)) identificará o que foi feito, o que está pendente e os problemas encontrados nessas camadas.

Manter o plano atualizado é fundamental para garantir alinhamento da equipe, facilitar o acompanhamento do progresso e orientar as próximas ações de forma eficiente e organizada.

## Objetivo

- Atualizar o plano de refatoração para refletir o progresso real, destacando o que já foi concluído e o que falta
- Incluir as pendências e problemas identificados na auditoria das camadas core
- Ajustar a sequência de execução e prioridades conforme a realidade atual
- Tornar o plano um guia confiável para as próximas etapas da refatoração
- Documentar claramente as etapas concluídas, pendentes e os obstáculos
- Referenciar as issues relacionadas, especialmente as criadas a partir da auditoria

## Critérios de Aceitação

- Documento `docs/refatoracao-clean-architecture/README.md` revisado e atualizado
- Pendências e problemas destacados de forma clara e objetiva
- Sequência de execução ajustada conforme o status real e prioridades
- Plano alinhado com as melhores práticas e princípios definidos (vide [ADR-0008](../../../docs/adr/ADR-0008-Clean-Architecture-LLM.md))
- Referências às issues relacionadas incluídas no documento
- O plano atualizado deve servir como guia confiável para a equipe

## Escopo

- Revisar o plano atual, removendo informações desatualizadas ou incorretas
- Incorporar os resultados da auditoria das camadas core
- Atualizar a lista de etapas, prioridades e dependências
- Destacar claramente o que está **concluído**, **em andamento** e **pendente**
- Incluir links para issues específicas relacionadas às pendências e problemas
- Garantir que o plano reflita a estratégia incremental e alinhada aos princípios de Clean Architecture

## Importância

Sem um plano atualizado e confiável, a equipe pode perder o foco, priorizar incorretamente ou repetir esforços, comprometendo a qualidade e a aderência à arquitetura planejada.

## Referências

- [Plano atual de refatoração](../../../docs/refatoracao-clean-architecture/README.md)
- [Auditoria da refatoração core (ISSUE-0121)](../../improvement/ISSUE-0121-Auditar-execucao-refatoracao-core/README.md)
- [ADR-0008 - Clean Architecture para LLM](../../../docs/adr/ADR-0008-Clean-Architecture-LLM.md)
- Issues relacionadas criadas a partir da auditoria (a serem vinculadas no plano)