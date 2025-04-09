### Título

ISSUE-0081-Substituir-checksum-por-assinatura-digital-Personalizacao-Prompts

---

### Descrição

**Objetivo:**  
Substituir o mecanismo atual de checksum por uma assinatura digital segura para garantir a integridade e autenticidade na exportação e importação de prompts personalizados.

---

**Tarefas:**

- Backend:
  - Implementar geração de assinatura digital (ex: HMAC-SHA256 com chave secreta)
  - Armazenar assinatura junto aos dados exportados
  - Validar assinatura na importação, rejeitando arquivos adulterados
  - Remover lógica antiga de checksum

- Frontend:
  - Ajustar exportação/importação para incluir/verificar assinatura
  - Exibir erro claro se assinatura inválida

---

**Dependências:** Sanitização reforçada

**Categoria:** improvement

**Relacionada ao plano:** docs/ajustes-personalizacao-prompts.md - Etapa 3