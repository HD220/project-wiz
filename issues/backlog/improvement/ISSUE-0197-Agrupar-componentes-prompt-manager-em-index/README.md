# ISSUE-0197: Agrupar componentes de prompt-manager em index para exportação

## Descrição do problema

A pasta `src/client/components/prompt-manager/` contém múltiplos arquivos de componentes pequenos e relacionados (`prompt-form.tsx`, `prompt-list.tsx`, `prompt-manager.tsx`, `prompt-preview.tsx`, `PromptContainer.tsx`, `PromptStatus.tsx`, `PromptToolbar.tsx`, `variable-editor.tsx`), mas não possui um arquivo `index.ts` ou `index.tsx` para exportação centralizada.

Isso dificulta a importação e reutilização dos componentes, além de aumentar a fragmentação do código.

## Exemplo concreto

Pasta afetada:
```
src/client/components/prompt-manager/
  prompt-form.tsx
  prompt-list.tsx
  prompt-manager.tsx
  prompt-preview.tsx
  PromptContainer.tsx
  PromptStatus.tsx
  PromptToolbar.tsx
  variable-editor.tsx
```

## Recomendação de correção/refatoração

Criar um arquivo `index.ts` ou `index.tsx` na pasta `prompt-manager` para exportar todos os componentes relevantes, facilitando a importação e promovendo organização.

Exemplo:
```ts
export * from './prompt-form';
export * from './prompt-list';
export * from './prompt-manager';
export * from './prompt-preview';
export * from './PromptContainer';
export * from './PromptStatus';
export * from './PromptToolbar';
export * from './variable-editor';
```

## Justificativa

- **Organização e manutenção:** Agrupar componentes relacionados em um index facilita a manutenção e a importação em outros módulos.
- **Aderência às boas práticas do projeto:** Seguir o padrão de agrupamento já adotado em outras pastas (ex: access-token-form, activity-log, model-card).
- **Redução de technical debt:** Evita fragmentação excessiva e melhora a escalabilidade do código.

---