### Título

ISSUE-0084-Adicionar-campo-description-Personalizacao-Prompts

---

### Descrição

**Objetivo:**  
Adicionar o campo `description` aos prompts personalizados para facilitar organização, busca e entendimento do contexto de cada template.

---

### Tarefas:

- **Backend:**
  - Alterar schema e entidades para incluir campo `description`
  - Atualizar repositórios e serviços para suportar o campo
  - Migrar dados existentes (se necessário)

- **Frontend:**
  - Adicionar campo no formulário de criação/edição
  - Exibir descrição no preview e na lista de prompts
  - Validar tamanho e sanitização do campo

---

### Dependências:
Sanitização reforçada

### Categoria:
improvement

### Relacionada ao plano:
docs/ajustes-personalizacao-prompts.md - Etapa 6