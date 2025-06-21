import type { Config } from 'drizzle-kit';

export default {
  schema: './core/domain/schemas.ts', // Ajustado para apontar para core/domain
  out: './infrastructure/database/migrations', // Ajustado para infrastructure/database
  dialect: 'sqlite',
  dbCredentials: {
    url: './infrastructure/database/sqlite.db', // Ajustado para infrastructure/database
  },
  verbose: true,
  strict: true,
} satisfies Config;
