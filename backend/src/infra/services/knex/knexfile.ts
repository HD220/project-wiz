import type { Knex } from "knex";
import path from "path";

// Update with your config settings.

export const config: { [key: string]: Knex.Config } = {
  development: {
    client: "sqlite3",
    connection: {
      filename: path.resolve(__dirname, "./dev.sqlite3"),
    },
    migrations: {
      tableName: "migrations",
      extension: "ts",
      directory: path.resolve(__dirname, "./migrations"),
    },
    compileSqlOnError: true,
    useNullAsDefault: true,
    log: {
      warn(message) {
        console.warn(message);
      },
      error(message) {
        console.error(message);
      },
      deprecate(message) {
        console.warn(message);
      },
      debug(message) {
        console.log(message);
      },
      enableColors: true,
    },
    seeds: {
      directory: path.resolve(__dirname, "./seeds"),
    },
  },

  staging: {
    client: "sqlite3",
    connection: {
      filename: path.resolve(__dirname, "/stag.sqlite3"),
    },
    migrations: {
      tableName: "migrations",
      extension: "ts",
      directory: path.resolve(__dirname, "./migrations"),
    },
    compileSqlOnError: true,
    useNullAsDefault: true,
    log: {
      warn(message) {
        console.warn(message);
      },
      error(message) {
        console.error(message);
      },
      deprecate(message) {
        console.warn(message);
      },
      debug(message) {
        console.log(message);
      },
      enableColors: true,
    },
    seeds: {
      directory: path.resolve(__dirname, "./seeds"),
    },
  },

  production: {
    client: "sqlite3",
    connection: {
      filename: path.resolve(__dirname, "/prod.sqlite3"),
    },
    migrations: {
      tableName: "migrations",
      extension: "ts",
      directory: path.resolve(__dirname, "./migrations"),
    },
    compileSqlOnError: false,
    log: {
      warn(message) {
        console.warn(message);
      },
      error(message) {
        console.error(message);
      },
      deprecate(message) {
        console.warn(message);
      },
      debug(message) {
        console.log(message);
      },
      enableColors: true,
    },
    seeds: {
      directory: path.resolve(__dirname, "./seeds"),
    },
  },
};

export default config;
