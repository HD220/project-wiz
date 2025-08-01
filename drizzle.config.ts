import type { Config } from "drizzle-kit";

export default {
  schema: ["./src/**/*.model.ts"],
  out: "./src/main/database/migrations",
  dialect: "sqlite",
  dbCredentials: {
    url: "./project-wiz.db",
  },
} satisfies Config;
