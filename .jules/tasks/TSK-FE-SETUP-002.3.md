# Tarefa: FE-SETUP-002.3-REVISED - Ajustar `tailwind.config.ts` (Existente) para Nova Estrutura

**ID da Tarefa:** `FE-SETUP-002.3-REVISED`
**Título Breve:** Ajustar `tailwind.config.ts` (Existente) para Nova Estrutura
**Descrição Completa:**
Utilizar o arquivo `tailwind.config.ts` (ou `.js`) localizado na tarefa `FE-SETUP-002.1-REVISED`. Se ele não estiver na raiz, movê-lo para a raiz do projeto. Atualizar sua seção `content` para que inclua os caminhos corretos para os arquivos da nova estrutura do frontend, primariamente `'./src_refactored/presentation/ui/**/*.{ts,tsx,html,js}'` e `'./src_refactored/presentation/ui/index.html'`. Verificar se as demais configurações (darkMode, plugins, theme) permanecem válidas ou se precisam de pequenos ajustes.

---

**Status:** `Pendente`
**Dependências (IDs):** `FE-SETUP-002.2-REVISED`
**Complexidade (1-5):** `1`
**Prioridade (P0-P4):** `P0`
**Responsável:** `Jules`
**Branch Git Proposta:** `feat/fe-migrate-shadcn`
**Commit da Conclusão (Link):**

---

## Critérios de Aceitação
- O arquivo `tailwind.config.ts` (ou `.js`) original é movido para a raiz (se necessário) e seu conteúdo é ajustado.
- A seção `content` está corretamente configurada para `src_refactored/presentation/ui/`.
- Outras configurações (darkMode, theme, plugins como `tailwindcss-animate`) são preservadas e funcionais.

---

## Notas/Decisões de Design
- Foco em adaptar a configuração Tailwind existente para a nova estrutura de arquivos.

---

## Comentários
- Tarefa revisada para reconfiguração do Tailwind.

---

## Histórico de Modificações da Tarefa (Opcional)
- (Data Atual) Revisada para reconfiguração do Tailwind.
