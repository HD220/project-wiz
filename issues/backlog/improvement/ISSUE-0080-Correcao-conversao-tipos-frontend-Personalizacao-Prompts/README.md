### Título

ISSUE-0080-Correcao-conversao-tipos-frontend-Personalizacao-Prompts

---

### Descrição

**Objetivo:**  
Corrigir a conversão de tipos no frontend da feature **Personalização de Prompts** para garantir integridade dos dados enviados e evitar erros silenciosos.

---

**Tarefas:**

- Revisar componentes `PromptForm.tsx`, `VariableEditor.tsx` e relacionados
- Corrigir parsing/conversão para:
  - boolean
  - number
  - date
- Evitar envio de strings onde são esperados outros tipos
- Adicionar validações e feedback para inputs inválidos
- Criar testes para conversões e inputs inválidos

---

**Dependências:** Nenhuma

**Categoria:** improvement

**Relacionada ao plano:** docs/ajustes-personalizacao-prompts.md - Etapa 2