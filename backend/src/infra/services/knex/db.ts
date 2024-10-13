import { config } from "@/infra/services/knex/knexfile";
import knex from "knex";

export function createConnection() {
  return knex(config[process.env.NODE_ENV || "development"]);
}

declare const globalThis: {
  dbGlobal: ReturnType<typeof createConnection>;
} & typeof global;

export const db = globalThis.dbGlobal ?? createConnection();

globalThis.dbGlobal = db;
