### Título

ISSUE-0087-Gerenciamento-de-tokens-de-compartilhamento-Personalizacao-Prompts

---

### Descrição

**Objetivo:**  
Implementar gerenciamento avançado de tokens de compartilhamento para prompts personalizados, incluindo expiração, revogação e controle de acesso.

---

**Tarefas:**

- **Backend:**
  - Criar estrutura para tokens com expiração e revogação
  - Implementar API para gerar, listar, revogar e validar tokens
  - Associar tokens a tenants e permissões

- **Frontend:**
  - UI para gerenciar tokens (criar, revogar, visualizar validade)
  - Alertar sobre tokens expirados ou revogados
  - Exibir status do token ao acessar via link

---

**Dependências:** Multi-tenant e permissões implementados

**Categoria:** improvement

**Relacionada ao plano:** docs/ajustes-personalizacao-prompts.md - Etapa 9