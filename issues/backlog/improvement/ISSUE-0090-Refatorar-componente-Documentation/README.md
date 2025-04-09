### ISSUE: Refatorar componente Documentation

**Descrição:**  
O componente `src/client/components/documentation.tsx` possui quase 400 linhas, com lógica de filtragem, formatação e renderização misturadas. Viola Clean Code.

**Objetivo:**  
Modularizar em subcomponentes e hooks, separar responsabilidades, facilitar manutenção.