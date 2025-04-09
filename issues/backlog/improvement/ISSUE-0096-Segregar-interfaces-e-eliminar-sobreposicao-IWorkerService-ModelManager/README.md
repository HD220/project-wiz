# ISSUE-0096: Segregar interfaces e eliminar sobreposição entre IWorkerService e IModelManager

## Problema
As interfaces `IWorkerService` e `IModelManager` possuem métodos sobrepostos para gerenciamento de modelos. Além disso, `IWorkerService` mistura responsabilidades de gerenciamento de modelos, controle de contexto e manipulação de eventos.

Isso viola o princípio da Segregação de Interfaces (ISP), dificultando a manutenção, testes e evolução independente das funcionalidades.

## Impacto
- Aumenta o acoplamento entre funcionalidades distintas
- Dificulta a substituição ou extensão de partes específicas
- Torna a implementação mais complexa e sujeita a erros
- Prejudica a clareza dos contratos

## Recomendação
- Segregar `IWorkerService` em interfaces menores e específicas:
  - Interface para gerenciamento de modelos
  - Interface para controle de contexto
  - Interface para eventos
- Eliminar sobreposição com `IModelManager`, definindo claramente as responsabilidades de cada uma
- Atualizar implementações e dependências para refletir a nova estrutura

## Critérios de Aceite
- Interfaces segregadas e sem sobreposição
- Código ajustado para usar as novas interfaces
- Documentação atualizada refletindo a separação

## Prioridade
Alta — melhoria estrutural fundamental para evolução da arquitetura

