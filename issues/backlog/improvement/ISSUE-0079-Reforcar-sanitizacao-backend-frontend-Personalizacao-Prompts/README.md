### Título

ISSUE-0079-Reforcar-sanitizacao-backend-frontend-Personalizacao-Prompts

---

### Descrição

**Objetivo:**  
Reforçar a sanitização de dados na feature **Personalização de Prompts** para mitigar riscos de injeção, XSS e dados maliciosos.

---

**Tarefas:**

- Backend:
  - Reforçar sanitização profunda em prompts, variáveis e metadados
  - Bloquear scripts, HTML, SQL injection, caracteres perigosos
  - Criar testes unitários para inputs maliciosos

- Frontend:
  - Sanitizar inputs no formulário e editor de variáveis
  - Prevenir XSS na renderização da prévia
  - Validar e limpar dados antes do envio

---

**Dependências:** Nenhuma

**Categoria:** improvement

**Relacionada ao plano:** docs/ajustes-personalizacao-prompts.md - Etapa 1