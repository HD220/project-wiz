# Integração com GitHub

Este documento descreve a integração do projeto com o GitHub, incluindo configuração do token, funcionamento da autenticação, funcionalidades disponíveis, limitações e exemplos de uso.

---

## 1. Configuração do Personal Access Token (PAT)

### Como gerar um PAT no GitHub

1. Acesse [https://github.com/settings/tokens](https://github.com/settings/tokens).
2. Clique em **"Generate new token"**.
3. Dê um nome descritivo para o token.
4. Defina a validade (recomendado: limitada).
5. Selecione os escopos necessários (ver abaixo).
6. Gere o token e **copie-o** (ele só será exibido uma vez).

### Escopos recomendados

- `repo`: acesso completo a repositórios privados e públicos (necessário para criar PRs).
- `user`: acesso a informações básicas do usuário.

> **Importante:** O token deve começar com `ghp_` para ser aceito pelo sistema.

### Como inserir e gerenciar o PAT na interface do app

- A interface do aplicativo permite inserir o token manualmente.
- O token é validado localmente (deve começar com `ghp_`).
- É possível remover ou atualizar o token a qualquer momento.

### Onde o PAT é armazenado

- O token é salvo **localmente** e de forma **segura** usando a biblioteca [keytar](https://github.com/atom/node-keytar).
- O armazenamento é feito no serviço `project-wiz-github` com a conta `default`.
- O token **não é salvo em texto plano** nem enviado para servidores externos.

---

## 2. Funcionamento da autenticação

### Como o PAT é utilizado

- O token é carregado pelo backend e passado para o serviço `GithubService`.
- O `GithubService` usa a biblioteca `octokit` para autenticar as requisições.
- O token pode ser definido ou removido dinamicamente via método `setToken(token)`.

### Modos de operação

- **Modo autenticado:** quando um PAT válido está configurado, permite operações autenticadas (ex: criar PRs, acessar repositórios privados).
- **Modo anônimo:** sem token, apenas operações públicas são permitidas (ex: buscar issues públicas).

### Segurança e privacidade

- O token nunca é exposto no frontend ou logs.
- O armazenamento via keytar garante proteção no sistema operacional.
- Recomenda-se **não compartilhar** o token e revogá-lo em caso de suspeita de vazamento.

---

## 3. Funcionalidades implementadas

### Buscar issues

- Permite buscar uma issue específica por número, dono e repositório.
- Suporta modo autenticado ou anônimo.

### Criar Pull Requests

- Cria um PR entre duas branches existentes.
- Parâmetros:
  - `owner`: dono do repositório
  - `repo`: nome do repositório
  - `title`: título do PR
  - `head`: branch de origem
  - `base`: branch de destino
  - `body`: descrição opcional
- Fluxo:
  1. Define o token (se disponível).
  2. Envia a requisição via API REST.
  3. Retorna dados do PR criado ou mensagens de erro detalhadas.

### Limitações atuais

- **Sem OAuth:** apenas Personal Access Token é suportado.
- **Sem webhooks:** não há integração para eventos automáticos.
- **Sem suporte a reviewers ou rascunhos** na criação de PRs (planejado).

---

## 4. Futuras melhorias possíveis

- Suporte a **reviewers** e **rascunhos** na criação de Pull Requests.
- Análise avançada e listagem de issues.
- Integração com **webhooks** para notificações e automações.
- Implementar fluxo OAuth para facilitar a autenticação.

---

## 5. Exemplos de uso

### Criar um Pull Request via serviço

```typescript
const github = new GithubService();
github.setToken("ghp_seu_token_aqui");

const pr = await github.createPullRequest(
  "usuario",
  "repositorio",
  "Título do PR",
  "feature-branch",
  "main",
  "Descrição opcional do PR"
);

console.log(pr);
```

### Verificar status da autenticação

```typescript
const hasToken = await hasToken();
if (hasToken) {
  console.log("Modo autenticado");
} else {
  console.log("Modo anônimo");
}
```

---

**Última atualização:** 09/04/2025