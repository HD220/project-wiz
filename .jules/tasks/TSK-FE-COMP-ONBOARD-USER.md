# Tarefa: FE-COMP-ONBOARD-USER - Implementar UserInfoForm

**ID da Tarefa:** `FE-COMP-ONBOARD-USER`
**Título Breve:** Implementar `UserInfoForm` (onboarding/user-info-form.tsx equivalente).
**Descrição Completa:**
Reimplementar o componente `UserInfoForm` usado durante o processo de onboarding. Este formulário coleta informações básicas do usuário, como nome de usuário (com sugestão de slug) e possivelmente um avatar. Deve usar componentes Shadcn/UI e Zod/React Hook Form.

---

**Status:** `Pendente`
**Dependências (IDs):** `FE-SETUP-002 (Shadcn base), FE-SETUP-005 (RHF/Zod), FE-COMP-UI-001, FE-COMP-UI-002, FE-COMP-UI-004, FE-COMP-UI-007` (Nota: FE-COMP-UI-* foram canceladas; a dependência real é em componentes base Shadcn/UI como Button, Card, Input, Form)
**Complexidade (1-5):** `2`
**Prioridade (P0-P4):** `P1` (Essencial para o onboarding)
**Responsável:** `Frontend`
**Branch Git Proposta:** `feat/fe-comp-onboard-user`
**Commit da Conclusão (Link):**

---

## Critérios de Aceitação
- Componente `UserInfoForm.tsx` criado em `src_refactored/presentation/ui/features/onboarding/components/` (ou local apropriado).
- Formulário inclui campos para nome de usuário e upload/seleção de avatar.
- Implementa lógica para sugerir um slug de nome de usuário baseado no nome digitado.
- Utiliza componentes Shadcn/UI (`Input`, `Button`, `Card`, `Form`, possivelmente um componente de Avatar) para a interface.
- Validação implementada com Zod e React Hook Form.
- Submissão do formulário chama uma função de callback com os dados do usuário.

---

## Notas/Decisões de Design
- Lógica para avatar, slug de username. (Nota original da tarefa)
- As dependências originais `FE-COMP-UI-*` foram canceladas; usar componentes Shadcn/UI diretamente.

---

## Comentários
- `(Data da migração): Tarefa migrada para novo formato.`

---

## Histórico de Modificações da Tarefa (Opcional)
-
