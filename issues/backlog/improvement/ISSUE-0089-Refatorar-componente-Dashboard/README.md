### ISSUE: Refatorar componente Dashboard

**Descrição:**  
O componente `src/client/components/dashboard.tsx` possui mais de 400 linhas, misturando múltiplas responsabilidades, lógica de dados, renderização e layout. Viola princípios de Clean Code e Clean Architecture.

**Objetivo:**  
Dividir o componente em subcomponentes menores, separar lógica de dados em hooks, melhorar legibilidade e manutenibilidade.