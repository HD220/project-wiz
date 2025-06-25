# Tarefa: FE-PAGE-ONBOARD - Implementar Página de Onboarding

**ID da Tarefa:** `FE-PAGE-ONBOARD`
**Título Breve:** Implementar Página de Onboarding (`(public)/onbording/index.tsx` equivalente).
**Descrição Completa:**
Implementar a página de onboarding para novos usuários. Esta página guiará o usuário através da configuração inicial, como coletar informações do usuário (`UserInfoForm`), configurar o provedor de LLM (`LLMConfigForm`), e selecionar uma persona inicial (`PersonaList`).

---

**Status:** `Pendente`
**Dependências (IDs):** `FE-LAYOUT-005` (Layout Público), `FE-COMP-ONBOARD-USER`, `FE-COMP-ONBOARD-LLM`, `FE-COMP-ONBOARD-PERSONA`
**Complexidade (1-5):** `4`
**Prioridade (P0-P4):** `P0` (Fluxo crítico para novos usuários)
**Responsável:** `Frontend`
**Branch Git Proposta:** `feat/fe-page-onboarding`
**Commit da Conclusão (Link):**

---

## Critérios de Aceitação
- Componente de página `OnboardingPage.tsx` (ou similar, ex: `routes/(public)/onboarding/index.tsx`) criado.
- Integra os componentes `UserInfoForm`, `LLMConfigForm`, e `PersonaList` em um fluxo de múltiplas etapas ou em uma única página longa.
- Gerencia o estado entre as etapas do onboarding.
- Ao final do fluxo, os dados coletados são submetidos (a lógica de submissão será tratada em `FE-FEAT-ONBOARD`).
- Navegação clara entre as etapas do onboarding.

---

## Notas/Decisões de Design
- Inclui formulários de UserInfo, LLMConfig, seleção de Persona. (Nota original da tarefa)
- **Requer subdivisão:** Devido à complexidade 4, esta tarefa deve ser subdividida após a migração de formato. As sub-tarefas podem focar em cada etapa do onboarding, no gerenciamento de estado do fluxo, e na UI geral da página.

---

## Comentários
- `(Data da migração): Tarefa migrada para novo formato.`

---

## Histórico de Modificações da Tarefa (Opcional)
-
