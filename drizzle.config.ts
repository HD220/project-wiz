import type { Config } from "drizzle-kit";

export default {
  schema: "./src/main/**/*.schema.ts", //JÁ ESTA CERTO NÃO MEXER
  out: "./src/main/database/migrations",
  dialect: "sqlite",
  dbCredentials: {
    url: "./project-wiz.db",
  },
} satisfies Config;
