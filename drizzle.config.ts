import type { Config } from "drizzle-kit";

export default {
  schema: "./src/main/database/schema-consolidated.ts",
  out: "./src/main/database/migrations",
  dialect: "sqlite",
  dbCredentials: {
    url: "./project-wiz.db",
  },
} satisfies Config;
