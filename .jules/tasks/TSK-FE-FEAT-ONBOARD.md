# Tarefa: FE-FEAT-ONBOARD - Implementar lógica de submissão do Onboarding.

**ID da Tarefa:** `FE-FEAT-ONBOARD`
**Título Breve:** Implementar lógica de submissão do Onboarding.
**Descrição Completa:**
Implementar a lógica de submissão para o fluxo de onboarding (`FE-PAGE-ONBOARD`). Isso envolve coletar todos os dados das diferentes etapas do onboarding (informações do usuário, configuração do LLM, persona selecionada) e fazer as chamadas IPC necessárias (definidas em `FE-IPC-ONBOARD`) para persistir essas informações no backend (ex: `createLLMProviderConfig`, `createUser`).

---

**Status:** `Pendente`
**Dependências (IDs):** `FE-PAGE-ONBOARD`, `FE-IPC-ONBOARD`
**Complexidade (1-5):** `2`
**Prioridade (P0-P4):** `P0` (Finalização do fluxo crítico de onboarding)
**Responsável:** `Frontend`
**Branch Git Proposta:** `feat/fe-feature-onboarding-submit`
**Commit da Conclusão (Link):**

---

## Critérios de Aceitação
- Função de submissão implementada que coleta dados de todas as etapas do formulário de onboarding.
- Chamadas IPC para `createLLMProviderConfig` e `createUser` (ou equivalentes de `FE-IPC-ONBOARD`) são feitas com os dados corretos.
- Feedback apropriado (sucesso/erro) é exibido ao usuário após a tentativa de submissão.
- Em caso de sucesso, o usuário é redirecionado para a próxima tela apropriada (ex: dashboard do projeto).

---

## Notas/Decisões de Design
- Chamadas IPC para `createLLMProviderConfig` e `createUser` via `useCore()`. (Nota original da tarefa, adaptada)
- Gerenciamento de estado entre as etapas do onboarding é crucial e deve ser finalizado em `FE-PAGE-ONBOARD`.

---

## Comentários
- `(Data da migração): Tarefa migrada para novo formato.`

---

## Histórico de Modificações da Tarefa (Opcional)
-
