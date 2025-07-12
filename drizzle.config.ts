import type { Config } from "drizzle-kit";

export default {
  schema: [ok"./src/main/modules/**/persistence/schema.ts"],
  out: "./src/main/persistence/migrations",
  dialect: "sqlite",
  dbCredentials: {
    url: "./project-wiz.db",
  },
} satisfies Config;
