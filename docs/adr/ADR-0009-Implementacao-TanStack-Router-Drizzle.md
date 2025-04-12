# ADR-0009: Implementação do TanStack Router e Drizzle ORM

## Status

- 🟢 **Aceito**

---

## Contexto

O projeto necessitava de:
1. Um sistema de roteamento cliente robusto e tipado.
2. Uma solução ORM para interação com banco de dados SQLite.

---

## Decisão

Adotar:
- **@tanstack/react-router** para roteamento no frontend, oferecendo:
  - Tipagem TypeScript forte
  - Sistema de roteamento declarativo
  - Integração com React 19
  - Suporte a rotas aninhadas e lazy loading

- **Drizzle ORM + sqlite3** para acesso a banco de dados, proporcionando:
  - Tipagem TypeScript de primeira classe
  - Sintaxe SQL-like
  - Migrações simples
  - Não requer compilação (mais fácil de instalar)

---

## Consequências

**Positivas:**
- Melhor organização do código frontend com roteamento estruturado
- Segurança de tipos em rotas e parâmetros
- Padronização do acesso a dados
- Facilidade de manutenção de queries SQL

**Negativas:**
- Curva de aprendizado para novas bibliotecas
- Aumento no tamanho do bundle
- Necessidade de configurar migrações para o Drizzle

---

## Alternativas Consideradas

- **React Router** — menos integração com TypeScript.
- **Prisma** — mais pesado e complexo para uso com SQLite.
- **TypeORM** — menos performático e com tipagem menos robusta.

---

## Links Relacionados

- [ISSUE-0069 - Implementação do TanStack Router e Drizzle](../../issues/backlog/improvement/ISSUE-0069-Refatorar-comunicacao-IPC/README.md)