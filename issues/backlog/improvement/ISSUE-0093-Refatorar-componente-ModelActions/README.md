### ISSUE: Refatorar componente ModelActions

**Descrição:**  
O componente `src/client/components/model-card/ModelActions.tsx` possui mais de 50 linhas, misturando renderização condicional, SVGs inline e múltiplos botões.

**Objetivo:**  
Dividir em subcomponentes menores, melhorar clareza e facilitar manutenção.