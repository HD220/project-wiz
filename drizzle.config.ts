import type { Config } from "drizzle-kit";

export default {
  schema: "./src/main/persistence/schemas/*.schema.ts",
  out: "./src/main/persistence/migrations",
  dialect: "sqlite",
  dbCredentials: {
    url: "./project-wiz.db",
  },
} satisfies Config;
