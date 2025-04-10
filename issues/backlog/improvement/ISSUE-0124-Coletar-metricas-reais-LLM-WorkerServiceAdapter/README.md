# ISSUE-0124: Coletar métricas reais LLM no WorkerServiceAdapter

## Categoria
improvement

## Prioridade
Alta

## Contexto
Durante a revisão da ISSUE-0078, foi identificado que a API de métricas do WorkerServiceAdapter atualmente retorna dados mockados. A ausência de coleta real impede o monitoramento preciso do uso dos modelos LLM, dificultando diagnósticos, otimizações e a avaliação da performance do sistema.

## Objetivo
Implementar a coleta real de métricas de uso dos modelos LLM no WorkerServiceAdapter, substituindo os dados mockados por informações reais e atualizadas.

## Critérios de Aceitação
- Coletar e registrar as seguintes métricas:
  - Quantidade de tokens gerados por requisição
  - Latência de resposta do modelo
  - Uso de CPU e memória durante a execução
  - Ocorrência de erros e falhas
- Integrar a coleta dessas métricas diretamente no WorkerServiceAdapter
- Expor as métricas reais via API IPC para consumo pelo frontend e outros módulos
- Atualizar o dashboard de métricas para exibir os dados reais coletados
- Garantir que a coleta tenha impacto mínimo na performance geral do sistema

## Benefícios Esperados
- Melhorar a observabilidade do uso dos modelos LLM
- Permitir diagnósticos mais precisos de problemas de performance
- Facilitar a otimização do uso de recursos
- Aumentar a confiabilidade das informações exibidas no dashboard

## Notas Técnicas
- Avaliar a necessidade de ajustes na API IPC para suportar os novos dados
- Considerar a persistência histórica das métricas para análise longitudinal
- Garantir compatibilidade com diferentes modelos LLM suportados pelo sistema

## Relacionamento com outras issues
- ISSUE-0078: Monitorar e otimizar performance LLM
- ISSUE-0035: Implementar visualização de métricas LLM
- ISSUE-0044: Implementar métricas de uso de GPU (complementar)