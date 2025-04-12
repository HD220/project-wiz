# ADR-0014: Persistência e Acesso ao Histórico de Conversas com SQLite, Drizzle ORM e IPC Seguro

## Status

- 🟢 **Aceito**

---

## Contexto

A aplicação requer um mecanismo eficiente, seguro e local para armazenar o histórico de conversas entre usuário e assistente, com suporte a múltiplas conversas, exportação e fácil integração com o frontend React.

---

## Decisão

- Utilizar **SQLite** para persistência local, por ser leve, embutido e amplamente suportado.
- Adotar **Drizzle ORM** para abstrair o acesso ao SQLite, fornecendo tipagem Typescript, migrações seguras e consultas expressivas.
- Modelar tabelas `conversations` e `messages` com relacionamento 1:N.
- Implementar o serviço `HistoryService` com interface assíncrona para criar, buscar, deletar, renomear conversas, adicionar mensagens e exportar histórico.
- Expor a API do serviço ao frontend via preload API + IPC seguro, garantindo isolamento do banco.
- Criar hook React `useHistory` para encapsular chamadas à API IPC e facilitar integração com componentes React.

---

## Consequências

**Positivas:**
- Solução simples, segura e eficiente para histórico local.
- Fácil extensão futura (ex: tags, favoritos, anexos).
- Exportação facilitada para backup ou análise.
- Onboarding simplificado para novos desenvolvedores.

**Negativas:**
- Requer implementação e manutenção de handlers IPC e preload API.
- Possível necessidade de migrações futuras para novos requisitos.

---

## Alternativas Consideradas

- **Persistência em arquivos JSON** — simples, mas difícil de escalar, consultar e manter integridade.
- **Outros ORMs (Prisma, TypeORM)** — mais complexos ou pesados para o escopo local.
- **Persistência remota (Firebase, Supabase)** — não atende requisito de funcionamento offline/local.
- **Acesso direto ao SQLite no frontend** — inseguro e difícil de manter.

---

## Links Relacionados

- [SQLite](https://sqlite.org)
- [Drizzle ORM](https://orm.drizzle.team)
- [Electron IPC](https://www.electronjs.org/docs/latest/tutorial/ipc)
- [ISSUE-0071 - Implementar histórico de conversas](../../issues/backlog/feature/ISSUE-0071-Implementar-importacao-historico-conversas/README.md)