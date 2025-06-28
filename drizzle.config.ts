import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./src_refactored/infrastructure/persistence/drizzle/migrations",
  schema: "./src_refactored/infrastructure/persistence/drizzle/schema/index.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.DB_FILE_NAME!,
  },
});
