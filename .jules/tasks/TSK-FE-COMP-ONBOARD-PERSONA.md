# Tarefa: FE-COMP-ONBOARD-PERSONA - Implementar PersonaList

**ID da Tarefa:** `FE-COMP-ONBOARD-PERSONA`
**Título Breve:** Implementar `PersonaList` (onboarding/persona-list.tsx equivalente).
**Descrição Completa:**
Reimplementar o componente `PersonaList` usado durante o processo de onboarding. Este componente exibe uma lista de personas pré-definidas (ou carregadas dinamicamente) para o usuário selecionar uma como ponto de partida.

---

**Status:** `Em Andamento`
**Dependências (IDs):** `FE-SETUP-002 (Shadcn base)` (Componentes Shadcn/UI como Card, ScrollArea são usados diretamente)
**Complexidade (1-5):** `2`
**Prioridade (P0-P4):** `P1` (Parte do fluxo de onboarding)
**Responsável:** `Jules`
**Branch Git Proposta:** `feat/fe-comp-onboard-persona`
**Commit da Conclusão (Link):**

---

## Critérios de Aceitação
- Componente `PersonaList.tsx` criado em `src_refactored/presentation/ui/features/onboarding/components/PersonaList.tsx`. **(Concluído)**
- Exibe uma lista de personas (usando dados placeholder), cada uma com nome, descrição, tags e placeholder para ícone. **(Concluído)**
- Permite ao usuário selecionar uma persona da lista clicando no card. **(Concluído)**
- A seleção de uma persona chama uma função de callback `onSelectPersona` com o ID da persona selecionada. **(Concluído)**
- Utiliza componentes Shadcn/UI (`Card`, `ScrollArea`) para a apresentação da lista. **(Concluído)**
- Estilização para indicar a persona selecionada (borda, anel, ícone de marca de seleção). **(Concluído)**

---

## Notas/Decisões de Design
- O componente `PersonaList` recebe uma lista de personas e uma função de callback para lidar com a seleção.
- Utiliza dados placeholder para as personas; a integração com dados reais será uma tarefa separada.
- Cada persona é renderizada como um `Card` clicável.
- A seleção é indicada visualmente com uma borda colorida, um anel e um ícone `CheckCircle2`.
- A lista é envolta em uma `ScrollArea` para lidar com um número potencialmente grande de personas.
- O layout da lista é uma grade responsiva (1, 2 ou 3 colunas dependendo do tamanho da tela).

---

## Comentários
- `(Data da migração): Tarefa migrada para novo formato.`
- `(Data Atual): Implementado o componente PersonaList para o fluxo de onboarding.`

---

## Histórico de Modificações da Tarefa (Opcional)
-
