# Tarefa: FE-SETUP-004 - Configurar LinguiJS para i18n (REAVALIAR NECESSIDADE).

**ID da Tarefa:** `FE-SETUP-004`
**Título Breve:** Configurar LinguiJS para i18n (REAVALIAR NECESSIDADE).
**Descrição Completa:**
Avaliar a necessidade de internacionalização (i18n) com LinguiJS na nova aplicação frontend. Se for decidido prosseguir, instalar e configurar o LinguiJS, incluindo a CLI, configuração de locales, e integração com a aplicação React.

---

**Status:** `Pendente`
**Dependências (IDs):** `FE-SETUP-001.6`
**Complexidade (1-5):** `2`
**Prioridade (P0-P4):** `P3` (Menor prioridade se não for essencial para o MVP)
**Responsável:** `Frontend` (Originalmente, mas Jules pode iniciar)
**Branch Git Proposta:** `feat/fe-setup-lingui`
**Commit da Conclusão (Link):**

---

## Critérios de Aceitação
- Decisão tomada sobre o uso do LinguiJS.
- Se sim:
    - Pacotes do LinguiJS (`@lingui/core`, `@lingui/react`, `@lingui/cli`, etc.) instalados.
    - Arquivo de configuração do LinguiJS (`lingui.config.ts` ou similar) criado e configurado com os locales suportados.
    - Scripts para extrair e compilar mensagens adicionados ao `package.json`.
    - `I18nProvider` configurado no `main.tsx` da aplicação.
    - Um exemplo de componente com texto traduzido funcionando.

---

## Notas/Decisões de Design
- Avaliar se LinguiJS será usado e como será integrado, já que foi removido do `main.tsx` durante a configuração inicial do `FE-SETUP-001.3`. (Nota original da tarefa)

---

## Comentários
- `(Data da migração): Tarefa migrada para novo formato.`

---

## Histórico de Modificações da Tarefa (Opcional)
-
