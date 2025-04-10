### ISSUE: Refatorar componente ActivityLog

**Status:** Concluído

**Descrição:**  
O componente `src/client/components/activity-log.tsx` possuía cerca de 140 linhas, misturando filtragem, exportação, formatação e renderização.

**Objetivo:**  
Separar lógica em hooks, dividir renderização em subcomponentes, melhorar legibilidade.

---

### Resultado da Refatoração

- O componente foi modularizado na pasta `src/client/components/activity-log/`.
- Foram criados subcomponentes:
  - `conversation-list.tsx`
  - `conversation-item.tsx`
  - `message-list.tsx`
  - `message-item.tsx`
  - `export-button.tsx`
- A lógica de filtragem, exportação e formatação foi extraída para o hook `useActivityLog` (`src/client/hooks/use-activity-log.ts`).
- O ponto de entrada do componente é `src/client/components/activity-log/index.tsx`.
- A nova estrutura melhora a legibilidade, separação de responsabilidades e facilita manutenção futura.

---

### Próximos passos recomendados

- Criar testes unitários para os hooks e subcomponentes.
- Avaliar performance com grandes volumes de dados.
- Documentar a API pública do componente.