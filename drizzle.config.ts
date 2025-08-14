import type { Config } from "drizzle-kit";

export default {
  schema: ["./src/main/schemas/*.schema.ts"],
  out: "./migrations",
  dialect: "sqlite",
  dbCredentials: {
    url: "./project-wiz.db",
  },
} satisfies Config;
