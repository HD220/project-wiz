import path from "path";

/**
 * Database Configuration
 * Centralized database settings used by both main and worker processes
 */
export interface DatabaseConfig {
  dbPath: string;
  enableWal: boolean;
  enableForeignKeys: boolean;
}

/**
 * Logger Configuration
 * Centralized logger settings used by both main and worker processes
 */
export interface LoggerConfig {
  level: string;
  prettyPrint: boolean;
  isProduction: boolean;
}

/**
 * Environment Configuration
 * Centralized environment variable handling
 */
export interface EnvironmentConfig {
  nodeEnv: string;
  dbFileName: string;
  isProduction: boolean;
  isDevelopment: boolean;
}

/**
 * Get environment configuration
 */
export function getEnvironmentConfig(): EnvironmentConfig {
  const nodeEnv = process.env["NODE_ENV"] || "development";
  const isProduction = nodeEnv === "production";
  const isDevelopment = !isProduction;

  return {
    nodeEnv,
    dbFileName: process.env["DB_FILE_NAME"] || "./project-wiz.db",
    isProduction,
    isDevelopment,
  };
}

/**
 * Get database configuration
 */
export function getDatabaseConfig(): DatabaseConfig {
  const env = getEnvironmentConfig();
  const dbPath = path.resolve(env.dbFileName);

  return {
    dbPath,
    enableWal: true,
    enableForeignKeys: true,
  };
}

/**
 * Get logger configuration
 */
export function getLoggerConfig(): LoggerConfig {
  const env = getEnvironmentConfig();

  return {
    level: env.isProduction ? "info" : "debug",
    prettyPrint: env.isDevelopment,
    isProduction: env.isProduction,
  };
}
