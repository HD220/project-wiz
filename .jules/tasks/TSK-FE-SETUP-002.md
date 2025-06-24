# Tarefa: FE-SETUP-002 - Instalar e configurar Shadcn/UI.

**ID da Tarefa:** `FE-SETUP-002`
**Título Breve:** Instalar e configurar Shadcn/UI.
**Descrição Completa:**
Instalar a biblioteca de componentes Shadcn/UI e realizar sua configuração inicial no projeto. Isso inclui a criação/modificação do arquivo `components.json`, a configuração do `tailwind.config.js` (ou `tailwind.config.ts`) e a migração/criação do arquivo `globals.css` com os estilos base do Shadcn/UI.

---

**Status:** `Pendente`
**Dependências (IDs):** `FE-SETUP-001.6, FE-SETUP-010`
**Complexidade (1-5):** `2`
**Prioridade (P0-P4):** `P0` (Fundamental para a UI)
**Responsável:** `Frontend` (Originalmente, mas Jules pode iniciar)
**Branch Git Proposta:** `feat/fe-setup-shadcn`
**Commit da Conclusão (Link):**

---

## Critérios de Aceitação
- Shadcn/UI CLI (`npx shadcn-ui@latest init`) executado e configurado.
- Arquivo `components.json` criado e configurado corretamente (ex: aliases para componentes e utils).
- `tailwind.config.js` (ou `.ts`) atualizado com as configurações do Shadcn/UI (ex: plugins, temas).
- Arquivo `globals.css` (ex: em `src_refactored/presentation/ui/styles/globals.css`) contém os estilos base do Tailwind e Shadcn/UI.
- É possível adicionar um componente Shadcn/UI simples (ex: `Button`) e usá-lo na aplicação.

---

## Notas/Decisões de Design
- Inclui `components.json`, `tailwind.config.js`, e `globals.css` (migrado de `FE-SETUP-010`). (Nota original da tarefa)
- A tarefa `FE-SETUP-010` (migrar `globals.css`) é uma dependência, garantindo que o `globals.css` base já esteja no local correto antes de ser modificado pelo Shadcn/UI.

---

## Comentários
- `(Data da migração): Tarefa migrada para novo formato.`

---

## Histórico de Modificações da Tarefa (Opcional)
-
