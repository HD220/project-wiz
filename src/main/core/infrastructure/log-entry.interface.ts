import { LogLevel } from "./log-level.enum";

/**
 * Estrutura de uma entrada de log baseada no formato Pino.js
 *
 * Esta interface define a estrutura padrão de uma entrada de log
 * seguindo as convenções do Pino.js para máxima compatibilidade.
 *
 * @example
 * ```typescript
 * const logEntry: LogEntry = {
 *   time: 1703961600000,
 *   level: LogLevel.INFO,
 *   pid: 12345,
 *   hostname: 'localhost',
 *   msg: 'Operação executada com sucesso',
 *   context: {
 *     module: 'user-service',
 *     operation: 'createUser',
 *     userId: 'user-123'
 *   }
 * };
 * ```
 */
export interface LogEntry {
  /** Timestamp da entrada de log (Unix timestamp em milissegundos) */
  time: number;

  /** Nível de log numérico (compatível com Pino) */
  level: LogLevel;

  /** ID do processo */
  pid: number;

  /** Nome do host/máquina */
  hostname: string;

  /** Mensagem principal do log */
  msg: string;

  /** Contexto adicional do log */
  context?: LogContext;

  /** Metadados adicionais */
  metadata?: Record<string, unknown>;

  /** Informações de erro (se aplicável) */
  error?: LogError;

  /** ID de correlação para rastreamento */
  correlationId?: string;

  /** ID da requisição para rastreamento */
  requestId?: string;

  /** Duração da operação em milissegundos */
  duration?: number;
}

/**
 * Contexto do log contendo informações sobre a origem
 */
export interface LogContext {
  /** Nome do módulo/serviço */
  module?: string;

  /** Nome da operação/método */
  operation?: string;

  /** Nome do arquivo de origem */
  file?: string;

  /** Linha do arquivo de origem */
  line?: number;

  /** Nome da função/método */
  function?: string;

  /** Nome da classe (se aplicável) */
  class?: string;

  /** Informações da requisição HTTP */
  request?: {
    method: string;
    url: string;
    headers?: Record<string, string>;
    body?: unknown;
  };

  /** Informações da resposta HTTP */
  response?: {
    statusCode: number;
    headers?: Record<string, string>;
    body?: unknown;
  };

  /** ID do usuário (se aplicável) */
  userId?: string;

  /** ID da sessão (se aplicável) */
  sessionId?: string;

  /** ID da requisição para rastreamento */
  requestId?: string;

  /** Nome da aplicação */
  app?: string;

  /** Ambiente */
  env?: string;

  /** Tipo de contexto */
  type?: string;

  /** Permitir propriedades adicionais */
  [key: string]: unknown;
}

/**
 * Informações de erro no log
 */
export interface LogError {
  /** Mensagem do erro */
  message: string;

  /** Nome/tipo do erro */
  name: string;

  /** Stack trace do erro */
  stack?: string;

  /** Código do erro */
  code?: string | number;

  /** Causa do erro */
  cause?: unknown;

  /** Detalhes adicionais do erro */
  details?: Record<string, unknown>;
}

/**
 * Configuração de uma entrada de log
 */
export interface LogEntryConfig {
  /** Nível mínimo de log */
  level: LogLevel;

  /** Formato da mensagem */
  messageFormat?: "json" | "text";

  /** Incluir stack trace em erros */
  includeStackTrace?: boolean;

  /** Incluir contexto completo */
  includeContext?: boolean;

  /** Campos a serem ocultados por segurança */
  redactFields?: string[];

  /** Tamanho máximo da mensagem */
  maxMessageSize?: number;
}

/**
 * Entrada de log serializada para transporte
 */
export interface SerializedLogEntry {
  /** Timestamp em formato ISO */
  timestamp: string;

  /** Nível como string */
  level: string;

  /** Mensagem */
  message: string;

  /** Dados serializados */
  data?: string;

  /** Contexto serializado */
  context?: string;

  /** Erro serializado */
  error?: string;
}
