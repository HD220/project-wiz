# Implementar visualização de métricas de desempenho dos modelos LLM

**Descrição:**

Implementar um componente para visualização de métricas de desempenho dos modelos LLM no frontend.

**Requisitos:**

- Mostrar uso de memória, tempo de resposta, tokens/s.
- Integrar com os dados do `WorkerService`.
- Apresentar visualizações gráficas das métricas.

**Contexto:**

O sistema precisa exibir métricas de desempenho dos modelos LLM. Atualmente, há apenas um placeholder no sidebar mostrando o uso de memória.

**Referências:**

- Monitoramento básico em `WorkerService.ts` (linhas 124-134).
- Placeholder no `App.tsx` (linhas 159-173).
