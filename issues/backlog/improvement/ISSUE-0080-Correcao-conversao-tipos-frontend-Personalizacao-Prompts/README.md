### Título

ISSUE-0080-Correcao-conversao-tipos-frontend-Personalizacao-Prompts

---

### Descrição

**Status da revisão (10/04/2025):**

- A conversão correta de tipos (string para boolean, number, date) **não está implementada** no frontend.
- O valor padrão das variáveis é tratado como string, sem parsing ou validação.
- A persistência força todos os tipos para string, causando risco de inconsistência.
- Atualizações sobrescrevem o tipo para string e required para false, gerando perda de informação.
- Não há validações específicas para tipos nem feedback para valores inválidos.
- Issue permanece **pendente** aguardando implementação.


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