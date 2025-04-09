### ISSUE-XXXX - Centralizar validações no SettingsService - Personalização de Prompts

---

**Objetivo:**  
Centralizar todas as validações da feature **Personalização de Prompts** no `SettingsService` para garantir consistência, facilitar manutenção e evitar duplicidade.

---

**Tarefas:**

- Mapear todas as validações existentes (limites, palavras proibidas, formatos)
- Mover regras dispersas no backend e frontend para métodos centralizados no `SettingsService`
- Garantir que API, UI e import/export usem essas validações
- Cobrir com testes unitários
- Documentar limites e regras no código e documentação técnica

---

**Dependências:** Assinatura digital implementada

**Categoria:** improvement

**Relacionada ao plano:** docs/ajustes-personalizacao-prompts.md - Etapa 4