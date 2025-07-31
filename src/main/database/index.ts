// Export database connection
export { db, getDatabase } from "./connection";
export type { DatabaseType } from "./connection";

// Export all database tables and schemas

// User domain
export * from "@/main/features/user/user.model";

// Auth domain
export * from "@/main/features/auth/auth.model";

// Project domain
export * from "@/main/features/project/project.model";
export * from "@/main/features/project/project-channel.model";

// DM domain
export * from "@/main/features/dm/dm-conversation.model";

// Message domain (polymorphic)
export * from "@/main/features/message/message.model";

// Agent domain
export * from "@/main/features/agent/agent.model";

// LLM Provider domain
export * from "@/main/features/llm-provider/llm-provider.model";

// LLM Jobs domain (autonomous worker queue) - removed, now handled by worker process
