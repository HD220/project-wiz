### ISSUE-XXXX - Histórico de versões e rollback - Personalização de Prompts

---

**Objetivo:**  
Implementar histórico de versões para prompts personalizados, permitindo restaurar versões anteriores (rollback) e melhorar a rastreabilidade das alterações.

---

**Tarefas:**

- **Backend:**
  - Criar tabela ou estrutura para armazenar versões anteriores dos prompts
  - Atualizar serviços para salvar versões a cada alteração
  - Implementar API para listar versões e restaurar uma versão específica

- **Frontend:**
  - Adicionar interface para visualizar histórico de versões
  - Permitir selecionar e restaurar uma versão anterior
  - Confirmar ação com o usuário

---

**Dependências:** Campo descrição implementado

**Categoria:** improvement

**Relacionada ao plano:** docs/ajustes-personalizacao-prompts.md - Etapa 7