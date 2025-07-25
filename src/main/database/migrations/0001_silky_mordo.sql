ALTER TABLE `agents` ADD `is_active` integer DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `agents` ADD `deactivated_at` integer;--> statement-breakpoint
ALTER TABLE `agents` ADD `deactivated_by` text REFERENCES users(id);--> statement-breakpoint
CREATE INDEX `agents_deactivated_by_idx` ON `agents` (`deactivated_by`);--> statement-breakpoint
CREATE INDEX `agents_is_active_idx` ON `agents` (`is_active`);--> statement-breakpoint
CREATE INDEX `agents_is_active_created_at_idx` ON `agents` (`is_active`,`created_at`);--> statement-breakpoint
ALTER TABLE `llm_providers` ADD `deactivated_at` integer;--> statement-breakpoint
ALTER TABLE `llm_providers` ADD `deactivated_by` text REFERENCES users(id);--> statement-breakpoint
CREATE INDEX `llm_providers_deactivated_by_idx` ON `llm_providers` (`deactivated_by`);--> statement-breakpoint
CREATE INDEX `llm_providers_is_active_created_at_idx` ON `llm_providers` (`is_active`,`created_at`);--> statement-breakpoint
ALTER TABLE `agent_memories` ADD `is_active` integer DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `agent_memories` ADD `deactivated_at` integer;--> statement-breakpoint
ALTER TABLE `agent_memories` ADD `deactivated_by` text REFERENCES users(id);--> statement-breakpoint
CREATE INDEX `agent_memories_deactivated_by_idx` ON `agent_memories` (`deactivated_by`);--> statement-breakpoint
CREATE INDEX `agent_memories_is_active_idx` ON `agent_memories` (`is_active`);--> statement-breakpoint
CREATE INDEX `agent_memories_is_active_created_at_idx` ON `agent_memories` (`is_active`,`created_at`);--> statement-breakpoint
ALTER TABLE `memory_relations` ADD `is_active` integer DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `memory_relations` ADD `deactivated_at` integer;--> statement-breakpoint
ALTER TABLE `memory_relations` ADD `deactivated_by` text REFERENCES users(id);--> statement-breakpoint
CREATE INDEX `memory_relations_deactivated_by_idx` ON `memory_relations` (`deactivated_by`);--> statement-breakpoint
CREATE INDEX `memory_relations_is_active_idx` ON `memory_relations` (`is_active`);--> statement-breakpoint
CREATE INDEX `memory_relations_is_active_created_at_idx` ON `memory_relations` (`is_active`,`created_at`);--> statement-breakpoint
ALTER TABLE `user_sessions` ADD `is_active` integer DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `user_sessions` ADD `deactivated_at` integer;--> statement-breakpoint
ALTER TABLE `user_sessions` ADD `deactivated_by` text REFERENCES users(id);--> statement-breakpoint
CREATE INDEX `user_sessions_deactivated_by_idx` ON `user_sessions` (`deactivated_by`);--> statement-breakpoint
CREATE INDEX `user_sessions_is_active_idx` ON `user_sessions` (`is_active`);--> statement-breakpoint
CREATE INDEX `user_sessions_is_active_created_at_idx` ON `user_sessions` (`is_active`,`created_at`);--> statement-breakpoint
ALTER TABLE `conversation_participants` ADD `is_active` integer DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `conversation_participants` ADD `deactivated_at` integer;--> statement-breakpoint
ALTER TABLE `conversation_participants` ADD `deactivated_by` text REFERENCES users(id);--> statement-breakpoint
CREATE INDEX `conversation_participants_deactivated_by_idx` ON `conversation_participants` (`deactivated_by`);--> statement-breakpoint
CREATE INDEX `conversation_participants_is_active_idx` ON `conversation_participants` (`is_active`);--> statement-breakpoint
CREATE INDEX `conversation_participants_is_active_created_at_idx` ON `conversation_participants` (`is_active`,`created_at`);--> statement-breakpoint
ALTER TABLE `conversations` ADD `is_active` integer DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `conversations` ADD `deactivated_at` integer;--> statement-breakpoint
ALTER TABLE `conversations` ADD `deactivated_by` text REFERENCES users(id);--> statement-breakpoint
CREATE INDEX `conversations_deactivated_by_idx` ON `conversations` (`deactivated_by`);--> statement-breakpoint
CREATE INDEX `conversations_is_active_idx` ON `conversations` (`is_active`);--> statement-breakpoint
CREATE INDEX `conversations_is_active_created_at_idx` ON `conversations` (`is_active`,`created_at`);--> statement-breakpoint
ALTER TABLE `llm_messages` ADD `is_active` integer DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `llm_messages` ADD `deactivated_at` integer;--> statement-breakpoint
ALTER TABLE `llm_messages` ADD `deactivated_by` text REFERENCES users(id);--> statement-breakpoint
CREATE INDEX `llm_messages_deactivated_by_idx` ON `llm_messages` (`deactivated_by`);--> statement-breakpoint
CREATE INDEX `llm_messages_is_active_idx` ON `llm_messages` (`is_active`);--> statement-breakpoint
CREATE INDEX `llm_messages_is_active_created_at_idx` ON `llm_messages` (`is_active`,`created_at`);--> statement-breakpoint
ALTER TABLE `messages` ADD `is_active` integer DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `messages` ADD `deactivated_at` integer;--> statement-breakpoint
ALTER TABLE `messages` ADD `deactivated_by` text REFERENCES users(id);--> statement-breakpoint
CREATE INDEX `messages_deactivated_by_idx` ON `messages` (`deactivated_by`);--> statement-breakpoint
CREATE INDEX `messages_is_active_idx` ON `messages` (`is_active`);--> statement-breakpoint
CREATE INDEX `messages_is_active_created_at_idx` ON `messages` (`is_active`,`created_at`);--> statement-breakpoint
ALTER TABLE `projects` ADD `is_active` integer DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `projects` ADD `deactivated_at` integer;--> statement-breakpoint
ALTER TABLE `projects` ADD `deactivated_by` text REFERENCES users(id);--> statement-breakpoint
CREATE INDEX `projects_owner_id_idx` ON `projects` (`owner_id`);--> statement-breakpoint
CREATE INDEX `projects_status_idx` ON `projects` (`status`);--> statement-breakpoint
CREATE INDEX `projects_deactivated_by_idx` ON `projects` (`deactivated_by`);--> statement-breakpoint
CREATE INDEX `projects_is_active_idx` ON `projects` (`is_active`);--> statement-breakpoint
CREATE INDEX `projects_is_active_created_at_idx` ON `projects` (`is_active`,`created_at`);--> statement-breakpoint
ALTER TABLE `users` ADD `is_active` integer DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `deactivated_at` integer;--> statement-breakpoint
ALTER TABLE `users` ADD `deactivated_by` text REFERENCES users(id);--> statement-breakpoint
CREATE INDEX `users_is_active_idx` ON `users` (`is_active`);--> statement-breakpoint
CREATE INDEX `users_is_active_created_at_idx` ON `users` (`is_active`,`created_at`);--> statement-breakpoint
CREATE INDEX `users_deactivated_by_idx` ON `users` (`deactivated_by`);