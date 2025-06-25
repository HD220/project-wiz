# Tarefa: FE-SETUP-002.4 - Validar e ajustar `globals.css` com estilos base Shadcn/UI

**ID da Tarefa:** `FE-SETUP-002.4`
**Título Breve:** Validar e ajustar `globals.css` com estilos base Shadcn/UI
**Descrição Completa:**
Após a inicialização do Shadcn/UI, esta tarefa foca em garantir que o arquivo `globals.css` (localizado em `src_refactored/presentation/ui/styles/globals.css`) contenha os estilos base necessários para o Tailwind CSS e para o funcionamento correto dos componentes Shadcn/UI. Isso geralmente inclui as diretivas `@tailwind base;`, `@tailwind components;`, `@tailwind utilities;` e as variáveis CSS para temas (light/dark).

---

**Status:** `Pendente`
**Dependências (IDs):** `FE-SETUP-002.1`
**Complexidade (1-5):** `1`
**Prioridade (P0-P4):** `P0`
**Responsável:** `Jules`
**Branch Git Proposta:** `feat/fe-setup-shadcn`
**Commit da Conclusão (Link):**

---

## Critérios de Aceitação
- O arquivo `globals.css` em `src_refactored/presentation/ui/styles/globals.css` contém as diretivas base do Tailwind.
- O arquivo `globals.css` contém as variáveis CSS para o tema padrão (ou temas light/dark) do Shadcn/UI.
- O `globals.css` está sendo importado corretamente no ponto de entrada da aplicação React (ex: `main.tsx`).

---

## Notas/Decisões de Design
- A tarefa `FE-SETUP-010` já moveu o `globals.css` para o local correto. Esta tarefa garante que seu *conteúdo* seja atualizado pelo Shadcn.
- Verificar se o CLI do Shadcn atualizou corretamente este arquivo ou se ajustes manuais são necessários.

---

## Comentários
- Criada como parte do desmembramento de `FE-SETUP-002`.

---

## Histórico de Modificações da Tarefa (Opcional)
-
