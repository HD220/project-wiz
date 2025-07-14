/**
 * @fileoverview Configuration Schemas using Zod
 *
 * Schemas Zod para validação de configurações do sistema com type safety
 * e validação automática de tipos e valores.
 *
 * @version 1.0.0
 * @since 2024-01-01
 */

import { z } from "zod";

/**
 * Schema para configuração base do sistema
 */
export const BaseConfigurationSchema = z.object({
  /** Ambiente de execução */
  environment: z.enum(["development", "production", "test", "staging"], {
    errorMap: () => ({
      message:
        "Environment must be one of: development, production, test, staging",
    }),
  }),

  /** Nível de log */
  logLevel: z.enum(["error", "warn", "info", "debug", "trace"], {
    errorMap: () => ({
      message: "Log level must be one of: error, warn, info, debug, trace",
    }),
  }),

  /** Configurações de debug */
  debug: z.boolean().default(false),

  /** Versão da aplicação */
  version: z
    .string()
    .min(1, "Version cannot be empty")
    .regex(
      /^\d+\.\d+\.\d+(-\w+)?$/,
      "Version must follow semantic versioning (e.g., 1.0.0 or 1.0.0-alpha)",
    ),
});

/**
 * Schema para configuração de banco de dados
 */
export const DatabaseConfigurationSchema = z.object({
  /** Caminho para o arquivo de banco de dados */
  path: z.string().min(1, "Database path cannot be empty"),

  /** Pool de conexões */
  poolSize: z
    .number()
    .int()
    .min(1, "Pool size must be at least 1")
    .max(100, "Pool size cannot exceed 100"),

  /** Timeout de conexão em milissegundos */
  connectionTimeout: z
    .number()
    .int()
    .min(1000, "Connection timeout must be at least 1000ms")
    .max(300000, "Connection timeout cannot exceed 300000ms"),

  /** Habilitar logs de query */
  enableQueryLogging: z.boolean().default(false),
});

/**
 * Schema para configuração de segurança
 */
export const SecurityConfigurationSchema = z.object({
  /** Chave secreta para JWT */
  jwtSecret: z
    .string()
    .min(32, "JWT secret must be at least 32 characters long")
    .refine(
      (value) => value !== "default-secret-change-in-production",
      "JWT secret must not be the default value in production",
    ),

  /** Expiração do token */
  jwtExpiration: z
    .string()
    .regex(
      /^\d+[smhd]$/,
      "JWT expiration must be in format like: 1h, 30m, 7d, 60s",
    ),

  /** Algoritmo de hash para senhas */
  hashRounds: z
    .number()
    .int()
    .min(10, "Hash rounds must be at least 10")
    .max(20, "Hash rounds cannot exceed 20"),

  /** Habilitar HTTPS */
  httpsEnabled: z.boolean().default(false),
});

/**
 * Schema para configuração de LLM
 */
export const LLMConfigurationSchema = z.object({
  /** Provedor padrão */
  defaultProvider: z.enum(["openai", "deepseek", "anthropic", "local"], {
    errorMap: () => ({
      message:
        "Default provider must be one of: openai, deepseek, anthropic, local",
    }),
  }),

  /** Timeout para requests em milissegundos */
  requestTimeout: z
    .number()
    .int()
    .min(5000, "Request timeout must be at least 5000ms")
    .max(300000, "Request timeout cannot exceed 300000ms"),

  /** Máximo de tentativas */
  maxRetries: z
    .number()
    .int()
    .min(1, "Max retries must be at least 1")
    .max(10, "Max retries cannot exceed 10"),

  /** Rate limiting por minuto */
  rateLimitPerMinute: z
    .number()
    .int()
    .min(1, "Rate limit must be at least 1")
    .max(1000, "Rate limit cannot exceed 1000"),
});

/**
 * Schema completo para configuração do sistema
 */
export const SystemConfigurationSchema = BaseConfigurationSchema.extend({
  /** Configurações de banco de dados */
  database: DatabaseConfigurationSchema,

  /** Configurações de segurança */
  security: SecurityConfigurationSchema,

  /** Configurações de LLM */
  llm: LLMConfigurationSchema,
});

/**
 * Schema para configuração de desenvolvimento
 */
export const DevelopmentConfigurationSchema = SystemConfigurationSchema.refine(
  (config) => {
    if (config.environment === "development") {
      return true;
    }
    return false;
  },
  {
    message:
      "Development configuration must have environment set to 'development'",
    path: ["environment"],
  },
);

/**
 * Schema para configuração de produção
 */
export const ProductionConfigurationSchema = SystemConfigurationSchema.refine(
  (config) => {
    if (config.environment === "production") {
      // Validações específicas para produção
      if (config.security.jwtSecret === "default-secret-change-in-production") {
        return false;
      }
      if (config.debug === true) {
        return false;
      }
      return true;
    }
    return false;
  },
  {
    message:
      "Production configuration must have secure settings and debug disabled",
    path: ["security"],
  },
);

/**
 * Schema para configuração de teste
 */
export const TestConfigurationSchema = SystemConfigurationSchema.refine(
  (config) => {
    if (config.environment === "test") {
      return true;
    }
    return false;
  },
  {
    message: "Test configuration must have environment set to 'test'",
    path: ["environment"],
  },
);

/**
 * Schema para validação de variáveis de ambiente
 */
export const EnvironmentVariablesSchema = z
  .object({
    /** Ambiente de execução */
    NODE_ENV: z
      .enum(["development", "production", "test", "staging"])
      .optional(),

    /** Caminho do banco de dados */
    DATABASE_PATH: z.string().optional(),

    /** Chave secreta JWT */
    JWT_SECRET: z.string().min(32).optional(),

    /** Nível de log */
    LOG_LEVEL: z.enum(["error", "warn", "info", "debug", "trace"]).optional(),

    /** Porta da aplicação */
    PORT: z.string().regex(/^\d+$/, "Port must be a number").optional(),

    /** Habilitar debug */
    DEBUG: z.enum(["true", "false"]).optional(),

    /** Provedor LLM padrão */
    DEFAULT_LLM_PROVIDER: z
      .enum(["openai", "deepseek", "anthropic", "local"])
      .optional(),

    /** Chave API OpenAI */
    OPENAI_API_KEY: z.string().optional(),

    /** Chave API DeepSeek */
    DEEPSEEK_API_KEY: z.string().optional(),

    /** URL base para API local */
    LOCAL_API_URL: z.string().url().optional(),
  })
  .passthrough(); // Permite variáveis de ambiente adicionais

/**
 * Schema para opções do ConfigurationManager
 */
export const ConfigurationManagerOptionsSchema = z.object({
  /** Arquivo de configuração */
  configFile: z.string().optional(),

  /** Diretório de configuração */
  configDir: z.string().optional(),

  /** Ambiente específico */
  environment: z
    .enum(["development", "production", "test", "staging"])
    .optional(),

  /** Habilitar hot reload */
  hotReload: z.boolean().optional(),

  /** Validação estrita */
  strictValidation: z.boolean().optional(),
});

/**
 * Schema para resultado de carregamento de configuração
 */
export const ConfigurationLoadResultSchema = z.object({
  /** Configuração carregada */
  config: SystemConfigurationSchema,

  /** Fonte da configuração */
  source: z.string().min(1, "Source cannot be empty"),

  /** Timestamp do carregamento */
  loadedAt: z.date(),

  /** Indicador de sucesso */
  success: z.boolean(),

  /** Erros encontrados */
  errors: z.array(z.string()).optional(),
});

/**
 * Inferência de tipos TypeScript dos schemas
 */
export type BaseConfiguration = z.infer<typeof BaseConfigurationSchema>;
export type DatabaseConfiguration = z.infer<typeof DatabaseConfigurationSchema>;
export type SecurityConfiguration = z.infer<typeof SecurityConfigurationSchema>;
export type LLMConfiguration = z.infer<typeof LLMConfigurationSchema>;
export type SystemConfiguration = z.infer<typeof SystemConfigurationSchema>;
export type DevelopmentConfiguration = z.infer<
  typeof DevelopmentConfigurationSchema
>;
export type ProductionConfiguration = z.infer<
  typeof ProductionConfigurationSchema
>;
export type TestConfiguration = z.infer<typeof TestConfigurationSchema>;
export type EnvironmentVariables = z.infer<typeof EnvironmentVariablesSchema>;
export type ConfigurationManagerOptions = z.infer<
  typeof ConfigurationManagerOptionsSchema
>;
export type ConfigurationLoadResult = z.infer<
  typeof ConfigurationLoadResultSchema
>;

/**
 * Utilitários para validação de configuração
 */
export const ConfigurationSchemaUtils = {
  /**
   * Valida configuração para ambiente específico
   *
   * @param config - Configuração a ser validada
   * @param environment - Ambiente alvo
   * @returns Resultado da validação
   */
  validateForEnvironment(config: unknown, environment: string) {
    switch (environment) {
      case "development":
        return DevelopmentConfigurationSchema.safeParse(config);
      case "production":
        return ProductionConfigurationSchema.safeParse(config);
      case "test":
        return TestConfigurationSchema.safeParse(config);
      default:
        return SystemConfigurationSchema.safeParse(config);
    }
  },

  /**
   * Valida variáveis de ambiente
   *
   * @param env - Variáveis de ambiente
   * @returns Resultado da validação
   */
  validateEnvironmentVariables(env: Record<string, string | undefined>) {
    return EnvironmentVariablesSchema.safeParse(env);
  },

  /**
   * Cria configuração padrão para ambiente
   *
   * @param environment - Ambiente
   * @returns Configuração padrão
   */
  createDefaultConfigForEnvironment(environment: string): SystemConfiguration {
    const baseConfig: SystemConfiguration = {
      environment: environment as any,
      logLevel: environment === "production" ? "info" : "debug",
      debug: environment !== "production",
      version: "1.0.0",
      database: {
        path: environment === "test" ? ":memory:" : "./project-wiz.db",
        poolSize: 10,
        connectionTimeout: 30000,
        enableQueryLogging: environment === "development",
      },
      security: {
        jwtSecret:
          environment === "production"
            ? "MUST_BE_CHANGED_IN_PRODUCTION"
            : "development-secret-key-min-32-chars",
        jwtExpiration: "24h",
        hashRounds: environment === "production" ? 14 : 12,
        httpsEnabled: environment === "production",
      },
      llm: {
        defaultProvider: "openai",
        requestTimeout: 30000,
        maxRetries: 3,
        rateLimitPerMinute: environment === "production" ? 60 : 100,
      },
    };

    return baseConfig;
  },

  /**
   * Mescla configurações com validação
   *
   * @param base - Configuração base
   * @param override - Configuração sobrescrita
   * @returns Configuração mesclada e validada
   */
  mergeConfigurations(
    base: SystemConfiguration,
    override: Partial<SystemConfiguration>,
  ): SystemConfiguration {
    const merged = {
      ...base,
      ...override,
      database: {
        ...base.database,
        ...override.database,
      },
      security: {
        ...base.security,
        ...override.security,
      },
      llm: {
        ...base.llm,
        ...override.llm,
      },
    };

    const result = SystemConfigurationSchema.safeParse(merged);
    if (!result.success) {
      throw new Error(`Configuration merge failed: ${result.error.message}`);
    }

    return result.data;
  },
} as const;
