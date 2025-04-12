# Handoff - ISSUE-0239-Mover-github-token-messages-para-i18n-e-restringir-uso-apresentacao

**Data:** 2025-04-12  
**Responsável:** code mode  
**Ação:** Migração de mensagens do GitHub Token Manager para i18n e restrição de uso à camada de apresentação

## Progresso

- Todas as mensagens do arquivo `src/client/lib/github-token-messages.ts` foram migradas para o sistema de internacionalização (i18n), nos arquivos `src/locales/en/common.po` e `src/locales/pt-BR/common.po`, sob o namespace `githubTokenManager`.
- O componente `src/client/components/github-token-manager.tsx` foi atualizado para consumir as mensagens diretamente do i18n, utilizando as novas chaves.
- A importação e o uso do objeto `githubTokenMessages` foram removidos do componente.
- O arquivo `src/client/lib/github-token-messages.ts` foi removido do projeto, pois não é mais necessário.
- Todas as mensagens agora estão centralizadas no sistema de i18n e são consumidas exclusivamente pela camada de apresentação (UI), conforme a diretriz da issue.
- Não foram identificadas violações de clean code nos arquivos alterados.

## Justificativa

- A centralização das mensagens no sistema de i18n facilita a manutenção, tradução e padronização das mensagens exibidas ao usuário.
- A restrição de uso das mensagens à camada de apresentação garante o alinhamento com os princípios de clean architecture e clean code, evitando acoplamento indevido entre lógica de domínio e apresentação.
- A remoção do arquivo antigo elimina redundância e reduz a possibilidade de inconsistências.

---