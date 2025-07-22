import type { Config } from "drizzle-kit";

export default {
  schema: "./src/main/features/**/*.model.ts", //JÁ ESTA CERTO NÃO MEXER
  out: "./src/main/database/migrations",
  dialect: "sqlite",
  dbCredentials: {
    url: "./project-wiz.db",
  },
} satisfies Config;
