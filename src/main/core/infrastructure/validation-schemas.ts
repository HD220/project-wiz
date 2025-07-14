/**
 * @fileoverview Validation Schemas
 *
 * Schemas Zod específicos para validação de diferentes tipos de dados
 * no sistema, incluindo email, senhas, arquivos, agentes, etc.
 *
 * @version 1.0.0
 * @since 2024-01-01
 */

import { z } from "zod";

// =============================================================================
// SCHEMAS DE TIPOS BÁSICOS
// =============================================================================

/**
 * Schema para validação de email
 */
export const EmailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Invalid email format")
  .max(254, "Email is too long") // RFC 5321 limit
  .refine((email) => {
    // Verificar se não tem caracteres especiais problemáticos
    const disallowed = /[<>()[\]\\.,;:\s@"]/;
    const localPart = email.split("@")[0];
    return !disallowed.test(localPart);
  }, "Email contains invalid characters")
  .refine((email) => {
    // Verificar se o domínio é válido
    const domain = email.split("@")[1];
    return domain && domain.includes(".") && domain.length > 3;
  }, "Invalid email domain");

/**
 * Schema para validação de senha
 */
export const PasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .max(128, "Password is too long")
  .refine(
    (password) => /[A-Z]/.test(password),
    "Password must contain at least one uppercase letter",
  )
  .refine(
    (password) => /[a-z]/.test(password),
    "Password must contain at least one lowercase letter",
  )
  .refine(
    (password) => /[0-9]/.test(password),
    "Password must contain at least one number",
  )
  .refine(
    (password) => /[^A-Za-z0-9]/.test(password),
    "Password must contain at least one special character",
  )
  .refine(
    (password) => !/(.)\1{2,}/.test(password),
    "Password cannot contain more than 2 consecutive identical characters",
  );

/**
 * Schema para validação de senha forte
 */
export const StrongPasswordSchema = PasswordSchema.refine((password) => {
  // Verificar complexidade adicional
  const hasMultipleSpecialChars =
    (password.match(/[^A-Za-z0-9]/g) || []).length >= 2;
  const hasNoCommonPatterns = !/(123|abc|qwe|asd|zxc|password|admin)/i.test(
    password,
  );
  return hasMultipleSpecialChars && hasNoCommonPatterns;
}, "Password must be stronger (avoid common patterns, use multiple special characters)");

/**
 * Schema para validação de arquivo
 */
export const FileSchema = z
  .object({
    /** Nome do arquivo */
    name: z
      .string()
      .min(1, "File name is required")
      .max(255, "File name is too long"),

    /** Tamanho em bytes */
    size: z
      .number()
      .int()
      .min(0, "File size must be non-negative")
      .max(100 * 1024 * 1024, "File size must be less than 100MB"),

    /** Tipo MIME */
    type: z
      .string()
      .regex(
        /^[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_]*\/[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_.]*$/,
        "Invalid MIME type",
      ),

    /** Data de última modificação */
    lastModified: z
      .number()
      .int()
      .min(0, "Last modified must be a valid timestamp"),

    /** Conteúdo do arquivo (base64 ou buffer) */
    content: z.string().optional(),

    /** Caminho do arquivo */
    path: z.string().optional(),

    /** Hash do arquivo para verificação de integridade */
    hash: z.string().optional(),
  })
  .refine((file) => {
    // Verificar extensão do arquivo
    const allowedExtensions = [
      ".txt",
      ".md",
      ".json",
      ".js",
      ".ts",
      ".py",
      ".java",
      ".cpp",
      ".c",
      ".go",
      ".rs",
    ];
    const extension = file.name.substring(file.name.lastIndexOf("."));
    return allowedExtensions.includes(extension.toLowerCase());
  }, "File type not allowed");

/**
 * Schema para validação de URL
 */
export const URLSchema = z
  .string()
  .url("Invalid URL format")
  .refine((url) => {
    try {
      const urlObj = new URL(url);
      return ["http:", "https:", "ftp:", "ftps:"].includes(urlObj.protocol);
    } catch {
      return false;
    }
  }, "URL protocol not allowed");

/**
 * Schema para validação de UUID
 */
export const UUIDSchema = z.string().uuid("Invalid UUID format");

/**
 * Schema para validação de data
 */
export const DateSchema = z
  .string()
  .datetime("Invalid date format")
  .or(z.date())
  .transform((date) => new Date(date));

/**
 * Schema para validação de slug
 */
export const SlugSchema = z
  .string()
  .min(1, "Slug is required")
  .max(100, "Slug is too long")
  .regex(
    /^[a-z0-9-]+$/,
    "Slug can only contain lowercase letters, numbers, and hyphens",
  )
  .refine(
    (slug) => !slug.startsWith("-") && !slug.endsWith("-"),
    "Slug cannot start or end with a hyphen",
  )
  .refine(
    (slug) => !slug.includes("--"),
    "Slug cannot contain consecutive hyphens",
  );

// =============================================================================
// SCHEMAS DE ENTIDADES DE DOMÍNIO
// =============================================================================

/**
 * Schema para validação de configuração de agente
 */
export const AgentConfigSchema = z.object({
  /** Nome do modelo */
  model: z.string().min(1, "Model name is required"),

  /** Temperatura (criatividade) */
  temperature: z
    .number()
    .min(0, "Temperature must be non-negative")
    .max(2, "Temperature must be <= 2"),

  /** Máximo de tokens */
  maxTokens: z
    .number()
    .int()
    .min(1, "Max tokens must be at least 1")
    .max(100000, "Max tokens too high"),

  /** Top-p para sampling */
  topP: z
    .number()
    .min(0, "Top-p must be non-negative")
    .max(1, "Top-p must be <= 1")
    .optional(),

  /** Penalidade de frequência */
  frequencyPenalty: z
    .number()
    .min(-2, "Frequency penalty too low")
    .max(2, "Frequency penalty too high")
    .optional(),

  /** Penalidade de presença */
  presencePenalty: z
    .number()
    .min(-2, "Presence penalty too low")
    .max(2, "Presence penalty too high")
    .optional(),

  /** Palavras de parada */
  stopWords: z.array(z.string()).max(10, "Too many stop words").optional(),
});

/**
 * Schema para validação de agente
 */
export const AgentSchema = z.object({
  /** ID único do agente */
  id: UUIDSchema,

  /** Nome do agente */
  name: z
    .string()
    .min(1, "Agent name is required")
    .max(100, "Agent name is too long"),

  /** Descrição do agente */
  description: z.string().max(500, "Agent description is too long").optional(),

  /** Slug único do agente */
  slug: SlugSchema,

  /** Tipo do agente */
  type: z.enum(["assistant", "specialist", "reviewer", "analyst"], {
    errorMap: () => ({
      message:
        "Agent type must be one of: assistant, specialist, reviewer, analyst",
    }),
  }),

  /** Status do agente */
  status: z.enum(["active", "inactive", "maintenance", "deprecated"], {
    errorMap: () => ({
      message:
        "Agent status must be one of: active, inactive, maintenance, deprecated",
    }),
  }),

  /** Configuração do agente */
  config: AgentConfigSchema,

  /** Prompt do sistema */
  systemPrompt: z
    .string()
    .min(1, "System prompt is required")
    .max(10000, "System prompt is too long"),

  /** Capabilidades do agente */
  capabilities: z.array(z.string()).max(20, "Too many capabilities"),

  /** Tags do agente */
  tags: z.array(z.string().max(50, "Tag is too long")).max(10, "Too many tags"),

  /** Metadados adicionais */
  metadata: z.record(z.unknown()).optional(),

  /** Data de criação */
  createdAt: DateSchema,

  /** Data de atualização */
  updatedAt: DateSchema,

  /** ID do criador */
  createdBy: UUIDSchema.optional(),
});

/**
 * Schema para validação de projeto
 */
export const ProjectSchema = z.object({
  /** ID único do projeto */
  id: UUIDSchema,

  /** Nome do projeto */
  name: z
    .string()
    .min(1, "Project name is required")
    .max(100, "Project name is too long"),

  /** Descrição do projeto */
  description: z
    .string()
    .max(1000, "Project description is too long")
    .optional(),

  /** Slug único do projeto */
  slug: SlugSchema,

  /** Status do projeto */
  status: z.enum(["active", "archived", "maintenance", "deleted"], {
    errorMap: () => ({
      message:
        "Project status must be one of: active, archived, maintenance, deleted",
    }),
  }),

  /** Tipo do projeto */
  type: z.enum(["web", "mobile", "desktop", "api", "library", "other"], {
    errorMap: () => ({
      message:
        "Project type must be one of: web, mobile, desktop, api, library, other",
    }),
  }),

  /** Linguagem principal */
  primaryLanguage: z
    .string()
    .max(50, "Primary language name is too long")
    .optional(),

  /** Repositório */
  repository: z
    .object({
      /** URL do repositório */
      url: URLSchema,

      /** Branch principal */
      defaultBranch: z
        .string()
        .max(100, "Branch name is too long")
        .default("main"),

      /** Tipo de repositório */
      type: z.enum(["git", "svn", "mercurial"]).default("git"),
    })
    .optional(),

  /** Configurações do projeto */
  settings: z
    .object({
      /** Habilitar auto-save */
      autoSave: z.boolean().default(true),

      /** Habilitar versionamento */
      enableVersioning: z.boolean().default(true),

      /** Habilitar backup */
      enableBackup: z.boolean().default(true),

      /** Configurações de notificação */
      notifications: z
        .object({
          /** Notificar sobre mudanças */
          onChange: z.boolean().default(true),

          /** Notificar sobre erros */
          onError: z.boolean().default(true),

          /** Notificar sobre conclusão */
          onComplete: z.boolean().default(true),
        })
        .optional(),
    })
    .optional(),

  /** Tags do projeto */
  tags: z.array(z.string().max(50, "Tag is too long")).max(10, "Too many tags"),

  /** Metadados adicionais */
  metadata: z.record(z.unknown()).optional(),

  /** Data de criação */
  createdAt: DateSchema,

  /** Data de atualização */
  updatedAt: DateSchema,

  /** ID do criador */
  createdBy: UUIDSchema.optional(),
});

/**
 * Schema para validação de mensagem
 */
export const MessageSchema = z.object({
  /** ID único da mensagem */
  id: UUIDSchema,

  /** Conteúdo da mensagem */
  content: z
    .string()
    .min(1, "Message content is required")
    .max(10000, "Message content is too long"),

  /** Tipo da mensagem */
  type: z.enum(["user", "assistant", "system", "error", "notification"], {
    errorMap: () => ({
      message:
        "Message type must be one of: user, assistant, system, error, notification",
    }),
  }),

  /** Formato do conteúdo */
  format: z.enum(["text", "markdown", "html", "json"]).default("text"),

  /** ID do remetente */
  senderId: UUIDSchema.optional(),

  /** ID do destinatário */
  recipientId: UUIDSchema.optional(),

  /** ID da conversa */
  conversationId: UUIDSchema.optional(),

  /** ID do canal */
  channelId: UUIDSchema.optional(),

  /** Mensagem em resposta a */
  replyToId: UUIDSchema.optional(),

  /** Anexos */
  attachments: z
    .array(
      z.object({
        /** ID do anexo */
        id: UUIDSchema,

        /** Nome do arquivo */
        filename: z.string().max(255, "Filename is too long"),

        /** Tipo MIME */
        mimeType: z.string(),

        /** Tamanho em bytes */
        size: z.number().int().min(0, "File size must be non-negative"),

        /** URL do anexo */
        url: URLSchema.optional(),
      }),
    )
    .max(10, "Too many attachments")
    .optional(),

  /** Metadados da mensagem */
  metadata: z
    .object({
      /** Tokens usados */
      tokens: z.number().int().min(0, "Tokens must be non-negative").optional(),

      /** Modelo usado */
      model: z.string().optional(),

      /** Tempo de processamento */
      processingTime: z
        .number()
        .min(0, "Processing time must be non-negative")
        .optional(),

      /** Custo da mensagem */
      cost: z.number().min(0, "Cost must be non-negative").optional(),
    })
    .optional(),

  /** Status da mensagem */
  status: z
    .enum(["pending", "sent", "delivered", "read", "failed", "deleted"])
    .default("pending"),

  /** Data de criação */
  createdAt: DateSchema,

  /** Data de atualização */
  updatedAt: DateSchema,

  /** Data de leitura */
  readAt: DateSchema.optional(),

  /** Data de exclusão */
  deletedAt: DateSchema.optional(),
});

/**
 * Schema para validação de canal
 */
export const ChannelSchema = z.object({
  /** ID único do canal */
  id: UUIDSchema,

  /** Nome do canal */
  name: z
    .string()
    .min(1, "Channel name is required")
    .max(100, "Channel name is too long"),

  /** Descrição do canal */
  description: z
    .string()
    .max(500, "Channel description is too long")
    .optional(),

  /** Slug único do canal */
  slug: SlugSchema,

  /** Tipo do canal */
  type: z.enum(["public", "private", "direct", "group"], {
    errorMap: () => ({
      message: "Channel type must be one of: public, private, direct, group",
    }),
  }),

  /** Status do canal */
  status: z.enum(["active", "archived", "deleted"]).default("active"),

  /** ID do projeto */
  projectId: UUIDSchema,

  /** Configurações do canal */
  settings: z
    .object({
      /** Permitir anexos */
      allowAttachments: z.boolean().default(true),

      /** Máximo de participantes */
      maxParticipants: z
        .number()
        .int()
        .min(1, "Max participants must be at least 1")
        .max(1000, "Max participants too high")
        .optional(),

      /** Retenção de mensagens em dias */
      messageRetentionDays: z
        .number()
        .int()
        .min(1, "Message retention must be at least 1 day")
        .max(365, "Message retention too long")
        .optional(),

      /** Habilitar histórico */
      enableHistory: z.boolean().default(true),

      /** Habilitar notificações */
      enableNotifications: z.boolean().default(true),
    })
    .optional(),

  /** Tags do canal */
  tags: z.array(z.string().max(50, "Tag is too long")).max(10, "Too many tags"),

  /** Metadados adicionais */
  metadata: z.record(z.unknown()).optional(),

  /** Data de criação */
  createdAt: DateSchema,

  /** Data de atualização */
  updatedAt: DateSchema,

  /** ID do criador */
  createdBy: UUIDSchema.optional(),
});

// =============================================================================
// SCHEMAS DE VALIDAÇÃO DE ENTRADA
// =============================================================================

/**
 * Schema para validação de dados de entrada de formulário
 */
export const FormInputSchema = z.object({
  /** Nome do campo */
  name: z.string().min(1, "Field name is required"),

  /** Valor do campo */
  value: z.unknown(),

  /** Tipo do campo */
  type: z.enum([
    "text",
    "email",
    "password",
    "number",
    "date",
    "select",
    "checkbox",
    "radio",
    "file",
  ]),

  /** Indica se é obrigatório */
  required: z.boolean().default(false),

  /** Validação customizada */
  validation: z
    .object({
      /** Comprimento mínimo */
      minLength: z
        .number()
        .int()
        .min(0, "Min length must be non-negative")
        .optional(),

      /** Comprimento máximo */
      maxLength: z
        .number()
        .int()
        .min(0, "Max length must be non-negative")
        .optional(),

      /** Padrão regex */
      pattern: z.string().optional(),

      /** Valor mínimo */
      min: z.number().optional(),

      /** Valor máximo */
      max: z.number().optional(),

      /** Opções para select */
      options: z.array(z.string()).optional(),
    })
    .optional(),
});

// =============================================================================
// TIPOS INFERIDOS
// =============================================================================

export type Email = z.infer<typeof EmailSchema>;
export type Password = z.infer<typeof PasswordSchema>;
export type StrongPassword = z.infer<typeof StrongPasswordSchema>;
export type FileData = z.infer<typeof FileSchema>;
export type URL = z.infer<typeof URLSchema>;
export type UUID = z.infer<typeof UUIDSchema>;
export type DateValue = z.infer<typeof DateSchema>;
export type Slug = z.infer<typeof SlugSchema>;
export type AgentConfig = z.infer<typeof AgentConfigSchema>;
export type Agent = z.infer<typeof AgentSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type Message = z.infer<typeof MessageSchema>;
export type Channel = z.infer<typeof ChannelSchema>;
export type FormInput = z.infer<typeof FormInputSchema>;

// =============================================================================
// UTILITÁRIOS DE VALIDAÇÃO
// =============================================================================

/**
 * Utilitários para validação de schemas
 */
export const ValidationSchemaUtils = {
  /**
   * Valida email de forma síncrona
   */
  validateEmail: (email: string) => EmailSchema.safeParse(email),

  /**
   * Valida senha de forma síncrona
   */
  validatePassword: (password: string) => PasswordSchema.safeParse(password),

  /**
   * Valida senha forte de forma síncrona
   */
  validateStrongPassword: (password: string) =>
    StrongPasswordSchema.safeParse(password),

  /**
   * Valida UUID de forma síncrona
   */
  validateUUID: (uuid: string) => UUIDSchema.safeParse(uuid),

  /**
   * Valida URL de forma síncrona
   */
  validateURL: (url: string) => URLSchema.safeParse(url),

  /**
   * Valida slug de forma síncrona
   */
  validateSlug: (slug: string) => SlugSchema.safeParse(slug),

  /**
   * Valida arquivo de forma síncrona
   */
  validateFile: (file: unknown) => FileSchema.safeParse(file),

  /**
   * Valida agente de forma síncrona
   */
  validateAgent: (agent: unknown) => AgentSchema.safeParse(agent),

  /**
   * Valida projeto de forma síncrona
   */
  validateProject: (project: unknown) => ProjectSchema.safeParse(project),

  /**
   * Valida mensagem de forma síncrona
   */
  validateMessage: (message: unknown) => MessageSchema.safeParse(message),

  /**
   * Valida canal de forma síncrona
   */
  validateChannel: (channel: unknown) => ChannelSchema.safeParse(channel),
} as const;
