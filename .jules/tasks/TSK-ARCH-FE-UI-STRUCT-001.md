# Tarefa: ARCH-FE-UI-STRUCT-001 - Definir e documentar a organização interna detalhada de src_refactored/presentation/ui/.

**ID da Tarefa:** `ARCH-FE-UI-STRUCT-001`
**Título Breve:** Definir e documentar a organização interna detalhada de `src_refactored/presentation/ui/`.
**Descrição Completa:**
Definir e documentar a estrutura de pastas e a organização interna detalhada do diretório `src_refactored/presentation/ui/`. Esta estrutura deve guiar como os componentes React, hooks, páginas, serviços de UI, estado global, estilos, assets, tipos, etc., são organizados para o novo frontend.

---

**Status:** `Concluído`
**Dependências (IDs):** `FE-SETUP-001.6` (Estrutura base do FE e ponto de entrada principal da UI devem estar estabelecidos)
**Complexidade (1-5):** `3`
**Prioridade (P0-P4):** `P0` (Fundamental para a organização do FE)
**Responsável:** `Jules (Arquiteto)`
**Branch Git Proposta:** `arch/fe-define-ui-folder-structure`
**Commit da Conclusão (Link):** (Nota: Link não estava no TASKS.md original, mas a tarefa está concluída)

---

## Critérios de Aceitação
- Documento de proposta da estrutura de diretórios interna de `presentation/ui/` criado e aprovado.
- A estrutura define claramente a localização para:
    - `index.html` e `main.tsx` (nível raiz de `presentation/ui/`).
    - Componentes de UI (comum, layout, específicos de UI/primitivos).
    - Features/Módulos (agrupando páginas, hooks, componentes, serviços e tipos específicos da feature).
    - Configurações globais da UI.
    - Hooks globais.
    - Bibliotecas/Utilitários de UI.
    - Serviços globais da UI (ex: chamadas IPC abstraídas).
    - Estado global do cliente (se aplicável, ex: Zustand, Jotai).
    - Estilos globais e temas.
    - Assets (imagens, fontes).
    - Tipos globais da UI.
- A estrutura promove clareza, manutenibilidade e boa Developer Experience (DX).

---

## Notas/Decisões de Design
- Estrutura aprovada: `index.html` e `main.tsx` (com providers) em `presentation/ui/`.
- Pastas principais: `components/` (common, layout, ui), `features/` (com pages, hooks, components, services, types aninhados), `config/`, `hooks/` (global), `lib/`, `services/` (global IPC), `store/` (global client), `styles/`, `assets/`, `types/` (global). (Nota original da tarefa)

---

## Comentários
- `(Data da migração): Tarefa migrada para novo formato.`

---

## Histórico de Modificações da Tarefa (Opcional)
-
