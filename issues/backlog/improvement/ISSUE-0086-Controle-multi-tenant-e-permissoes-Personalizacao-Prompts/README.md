### Título

ISSUE-0086-Controle-multi-tenant-e-permissoes-Personalizacao-Prompts

---

### Descrição

**Objetivo:**  
Implementar controle multi-tenant e permissões na feature **Personalização de Prompts** para garantir isolamento, segurança e gestão adequada dos dados por usuário ou organização.

---

**Tarefas:**

- Backend:
  - Definir modelo multi-tenant (ex: por organização ou usuário)
  - Adaptar schema, repositórios e serviços para isolar dados por tenant
  - Implementar controle de permissões (CRUD, compartilhamento, visibilidade)

- Frontend:
  - Ajustar UI para refletir permissões e contexto do tenant
  - Ocultar ou mostrar ações conforme permissões do usuário

---

**Dependências:** Histórico de versões implementado

**Categoria:** improvement

**Relacionada ao plano:** docs/ajustes-personalizacao-prompts.md - Etapa 8