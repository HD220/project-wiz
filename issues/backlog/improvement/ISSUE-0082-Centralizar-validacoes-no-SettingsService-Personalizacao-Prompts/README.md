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

---

### Status da Revisão (Abril/2025)

Após análise do código-fonte, **a centralização das validações no `SettingsService` ainda não foi implementada**.

- O `SettingsService` atualmente **apenas fornece configurações** (limites, palavras proibidas), mas **não executa validações**.
- As validações continuam dispersas em múltiplas classes, principalmente:
  - `PromptPolicyService` (`src/core/application/services/prompt-policy-service.ts`)
  - `PromptValidator` (`src/core/domain/services/prompt-validator.ts`)
  - Funções auxiliares em outros serviços
- Não há um ponto único para validação de limites, formatos e palavras proibidas.
- API, UI e import/export **não utilizam um mecanismo centralizado**.

**Status:** PENDENTE  
**Próximos passos recomendados:**  
Consolidar as regras no `SettingsService` ou criar um módulo dedicado de validação, utilizado por todas as camadas, conforme escopo original.