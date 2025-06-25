# Tarefa: FE-COMP-ONBOARD-PERSONA - Implementar PersonaList

**ID da Tarefa:** `FE-COMP-ONBOARD-PERSONA`
**Título Breve:** Implementar `PersonaList` (onboarding/persona-list.tsx equivalente).
**Descrição Completa:**
Reimplementar o componente `PersonaList` usado durante o processo de onboarding. Este componente exibe uma lista de personas pré-definidas (ou carregadas dinamicamente) para o usuário selecionar uma como ponto de partida.

---

**Status:** `Pendente`
**Dependências (IDs):** `FE-SETUP-002 (Shadcn base), FE-COMP-UI-002` (Nota: FE-COMP-UI-002 foi cancelada; a dependência real é no componente Card do Shadcn/UI ou similar para listar itens)
**Complexidade (1-5):** `2`
**Prioridade (P0-P4):** `P1` (Parte do fluxo de onboarding)
**Responsável:** `Frontend`
**Branch Git Proposta:** `feat/fe-comp-onboard-persona`
**Commit da Conclusão (Link):**

---

## Critérios de Aceitação
- Componente `PersonaList.tsx` criado em `src_refactored/presentation/ui/features/onboarding/components/` (ou local apropriado).
- Exibe uma lista de personas, cada uma possivelmente com um nome, descrição e ícone/avatar.
- Permite ao usuário selecionar uma persona da lista.
- A seleção de uma persona chama uma função de callback com a persona selecionada.
- Utiliza componentes Shadcn/UI para a apresentação da lista (ex: `Card` para cada item, `ScrollArea` se a lista for longa).

---

## Notas/Decisões de Design
- Exibe lista de personas para seleção. (Nota original da tarefa)
- A fonte de dados das personas será tratada em outra tarefa. Este componente foca na apresentação.
- A dependência original `FE-COMP-UI-002` foi cancelada; usar componentes Shadcn/UI diretamente.

---

## Comentários
- `(Data da migração): Tarefa migrada para novo formato.`

---

## Histórico de Modificações da Tarefa (Opcional)
-
