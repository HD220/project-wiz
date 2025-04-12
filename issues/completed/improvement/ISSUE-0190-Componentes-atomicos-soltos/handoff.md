# Handoff – ISSUE-0190 – Componentes atômicos soltos

**Data:** 2025-04-12  
**Responsável:** Code Mode (Roo)  
**Ação:**  
- Componentes atômicos `export-button.tsx`, `refresh-button.tsx` e `status-message.tsx` foram movidos da raiz de `src/client/components/` para `src/client/components/ui/`.
- Atualizado `src/client/components/ui/index.ts` para exportação centralizada desses componentes.
- Todos os imports no projeto foram atualizados para utilizar a exportação centralizada via `@/components/ui`.
- Removida exportação default de `StatusMessage` para padronizar apenas exportação nomeada.
- Organização dos componentes agora segue o padrão de atomicidade e facilita manutenção.

**Justificativa:**  
A ação melhora a organização dos componentes atômicos, facilita a manutenção e localização, e segue as boas práticas de componentização recomendadas na issue.

**Próximo passo:**  
Mover a issue para `issues/completed/improvement/` conforme as regras do projeto.