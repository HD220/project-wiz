### ISSUE: Refatorar componente ModelActions

**Descrição:**  
O componente `src/client/components/model-card/ModelActions.tsx` possuía mais de 50 linhas, misturando renderização condicional, SVGs inline e múltiplos botões.

**Objetivo:**  
Dividir em subcomponentes menores, melhorar clareza e facilitar manutenção.

---

### Status: **Concluído**

**Resumo da implementação:**

- O componente foi dividido em três subcomponentes:
  - `ActivateButton`
  - `DownloadButton`
  - `DownloadIcon`
- A renderização condicional foi simplificada, delegando para subcomponentes.
- O SVG foi isolado no componente `DownloadIcon`.
- Cada botão possui seu próprio componente, facilitando manutenção e testes.
- O componente principal `ModelActions` agora possui menos de 20 linhas e está focado apenas na lógica de decisão.

**Impacto:**  
Melhora a legibilidade, modularidade e facilita futuras manutenções e extensões.