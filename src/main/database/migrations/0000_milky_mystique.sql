CREATE TABLE `agents` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`name` text NOT NULL,
	`role` text NOT NULL,
	`backstory` text NOT NULL,
	`goal` text NOT NULL,
	`system_prompt` text NOT NULL,
	`status` text DEFAULT 'inactive' NOT NULL,
	`model_config` text NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updated_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`provider_id`) REFERENCES `llm_providers`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `agents_user_id_idx` ON `agents` (`user_id`);--> statement-breakpoint
CREATE INDEX `agents_provider_id_idx` ON `agents` (`provider_id`);--> statement-breakpoint
CREATE INDEX `agents_status_idx` ON `agents` (`status`);--> statement-breakpoint
CREATE TABLE `llm_providers` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`api_key` text NOT NULL,
	`base_url` text,
	`default_model` text DEFAULT 'gpt-3.5-turbo' NOT NULL,
	`is_default` integer DEFAULT false NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updated_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `llm_providers_user_id_idx` ON `llm_providers` (`user_id`);--> statement-breakpoint
CREATE INDEX `llm_providers_type_idx` ON `llm_providers` (`type`);--> statement-breakpoint
CREATE INDEX `llm_providers_is_default_idx` ON `llm_providers` (`is_default`);--> statement-breakpoint
CREATE INDEX `llm_providers_is_active_idx` ON `llm_providers` (`is_active`);--> statement-breakpoint
CREATE TABLE `agent_memories` (
	`id` text PRIMARY KEY NOT NULL,
	`agent_id` text NOT NULL,
	`user_id` text NOT NULL,
	`conversation_id` text,
	`content` text NOT NULL,
	`summary` text,
	`type` text DEFAULT 'conversation' NOT NULL,
	`importance` text DEFAULT 'medium' NOT NULL,
	`importance_score` real DEFAULT 0.5 NOT NULL,
	`access_count` integer DEFAULT 0 NOT NULL,
	`last_accessed_at` integer,
	`keywords` text,
	`metadata` text,
	`is_archived` integer DEFAULT false NOT NULL,
	`archived_at` integer,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updated_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`agent_id`) REFERENCES `agents`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `agent_memories_agent_id_idx` ON `agent_memories` (`agent_id`);--> statement-breakpoint
CREATE INDEX `agent_memories_user_id_idx` ON `agent_memories` (`user_id`);--> statement-breakpoint
CREATE INDEX `agent_memories_conversation_id_idx` ON `agent_memories` (`conversation_id`);--> statement-breakpoint
CREATE INDEX `agent_memories_type_idx` ON `agent_memories` (`type`);--> statement-breakpoint
CREATE INDEX `agent_memories_importance_idx` ON `agent_memories` (`importance`);--> statement-breakpoint
CREATE INDEX `agent_memories_importance_score_idx` ON `agent_memories` (`importance_score`);--> statement-breakpoint
CREATE INDEX `agent_memories_access_count_idx` ON `agent_memories` (`access_count`);--> statement-breakpoint
CREATE INDEX `agent_memories_last_accessed_at_idx` ON `agent_memories` (`last_accessed_at`);--> statement-breakpoint
CREATE INDEX `agent_memories_is_archived_idx` ON `agent_memories` (`is_archived`);--> statement-breakpoint
CREATE INDEX `agent_memories_created_at_idx` ON `agent_memories` (`created_at`);--> statement-breakpoint
CREATE INDEX `agent_memories_agent_user_idx` ON `agent_memories` (`agent_id`,`user_id`);--> statement-breakpoint
CREATE INDEX `agent_memories_agent_type_idx` ON `agent_memories` (`agent_id`,`type`);--> statement-breakpoint
CREATE INDEX `agent_memories_agent_importance_idx` ON `agent_memories` (`agent_id`,`importance`);--> statement-breakpoint
CREATE INDEX `agent_memories_user_conversation_idx` ON `agent_memories` (`user_id`,`conversation_id`);--> statement-breakpoint
CREATE TABLE `memory_relations` (
	`id` text PRIMARY KEY NOT NULL,
	`source_memory_id` text NOT NULL,
	`target_memory_id` text NOT NULL,
	`relation_type` text NOT NULL,
	`strength` real DEFAULT 0.5 NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`source_memory_id`) REFERENCES `agent_memories`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`target_memory_id`) REFERENCES `agent_memories`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `memory_relations_source_memory_id_idx` ON `memory_relations` (`source_memory_id`);--> statement-breakpoint
CREATE INDEX `memory_relations_target_memory_id_idx` ON `memory_relations` (`target_memory_id`);--> statement-breakpoint
CREATE INDEX `memory_relations_relation_type_idx` ON `memory_relations` (`relation_type`);--> statement-breakpoint
CREATE INDEX `memory_relations_strength_idx` ON `memory_relations` (`strength`);--> statement-breakpoint
CREATE INDEX `memory_relations_source_relation_idx` ON `memory_relations` (`source_memory_id`,`relation_type`);--> statement-breakpoint
CREATE INDEX `memory_relations_target_relation_idx` ON `memory_relations` (`target_memory_id`,`relation_type`);--> statement-breakpoint
CREATE TABLE `accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`username` text NOT NULL,
	`password_hash` text NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `accounts_username_unique` ON `accounts` (`username`);--> statement-breakpoint
CREATE INDEX `accounts_username_idx` ON `accounts` (`username`);--> statement-breakpoint
CREATE INDEX `accounts_user_id_idx` ON `accounts` (`user_id`);--> statement-breakpoint
CREATE TABLE `user_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`token` text NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_sessions_token_unique` ON `user_sessions` (`token`);--> statement-breakpoint
CREATE INDEX `user_sessions_token_idx` ON `user_sessions` (`token`);--> statement-breakpoint
CREATE INDEX `user_sessions_user_id_idx` ON `user_sessions` (`user_id`);--> statement-breakpoint
CREATE INDEX `user_sessions_expires_at_idx` ON `user_sessions` (`expires_at`);--> statement-breakpoint
CREATE TABLE `conversation_participants` (
	`id` text PRIMARY KEY NOT NULL,
	`conversation_id` text NOT NULL,
	`participant_id` text NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`participant_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `conversation_participants_conversation_id_idx` ON `conversation_participants` (`conversation_id`);--> statement-breakpoint
CREATE INDEX `conversation_participants_participant_id_idx` ON `conversation_participants` (`participant_id`);--> statement-breakpoint
CREATE INDEX `conversation_participants_conversation_participant_idx` ON `conversation_participants` (`conversation_id`,`participant_id`);--> statement-breakpoint
CREATE TABLE `conversations` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`description` text,
	`type` text DEFAULT 'dm' NOT NULL,
	`agent_id` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`agent_id`) REFERENCES `agents`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `conversations_agent_id_idx` ON `conversations` (`agent_id`);--> statement-breakpoint
CREATE INDEX `conversations_type_idx` ON `conversations` (`type`);--> statement-breakpoint
CREATE INDEX `conversations_created_at_idx` ON `conversations` (`created_at`);--> statement-breakpoint
CREATE TABLE `llm_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`message_id` text NOT NULL,
	`role` text NOT NULL,
	`tool_calls` text,
	`metadata` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`message_id`) REFERENCES `messages`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `llm_messages_message_id_idx` ON `llm_messages` (`message_id`);--> statement-breakpoint
CREATE INDEX `llm_messages_role_idx` ON `llm_messages` (`role`);--> statement-breakpoint
CREATE INDEX `llm_messages_created_at_idx` ON `llm_messages` (`created_at`);--> statement-breakpoint
CREATE TABLE `messages` (
	`id` text PRIMARY KEY NOT NULL,
	`conversation_id` text NOT NULL,
	`author_id` text NOT NULL,
	`content` text NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `messages_conversation_id_idx` ON `messages` (`conversation_id`);--> statement-breakpoint
CREATE INDEX `messages_author_id_idx` ON `messages` (`author_id`);--> statement-breakpoint
CREATE INDEX `messages_created_at_idx` ON `messages` (`created_at`);--> statement-breakpoint
CREATE INDEX `messages_conversation_time_idx` ON `messages` (`conversation_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `projects` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`avatar_url` text,
	`git_url` text,
	`branch` text,
	`local_path` text NOT NULL,
	`owner_id` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updated_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user_preferences` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`theme` text DEFAULT 'system' NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `user_preferences_user_id_idx` ON `user_preferences` (`user_id`);--> statement-breakpoint
CREATE INDEX `user_preferences_theme_idx` ON `user_preferences` (`theme`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`avatar` text,
	`type` text DEFAULT 'human' NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
