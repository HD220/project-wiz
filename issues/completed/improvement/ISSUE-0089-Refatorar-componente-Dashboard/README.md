### ISSUE: Refatorar componente Dashboard

**Status:** Concluída

**Descrição original:**  
O componente `src/client/components/dashboard.tsx` possuía mais de 400 linhas, misturando múltiplas responsabilidades, lógica de dados, renderização e layout, violando princípios de Clean Code e Clean Architecture.

**Objetivo:**  
Dividir o componente em subcomponentes menores, separar lógica de dados em hooks, melhorar legibilidade e manutenibilidade.

---

### Resultado da Refatoração

- O componente `Dashboard` foi reduzido para aproximadamente 40 linhas.
- Toda a lógica de dados complexa foi removida ou extraída para outros componentes e hooks.
- A renderização está agora focada apenas na composição visual, com dados estáticos ou delegados.
- O componente `LlmMetricsDashboard` foi modularizado e importado separadamente.
- O código está limpo, legível e aderente aos princípios de responsabilidade única.

### Conclusão

A refatoração atingiu os objetivos propostos, melhorando a manutenibilidade e clareza do componente, eliminando o acoplamento excessivo e a complexidade.