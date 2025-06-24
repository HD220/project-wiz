# Tarefa: FE-SETUP-001.2 - Mover e ajustar index.html para src_refactored/presentation/ui/index.html.

**ID da Tarefa:** `FE-SETUP-001.2`
**Título Breve:** Mover e ajustar `index.html` para `src_refactored/presentation/ui/index.html`.
**Descrição Completa:**
Mover o arquivo `index.html` do ponto de entrada do renderer da sua localização original (provavelmente `src_refactored/presentation/electron/renderer/index.html` após `FE-SETUP-001.1`) para a nova localização definitiva em `src_refactored/presentation/ui/index.html`. Ajustar o conteúdo do arquivo se necessário para refletir a nova estrutura ou requisitos do Vite.

---

**Status:** `Concluído`
**Dependências (IDs):** `FE-SETUP-001.1`
**Complexidade (1-5):** `1`
**Prioridade (P0-P4):** `P0`
**Responsável:** `Jules`
**Branch Git Proposta:** `feat/fe-finalize-basic-renderer-setup`
**Commit da Conclusão (Link):** `Commit da Conclusão (Link)` (Nota: Link exato não estava no TASKS.md original)

---

## Critérios de Aceitação
- Arquivo `index.html` movido para `src_refactored/presentation/ui/index.html`.
- Conteúdo do `index.html` verificado e ajustado para carregar o `main.tsx` da mesma pasta.
- Caminhos para assets ou scripts no `index.html` atualizados se necessário.

---

## Notas/Decisões de Design
- Movido de `presentation/electron/renderer/` e conteúdo verificado. (Nota original da tarefa)
- Esta mudança centraliza os arquivos raiz da UI em `presentation/ui/`.

---

## Comentários
- `(Data da migração): Tarefa migrada para novo formato.`

---

## Histórico de Modificações da Tarefa (Opcional)
-
