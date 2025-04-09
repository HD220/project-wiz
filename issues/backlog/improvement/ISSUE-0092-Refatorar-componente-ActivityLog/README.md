### ISSUE: Refatorar componente ActivityLog

**Descrição:**  
O componente `src/client/components/activity-log.tsx` possui cerca de 140 linhas, misturando filtragem, exportação, formatação e renderização.

**Objetivo:**  
Separar lógica em hooks, dividir renderização em subcomponentes, melhorar legibilidade.