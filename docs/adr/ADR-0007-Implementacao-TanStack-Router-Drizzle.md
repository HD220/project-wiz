# ADR-0007: Implementação do TanStack Router e Drizzle ORM

## Status
Proposto

## Contexto
O projeto necessita de:
1. Um sistema de roteamento cliente robusto e tipado
2. Uma solução ORM para interação com banco de dados SQLite

## Decisão
Adotar:
- **@tanstack/react-router**: Para roteamento no frontend, oferecendo:
  - Tipagem TypeScript forte
  - Sistema de roteamento declarativo
  - Integração com React 19
  - Suporte a rotas aninhadas e lazy loading

- **Drizzle ORM + sqlite3**: Para acesso a banco de dados, proporcionando:
  - Tipagem TypeScript de primeira classe
  - Sintaxe SQL-like
  - Migrações simples
  - Não requer compilação (mais fácil de instalar)

## Consequências
### Benefícios
- Melhor organização do código frontend com roteamento estruturado
- Segurança de tipos em rotas e parâmetros
- Padronização do acesso a dados
- Facilidade de manutenção de queries SQL

### Custos
- Curva de aprendizado para novas bibliotecas
- Aumento no tamanho do bundle
- Necessidade de configurar migrações para o Drizzle

### Alternativas consideradas
- **React Router**: Menos integração com TypeScript
- **Prisma**: Mais pesado e complexo para uso com SQLite
- **TypeORM**: Menos performático e com tipagem menos robusta