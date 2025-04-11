# ISSUE-0152 - Implementar CSP, Sandbox e Meta Tags de Segurança

## Contexto e Diagnóstico
Atualmente, o projeto não implementa políticas de segurança no front-end, como Content Security Policy (CSP), sandboxing para iframes e meta tags que reforcem a proteção contra ataques XSS, clickjacking e vazamento de dados.  
Isso representa um risco elevado, especialmente por ser uma aplicação Electron que manipula dados sensíveis e integra múltiplos serviços.

## Justificativa
Mitigar vulnerabilidades comuns em aplicações web e Electron, protegendo contra injeção de código malicioso, controle de navegação e exposição de dados confidenciais.

## Recomendações Técnicas
- Definir uma política CSP restritiva, bloqueando scripts inline e domínios não confiáveis
- Ativar sandboxing em iframes e janelas externas
- Adicionar meta tags de segurança:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY` ou `SAMEORIGIN`
  - `Referrer-Policy: no-referrer`
  - `Permissions-Policy` para limitar APIs sensíveis
- Documentar as configurações aplicadas e testar impacto na aplicação
- Validar que as restrições não quebram funcionalidades essenciais

## Critérios de Aceitação
- CSP configurada e validada sem quebrar funcionalidades
- Sandbox ativo onde aplicável
- Meta tags presentes em todas as páginas
- Documentação das políticas aplicadas
- Testes de segurança automatizados cobrindo as proteções

## Riscos e Dependências
- Possível quebra de funcionalidades devido à restrição CSP
- Dependência de ajustes no build Electron para injetar headers e meta tags
- Relacionada à issue de auditoria de dependências (ISSUE-0153)
- Relacionada à unificação do build Electron (ISSUE-0154)

## Status
Backlog - Security