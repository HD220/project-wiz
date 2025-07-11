import type { Config } from "drizzle-kit";

export default {
  schema: [
    "./src/main/persistence/schema.ts",
    "./src/main/modules/direct-messages/persistence/schema.ts",
    "./src/main/modules/persona-management/persistence/schema.ts",
    "./src/main/modules/user-settings/persistence/schema.ts",
    "./src/main/modules/llm-integration/persistence/schema.ts",
    "./src/main/modules/project-management/persistence/schema.ts",
    "./src/main/modules/task-management/persistence/schema.ts",
    "./src/main/modules/communication/persistence/schema.ts",
  ],
  out: "./src/main/persistence/migrations",
  dialect: "sqlite",
  dbCredentials: {
    url: "./project-wiz.db",
  },
} satisfies Config;
