# ISSUE-0121: Auditar execução da refatoração nas camadas core

## Contexto
O plano de refatoração baseado em Clean Architecture previa a reorganização completa das camadas **Application**, **Domain** e **Infrastructure** localizadas em `/src/core`, seguindo princípios **SOLID**, **Clean Code** e **Clean Architecture** (vide ADR-0008). 

Entretanto, não há confirmação clara da execução integral dessas etapas, nem issues específicas para cada uma delas. Apenas a refatoração do client está documentada com detalhes. 

## Objetivo
- Auditar o que foi efetivamente refatorado nas camadas core
- Identificar pontos pendentes, violações de boas práticas, dependências incorretas, responsabilidades misturadas
- Listar problemas encontrados e criar issues específicas para cada ponto identificado
- Atualizar a documentação da auditoria em `docs/refatoracao-clean-architecture/`
- Garantir que a arquitetura esteja alinhada com o plano original

## Critérios de Aceitação
- Relatório detalhado da auditoria das camadas core
- Lista de problemas e pendências com links para issues criadas
- Atualização da documentação refletindo o status real da refatoração
- Recomendações para próximos passos para garantir aderência à arquitetura planejada

## Importância
Sem essa auditoria, não é possível garantir que a base do projeto está aderente aos princípios definidos, o que pode comprometer a manutenibilidade, escalabilidade e evolução futura do sistema.

## Referências
- `docs/adr/ADR-0008-Clean-Architecture-LLM.md`
- `docs/refatoracao-clean-architecture/`
- Documentação das análises parciais existentes