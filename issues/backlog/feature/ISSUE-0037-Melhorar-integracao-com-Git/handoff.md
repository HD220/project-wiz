# Melhoria da Integração com Git

## 1. Visão Geral

Expandir a integração atual com GitHub (baseada em API REST via Octokit e PAT) para suportar operações completas de Git, tanto locais quanto remotas, com foco em segurança, usabilidade e extensibilidade.

A integração permite que o usuário:

- Trabalhe com múltiplos repositórios locais/remotos
- Realize operações Git comuns (clone, pull, commit, push)
- Visualize status, branches, histórico de commits
- Crie e gerencie Pull Requests com mais opções
- Sincronize facilmente o estado local com o remoto

---

## 2. Arquitetura da Solução

### 2.1. Clean Architecture

- **Domain Layer (Ports)**
  - `IGitServicePort`: operações Git locais (clone, status, commit, push, pull, branch, sync)
  - `IGitHubApiPort`: operações via API GitHub (PRs, comentários, merge, histórico)
  - `ICredentialStoragePort`: armazenamento seguro de credenciais (keytar)

- **Application Layer**
  - Casos de uso orquestram as portas, facilitando extensões e testes

- **Infrastructure Layer**
  - `GitServiceAdapter` (simple-git)
  - `GitHubApiAdapter` (Octokit)
  - `CredentialStorageAdapter` (keytar + arquivo metadata)

### 2.2. Fluxos suportados

- **Gerenciamento de múltiplos repositórios**
  - Adição, remoção, listagem
  - Associação com URLs remotas e credenciais seguras

- **Operações Git locais**
  - Clone, status, commit, push, pull
  - Criação, alternância e exclusão de branches
  - Histórico de commits
  - Sincronização local/remoto

- **Integração GitHub API**
  - Criação de Pull Requests (com reviewers, rascunho)
  - Listagem e detalhes de PRs
  - Comentários, merge e fechamento de PRs
  - Listagem de commits e diffs

- **Segurança**
  - Tokens armazenados via keytar, nunca expostos no frontend
  - Metadados de credenciais salvos localmente, sem tokens
  - Suporte futuro planejado para OAuth

- **Extensibilidade**
  - Fácil suporte a outros provedores (GitLab, Bitbucket)
  - Separação clara entre Git local e API remota
  - Interfaces desacopladas para facilitar testes e manutenção

---

## 3. Implementação Realizada

- **Interfaces domínio**
  - `src/core/domain/ports/git-service.port.ts`
  - `src/core/domain/ports/github-api.port.ts`
  - `src/core/domain/ports/credential-storage.port.ts`

- **Adaptadores infraestrutura**
  - `src/core/infrastructure/git/git-service.adapter.ts`
  - `src/core/infrastructure/github/github-api.adapter.ts`
  - `src/core/infrastructure/electron/adapters/credential-storage.adapter.ts`

- **Tecnologias**
  - `simple-git` para operações Git locais
  - `Octokit` para API GitHub
  - `keytar` para armazenamento seguro de tokens

---

## 4. Critérios de Aceitação Atendidos

- [x] Gerenciamento de múltiplos repositórios locais/remotos
- [x] Clonar repositórios via URL autenticada
- [x] Visualizar status, branches e histórico
- [x] Realizar pull/push com tratamento de erros
- [x] Criar commits com mensagens customizadas
- [x] Criar e gerenciar Pull Requests com reviewers e rascunhos
- [x] Listar e gerenciar Pull Requests existentes
- [x] Armazenar credenciais de forma segura
- [x] Código modular, limpo e testável
- [x] Documentação atualizada nesta entrega

---

## 5. Observações Finais

- A arquitetura está preparada para OAuth e outros provedores no futuro
- A separação entre Git local e API remota facilita manutenção e extensões
- Prioridade dada à segurança, modularidade e usabilidade
- Próximos passos: integração com UI e orquestração dos casos de uso

---

**Data:** 10/04/2025
