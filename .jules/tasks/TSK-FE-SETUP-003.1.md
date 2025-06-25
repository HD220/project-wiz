# Tarefa: FE-SETUP-003.1 - Instalar Pacotes TanStack Router e Verificar Config Plugin Vite

**ID da Tarefa:** `FE-SETUP-003.1`
**Título Breve:** Instalar Pacotes TanStack Router e Verificar Config Plugin Vite
**Descrição Completa:**
Instalar o pacote `@tanstack/react-router`. Verificar se o plugin `@tanstack/router-vite-plugin` (ou nome similar) já está instalado como dependência de desenvolvimento (deveria ter sido adicionado em `FE-SETUP-001.5.3`). Confirmar se a configuração do plugin em `vite.renderer.config.mts` está correta, especificamente os paths para `routesDirectory` (apontando para `src_refactored/presentation/ui/features`) e `generatedRouteTree` (apontando para `src_refactored/presentation/ui/routeTree.gen.ts`).

---

**Status:** `Pendente`
**Dependências (IDs):** `FE-SETUP-003, FE-SETUP-001.5.3`
**Complexidade (1-5):** `1`
**Prioridade (P0-P4):** `P0`
**Responsável:** `Jules`
**Branch Git Proposta:** `feat/fe-setup-tanstack-router`
**Commit da Conclusão (Link):**

---

## Critérios de Aceitação
- Pacote `@tanstack/react-router` está listado como dependência em `package.json` e instalado.
- Pacote `@tanstack/router-vite-plugin` (ou `@tanstack/router-plugin`) está listado como dependência de desenvolvimento.
- A configuração do plugin TanStack Router em `vite.renderer.config.mts` está verificada e correta, com `routesDirectory` apontando para `src_refactored/presentation/ui/features` e `generatedRouteTree` para `src_refactored/presentation/ui/routeTree.gen.ts`.

---

## Notas/Decisões de Design
- Esta tarefa foca em garantir que as dependências e a configuração do build para o TanStack Router estejam prontas.
- `FE-SETUP-001.5.3` já deveria ter configurado o plugin Vite. Esta tarefa inclui uma verificação dessa configuração.

---

## Comentários
- Sub-tarefa de `FE-SETUP-003`.

---

## Histórico de Modificações da Tarefa (Opcional)
- (Data Atual) Criada.
