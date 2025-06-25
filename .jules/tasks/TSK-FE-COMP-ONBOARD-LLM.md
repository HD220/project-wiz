# Tarefa: FE-COMP-ONBOARD-LLM - Implementar LLMConfigForm

**ID da Tarefa:** `FE-COMP-ONBOARD-LLM`
**Título Breve:** Implementar `LLMConfigForm` (onboarding/llm-config-form.tsx equivalente).
**Descrição Completa:**
Reimplementar o componente `LLMConfigForm` usado durante o processo de onboarding. Este formulário permite ao usuário configurar seu provedor de LLM, inserindo chaves de API, selecionando modelos, etc. Deve usar componentes Shadcn/UI para os campos do formulário e Zod/React Hook Form para validação.

---

**Status:** `Pendente`
**Dependências (IDs):** `FE-SETUP-002 (Shadcn base), FE-SETUP-005 (RHF/Zod), FE-COMP-UI-001, FE-COMP-UI-002, FE-COMP-UI-004, FE-COMP-UI-005, FE-COMP-UI-007` (Nota: FE-COMP-UI-* foram canceladas; a dependência real é em componentes base Shadcn/UI como Button, Card, Input, Select, Form)
**Complexidade (1-5):** `3`
**Prioridade (P0-P4):** `P1` (Essencial para o onboarding)
**Responsável:** `Frontend`
**Branch Git Proposta:** `feat/fe-comp-onboard-llm`
**Commit da Conclusão (Link):**

---

## Critérios de Aceitação
- Componente `LLMConfigForm.tsx` criado em `src_refactored/presentation/ui/features/onboarding/components/` (ou local apropriado).
- Formulário inclui campos para seleção de provedor LLM (ex: OpenAI, Anthropic), chave de API, seleção de modelo.
- Utiliza componentes Shadcn/UI (`Input`, `Select`, `Button`, `Card`, `Form`) para a interface.
- Validação implementada com Zod e React Hook Form.
- Submissão do formulário chama uma função de callback com os dados configurados.

---

## Notas/Decisões de Design
- Lógica para lidar com seleção de provedor/modelo. (Nota original da tarefa)
- As dependências originais `FE-COMP-UI-*` foram canceladas; usar componentes Shadcn/UI diretamente.

---

## Comentários
- `(Data da migração): Tarefa migrada para novo formato.`

---

## Histórico de Modificações da Tarefa (Opcional)
-
