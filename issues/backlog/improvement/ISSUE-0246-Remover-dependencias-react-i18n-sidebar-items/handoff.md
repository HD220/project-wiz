# Handoff - ISSUE-0246

Acompanhe aqui o progresso, decisões e transferências relacionadas à issue.

- **Status inicial:** Issue criada e aguardando priorização no backlog.

---

**[12/04/2025] Progresso registrado por Code:**

- Realizada análise do arquivo `src/client/lib/sidebar-items.tsx`. O arquivo já continha apenas dados puros e tipos, mas estava com extensão `.tsx`, o que poderia sugerir dependência de React.
- Não havia dependências de React ou de bibliotecas de i18n runtime, apenas uso de chaves de tradução (`labelKey`).
- Para garantir clareza e separação de responsabilidades, o arquivo foi renomeado para `sidebar-items.ts`, mantendo apenas dados puros e tipos.
- O arquivo antigo `.tsx` foi removido do projeto para evitar conflitos de build e garantir que não haja múltiplos arquivos de entrada para o mesmo destino.
- Toda lógica de apresentação e tradução permanece isolada na camada de UI, conforme o escopo da issue.
- O código está em conformidade com os princípios de clean code e clean architecture definidos no projeto.

**Justificativa:**  
A refatoração elimina qualquer ambiguidade sobre dependências de React/i18n, reforça a separação entre dados e apresentação, e previne problemas de build. Não foram realizadas mudanças além do escopo definido na issue.