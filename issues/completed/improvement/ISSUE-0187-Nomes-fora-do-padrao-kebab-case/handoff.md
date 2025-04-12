# Handoff – ISSUE-0187 – Hooks/componentes com nomes fora do padrão kebab-case

**Data:** 2025-04-12  
**Responsável:** Code Mode (Roo)  
**Ação:**  
- Renomeados todos os arquivos de hooks e componentes que estavam fora do padrão kebab-case, conforme ADR-0015.
- Atualizados todos os imports e referências para refletir os novos nomes.
- Componentes e hooks afetados:
  - `usePromptManager.ts` → `use-prompt-manager.ts`
  - `usePromptShare.ts` → `use-prompt-share.ts`
  - `AuthProvider.tsx` → `auth-provider.tsx`
  - `LoginForm.tsx` → `login-form.tsx`
  - `RegisterForm.tsx` → `register-form.tsx`
  - `RouteGuard.tsx` → `route-guard.tsx`
  - `PromptContainer.tsx` → `prompt-container.tsx`
  - `PromptStatus.tsx` → `prompt-status.tsx`
  - `PromptToolbar.tsx` → `prompt-toolbar.tsx`
- Todos os imports/referências nos arquivos afetados foram atualizados.

**Justificativa:**  
Entrega concluída conforme ISSUE-0187 e ADR-0015, garantindo consistência e facilitando automação futura.

---