import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";
import path from "path";
import { app } from "electron";

// Configuração do caminho do banco de dados
const dbPath = path.join(app.getPath("userData"), "project-wiz.db");

// Criação da conexão com o SQLite
const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");

// Criação do cliente Drizzle
export const db = drizzle(sqlite, { schema });

// Tipos para uso no projeto
export type Database = typeof db;
export type NewModel = typeof schema.models.$inferInsert;
export type Model = typeof schema.models.$inferSelect;
export type NewActivity = typeof schema.activityLog.$inferInsert;
export type Activity = typeof schema.activityLog.$inferSelect;