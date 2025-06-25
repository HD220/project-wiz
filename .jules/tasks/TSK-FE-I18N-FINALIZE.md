# Tarefa: FE-I18N-FINALIZE - Garantir que todas as traduções i18n (LinguiJS) estejam implementadas e corretas.

**ID da Tarefa:** `FE-I18N-FINALIZE`
**Título Breve:** Garantir que todas as traduções i18n (LinguiJS) estejam implementadas e corretas.
**Descrição Completa:**
Se o LinguiJS for utilizado para internacionalização (conforme decisão em `FE-SETUP-004`), esta tarefa envolve garantir que todos os textos visíveis na interface do usuário foram extraídos para arquivos de catálogo, traduzidos para os locales suportados, e que as traduções são carregadas e exibidas corretamente na aplicação.

---

**Status:** `Pendente`
**Dependências (IDs):** `Todas FE-PAGE-*, FE-COMP-*`, `FE-SETUP-004` (Configuração do LinguiJS)
**Complexidade (1-5):** `3`
**Prioridade (P0-P4):** `P2` (Importante para mercados não anglófonos)
**Responsável:** `Frontend`
**Branch Git Proposta:** `feat/fe-i18n-finalize`
**Commit da Conclusão (Link):**

---

## Critérios de Aceitação
- Todos os textos da UI extraídos para arquivos de mensagens (`.po` ou similar).
- Traduções fornecidas para todos os locales suportados.
- Arquivos de mensagens compilados.
- A aplicação carrega e exibe as traduções corretas ao mudar o locale.
- Nenhuma string de texto "hardcoded" restante na UI que deveria ser traduzível.

---

## Notas/Decisões de Design
- O processo de tradução em si pode ser externo, mas a integração técnica é responsabilidade do frontend.
- Testar a troca de idiomas e a renderização correta de caracteres especiais.

---

## Comentários
- `(Data da migração): Tarefa migrada para novo formato.`

---

## Histórico de Modificações da Tarefa (Opcional)
-
