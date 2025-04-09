### Título

ISSUE-0088-Alertas-dados-sensiveis-Personalizacao-Prompts

---

### Descrição

**Objetivo:**  
Implementar alertas para dados sensíveis em prompts personalizados, especialmente ao compartilhar, para evitar vazamento de informações confidenciais.

---

**Tarefas:**

- **Backend:**
  - Implementar detecção básica de dados sensíveis (regex para emails, chaves, tokens, senhas)
  - Marcar prompts com possíveis dados sensíveis detectados
  - Bloquear ou alertar na exportação/importação e compartilhamento

- **Frontend:**
  - Exibir alerta visual ao compartilhar prompts com dados sensíveis detectados
  - Solicitar confirmação extra do usuário antes de compartilhar
  - Exibir alertas na importação de prompts com dados sensíveis

---

**Dependências:** Gerenciamento de tokens implementado

**Categoria:** improvement

**Relacionada ao plano:** docs/ajustes-personalizacao-prompts.md - Etapa 10