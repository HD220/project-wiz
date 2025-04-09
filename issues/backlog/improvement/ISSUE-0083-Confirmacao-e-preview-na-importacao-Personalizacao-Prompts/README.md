### Título

ISSUE-0083-Confirmacao-e-preview-na-importacao-Personalizacao-Prompts

---

### Descrição

**Objetivo:**  
Adicionar confirmação e visualização prévia na importação de prompts personalizados para evitar sobrescrita acidental e garantir integridade dos dados.

---

**Tarefas:**

- Frontend:
  - Criar modal com preview detalhado do conteúdo importado (prompts, variáveis, descrições)
  - Solicitar confirmação explícita do usuário antes de importar
  - Exibir alertas para dados sensíveis detectados

- Backend:
  - Validar assinatura digital e sanitização antes de salvar
  - Rejeitar arquivos adulterados ou maliciosos

---

**Dependências:** Assinatura digital e validações centralizadas

**Categoria:** improvement

**Relacionada ao plano:** docs/ajustes-personalizacao-prompts.md - Etapa 5