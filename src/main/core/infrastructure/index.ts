/**
 * @fileoverview Exportações centralizadas do sistema de infrastructure
 *
 * Este arquivo centraliza todas as exportações do sistema de infrastructure,
 * incluindo logging, transports, configuração, validação e utilitários relacionados.
 *
 * @version 1.0.0
 * @since 2024-01-01
 */

// =============================================================================
// LOGGING SYSTEM
// =============================================================================

// Logging Core
export { Logger, LoggerConfig } from "./logger";
export { LoggerFactory, LoggerFactoryConfig } from "./logger-factory";

// Log Levels
export {
  LogLevel,
  LOG_LEVEL_NAMES,
  LOG_LEVEL_VALUES,
  LogLevelString,
} from "./log-level.enum";

// Log Entry
export {
  LogEntry,
  LogContext,
  LogError,
  LogEntryConfig,
  SerializedLogEntry,
} from "./log-entry.interface";

// Transports
export {
  LogTransport,
  LogTransportConfig,
  ConsoleTransportConfig,
  FileTransportConfig,
  NetworkTransportConfig,
  TransportStats,
  StatefulLogTransport,
} from "./log-transport.interface";

// Transport Implementations
export { ConsoleTransport } from "./console-transport";
export { FileTransport } from "./file-transport";

// =============================================================================
// CONFIGURATION SYSTEM
// =============================================================================

// Configuration Manager
export {
  ConfigurationManager,
  BaseConfiguration,
  DatabaseConfiguration,
  SecurityConfiguration,
  LLMConfiguration,
  SystemConfiguration,
  ConfigurationManagerOptions,
  ConfigurationChangeListener,
  ConfigurationLoadResult,
} from "./configuration-manager";

// Configuration Schemas
export {
  BaseConfigurationSchema,
  DatabaseConfigurationSchema,
  SecurityConfigurationSchema,
  LLMConfigurationSchema,
  SystemConfigurationSchema,
  DevelopmentConfigurationSchema,
  ProductionConfigurationSchema,
  TestConfigurationSchema,
  EnvironmentVariablesSchema,
  ConfigurationManagerOptionsSchema,
  ConfigurationLoadResultSchema,
  ConfigurationSchemaUtils,
} from "./configuration-schema";

// Configuration Validator
export {
  ConfigurationValidator,
  ConfigurationValidationResult,
  ValidationOptions,
  ValidationRule as ConfigValidationRule,
  ValidationRuleResult as ConfigValidationRuleResult,
  ValidationContext as ConfigValidationContext,
} from "./configuration-validator";

// =============================================================================
// ENVIRONMENT MANAGEMENT
// =============================================================================

// Environment Manager
export {
  EnvironmentManager,
  EnvironmentType,
  EnvironmentInfo,
  EnvironmentManagerOptions,
  EnvironmentLoadResult,
  EnvironmentSpecificConfig,
} from "./environment-manager";

// =============================================================================
// VALIDATION SYSTEM
// =============================================================================

// Validation Service
export {
  ValidationService,
  ValidationResult,
  ValidationOptions as ValidationServiceOptions,
  ValidationCacheConfig,
  CustomValidator,
  ValidationStats,
} from "./validation-service";

// Validation Rules
export {
  ValidationRule,
  ValidationRuleSeverity,
  ValidationRuleContext,
  ValidationRuleResult,
  ValidationRuleConfig,
  ValidationRuleCondition,
  ValidationRuleExecutor,
  ValidationRuleStats,
} from "./validation-rule";

// Validation Results
export {
  BaseValidationResult,
  ValidationResult as ValidationResultType,
  FieldValidationResult,
  SchemaValidationResult,
  ComposedValidationResult,
  AsyncValidationResult,
  BatchValidationResult,
  ConditionalValidationResult,
  PerformanceValidationResult,
  CustomRuleValidationResult,
  ValidationSummary,
  ValidationConfig,
  ValidationMetrics,
  ValidationResultUtils,
} from "./validation-result";

// Schema Validator
export {
  SchemaValidator,
  SchemaValidatorConfig,
  SchemaInfo,
  SchemaValidationContext,
  SchemaValidationResult as SchemaValidationResultType,
  SchemaValidatorStats,
} from "./schema-validator";

// Validation Schemas
export {
  EmailSchema,
  PasswordSchema,
  StrongPasswordSchema,
  FileSchema,
  URLSchema,
  UUIDSchema,
  DateSchema,
  SlugSchema,
  AgentConfigSchema,
  AgentSchema,
  ProjectSchema,
  MessageSchema,
  ChannelSchema,
  FormInputSchema,
  ValidationSchemaUtils,
} from "./validation-schemas";

// Schema Types
export type {
  Email,
  Password,
  StrongPassword,
  FileData,
  URL,
  UUID,
  DateValue,
  Slug,
  AgentConfig,
  Agent,
  Project,
  Message,
  Channel,
  FormInput,
} from "./validation-schemas";

// =============================================================================
// EVENT SYSTEM AND MESSAGING
// =============================================================================

// Event Bus
export {
  EventBus,
  IEvent,
  EventHandler,
  EventSubscription,
  EventDispatchResult,
  EventBusOptions,
} from "./event-bus";

// Event Dispatcher
export {
  EventDispatcher,
  DispatchStrategy,
  DispatchOptions,
  DispatchResult,
} from "./event-dispatcher";

// Mediator Pattern
export {
  Mediator,
  IRequest,
  INotification,
  IRequestHandler,
  INotificationHandler,
  IPipelineBehavior,
  MediatorOptions,
  RequestContext,
} from "./mediator";

// Pipeline
export {
  Pipeline,
  IPipelineStep,
  PipelineContext,
  PipelineResult,
  PipelineOptions,
  PipelineBehaviors,
} from "./pipeline";

// Domain Events
export {
  DomainEventBus,
  DomainEventPublisher,
  DomainEventAdapter,
} from "./domain-event-publisher";

// Event Store
export {
  InMemoryEventStore,
  EventStoreEntry,
  EventStoreOptions,
} from "./event-store";

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

// Tipos utilitários
export type {
  LoggerConfig as ILoggerConfig,
  LoggerFactoryConfig as ILoggerFactoryConfig,
};

/**
 * Utilitário para criar logger padrão de desenvolvimento
 */
export function createDevelopmentLogger(module: string) {
  const factory = new LoggerFactory(LoggerFactory.createDevelopmentConfig());
  return factory.createLogger(module);
}

/**
 * Utilitário para criar logger padrão de produção
 */
export function createProductionLogger(module: string, logPath?: string) {
  const factory = new LoggerFactory(
    LoggerFactory.createProductionConfig(logPath),
  );
  return factory.createLogger(module);
}

/**
 * Utilitário para criar logger baseado no ambiente
 */
export function createEnvironmentLogger(module: string, env?: string) {
  const environment = env || process.env.NODE_ENV || "development";

  if (environment === "production") {
    return createProductionLogger(module);
  }

  return createDevelopmentLogger(module);
}

/**
 * Utilitário para criar configuração completa
 */
export async function createSystemConfiguration(
  options?: Partial<ConfigurationManagerOptions>,
): Promise<SystemConfiguration> {
  const configManager = new ConfigurationManager(options);
  const environmentManager = new EnvironmentManager();

  // Detectar ambiente
  const envInfo = environmentManager.detectEnvironment();

  // Carregar variáveis de ambiente
  await environmentManager.loadEnvironmentVariables();

  // Carregar configuração
  const config = await configManager.load();

  return config;
}

/**
 * Utilitário para criar validador completo
 */
export function createValidationService(
  cacheConfig?: Partial<ValidationCacheConfig>,
): ValidationService {
  const validationService = new ValidationService(cacheConfig);

  // Adicionar validadores customizados padrão
  validationService.addCustomValidator({
    name: "email",
    description: "Email validation",
    schema: EmailSchema,
  });

  validationService.addCustomValidator({
    name: "password",
    description: "Password validation",
    schema: PasswordSchema,
  });

  validationService.addCustomValidator({
    name: "strong-password",
    description: "Strong password validation",
    schema: StrongPasswordSchema,
  });

  validationService.addCustomValidator({
    name: "uuid",
    description: "UUID validation",
    schema: UUIDSchema,
  });

  validationService.addCustomValidator({
    name: "url",
    description: "URL validation",
    schema: URLSchema,
  });

  return validationService;
}

/**
 * Utilitário para criar schema validator completo
 */
export function createSchemaValidator(
  config?: Partial<SchemaValidatorConfig>,
): SchemaValidator {
  const schemaValidator = new SchemaValidator(config);

  // Registrar schemas padrão
  schemaValidator.registerSchema("email", EmailSchema);
  schemaValidator.registerSchema("password", PasswordSchema);
  schemaValidator.registerSchema("strong-password", StrongPasswordSchema);
  schemaValidator.registerSchema("file", FileSchema);
  schemaValidator.registerSchema("url", URLSchema);
  schemaValidator.registerSchema("uuid", UUIDSchema);
  schemaValidator.registerSchema("date", DateSchema);
  schemaValidator.registerSchema("slug", SlugSchema);
  schemaValidator.registerSchema("agent", AgentSchema);
  schemaValidator.registerSchema("project", ProjectSchema);
  schemaValidator.registerSchema("message", MessageSchema);
  schemaValidator.registerSchema("channel", ChannelSchema);

  return schemaValidator;
}

/**
 * Utilitário para criar sistema completo de configuração e validação
 */
export async function createInfrastructureSystem(
  configOptions?: Partial<ConfigurationManagerOptions>,
  validationCacheConfig?: Partial<ValidationCacheConfig>,
  schemaValidatorConfig?: Partial<SchemaValidatorConfig>,
) {
  // Criar configuração do sistema
  const configuration = await createSystemConfiguration(configOptions);

  // Criar serviços de validação
  const validationService = createValidationService(validationCacheConfig);
  const schemaValidator = createSchemaValidator(schemaValidatorConfig);

  // Criar logger baseado na configuração
  const logger = createEnvironmentLogger(
    "Infrastructure",
    configuration.environment,
  );

  // Criar validador de configuração
  const configValidator = new ConfigurationValidator();

  // Criar gerenciador de ambiente
  const environmentManager = new EnvironmentManager();

  logger.info("Infrastructure system initialized", {
    environment: configuration.environment,
    logLevel: configuration.logLevel,
    debug: configuration.debug,
  });

  return {
    configuration,
    validationService,
    schemaValidator,
    configValidator,
    environmentManager,
    logger,
  };
}
