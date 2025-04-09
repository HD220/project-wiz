# Desacoplar prompt-manager da infraestrutura

## Contexto
Os componentes da pasta `src/client/components/prompt-manager` utilizam diretamente tipos e dados da camada de infraestrutura (`PromptData`, `VariableData`), violando princípios da Clean Architecture.

## Problemas
- Forte acoplamento com a infraestrutura
- Dificuldade para evoluir a camada de dados sem impactar a UI
- Violações de separação de camadas
- Dificulta testes e manutenção

## Objetivos
- Definir DTOs próprios para a camada de UI
- Adaptar componentes para usar esses DTOs
- Criar adaptadores para conversão entre DTOs e entidades da infraestrutura
- Preparar terreno para separar lógica de negócio da UI

## Recomendações
- Mapear todos os usos de `PromptData` e `VariableData` na pasta
- Criar interfaces específicas para UI (ex: `PromptDTO`, `VariableDTO`)
- Adaptar props e estados para usar os novos DTOs
- Implementar funções de conversão entre DTOs e entidades
- Garantir que a UI não dependa mais diretamente da infraestrutura

## Escopo
- Apenas criação dos DTOs e adaptação dos componentes
- Não alterar funcionalidades
- Não mover lógica de negócio ainda (será feito em outra issue)

## Critérios de aceitação
- Nenhum componente da pasta deve importar tipos da infraestrutura
- Todos devem usar DTOs próprios
- Conversão feita em camada intermediária (adaptadores)
