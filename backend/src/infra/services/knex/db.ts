import { config } from "@/infra/services/knex/knexfile";
import knex from "knex";

export function dbConnection() {
  // console.log(config);
  return knex(config[process.env.NODE_ENV || "development"]);
}

export const db = dbConnection();
