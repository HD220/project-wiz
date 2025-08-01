CREATE TABLE `agents` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`owner_id` text,
	`provider_id` text NOT NULL,
	`name` text NOT NULL,
	`role` text NOT NULL,
	`backstory` text NOT NULL,
	`goal` text NOT NULL,
	`system_prompt` text NOT NULL,
	`status` text DEFAULT 'inactive' NOT NULL,
	`model_config` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`deactivated_at` integer,
	`deactivated_by` text,
	`created_at` integer DEFAULT (strftime('%s', 'now') * 1000) NOT NULL,
	`updated_at` integer DEFAULT (strftime('%s', 'now') * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`provider_id`) REFERENCES `llm_providers`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`deactivated_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `agents_user_id_idx` ON `agents` (`user_id`);--> statement-breakpoint
CREATE INDEX `agents_owner_id_idx` ON `agents` (`owner_id`);--> statement-breakpoint
CREATE INDEX `agents_provider_id_idx` ON `agents` (`provider_id`);--> statement-breakpoint
CREATE INDEX `agents_status_idx` ON `agents` (`status`);--> statement-breakpoint
CREATE INDEX `agents_deactivated_by_idx` ON `agents` (`deactivated_by`);--> statement-breakpoint
CREATE INDEX `agents_is_active_idx` ON `agents` (`is_active`);--> statement-breakpoint
CREATE INDEX `agents_is_active_created_at_idx` ON `agents` (`is_active`,`created_at`);--> statement-breakpoint
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
	`is_active` integer DEFAULT true NOT NULL,
	`deactivated_at` integer,
	`deactivated_by` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`deactivated_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_sessions_token_unique` ON `user_sessions` (`token`);--> statement-breakpoint
CREATE INDEX `user_sessions_token_idx` ON `user_sessions` (`token`);--> statement-breakpoint
CREATE INDEX `user_sessions_user_id_idx` ON `user_sessions` (`user_id`);--> statement-breakpoint
CREATE INDEX `user_sessions_expires_at_idx` ON `user_sessions` (`expires_at`);--> statement-breakpoint
CREATE INDEX `user_sessions_deactivated_by_idx` ON `user_sessions` (`deactivated_by`);--> statement-breakpoint
CREATE INDEX `user_sessions_is_active_idx` ON `user_sessions` (`is_active`);--> statement-breakpoint
CREATE INDEX `user_sessions_is_active_created_at_idx` ON `user_sessions` (`is_active`,`created_at`);--> statement-breakpoint
CREATE TABLE `dm_conversations` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`description` text,
	`archived_at` integer,
	`archived_by` text,
	`is_active` integer DEFAULT true NOT NULL,
	`deactivated_at` integer,
	`deactivated_by` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`archived_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`deactivated_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `dm_conversations_created_at_idx` ON `dm_conversations` (`created_at`);--> statement-breakpoint
CREATE INDEX `dm_conversations_archived_by_idx` ON `dm_conversations` (`archived_by`);--> statement-breakpoint
CREATE INDEX `dm_conversations_deactivated_by_idx` ON `dm_conversations` (`deactivated_by`);--> statement-breakpoint
CREATE INDEX `dm_conversations_is_active_idx` ON `dm_conversations` (`is_active`);--> statement-breakpoint
CREATE INDEX `dm_conversations_is_active_created_at_idx` ON `dm_conversations` (`is_active`,`created_at`);--> statement-breakpoint
CREATE INDEX `dm_conversations_archived_at_idx` ON `dm_conversations` (`archived_at`);--> statement-breakpoint
CREATE INDEX `dm_conversations_is_active_archived_at_idx` ON `dm_conversations` (`is_active`,`archived_at`);--> statement-breakpoint
CREATE TABLE `dm_participants` (
	`id` text PRIMARY KEY NOT NULL,
	`dm_conversation_id` text NOT NULL,
	`participant_id` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`deactivated_at` integer,
	`deactivated_by` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`dm_conversation_id`) REFERENCES `dm_conversations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`participant_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`deactivated_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `dm_participants_dm_conversation_id_idx` ON `dm_participants` (`dm_conversation_id`);--> statement-breakpoint
CREATE INDEX `dm_participants_participant_id_idx` ON `dm_participants` (`participant_id`);--> statement-breakpoint
CREATE INDEX `dm_participants_deactivated_by_idx` ON `dm_participants` (`deactivated_by`);--> statement-breakpoint
CREATE INDEX `dm_participants_is_active_idx` ON `dm_participants` (`is_active`);--> statement-breakpoint
CREATE INDEX `dm_participants_is_active_created_at_idx` ON `dm_participants` (`is_active`,`created_at`);--> statement-breakpoint
CREATE INDEX `dm_participants_dm_participant_idx` ON `dm_participants` (`dm_conversation_id`,`participant_id`);--> statement-breakpoint
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
	`deactivated_at` integer,
	`deactivated_by` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updated_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`deactivated_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `llm_providers_user_id_idx` ON `llm_providers` (`user_id`);--> statement-breakpoint
CREATE INDEX `llm_providers_type_idx` ON `llm_providers` (`type`);--> statement-breakpoint
CREATE INDEX `llm_providers_is_default_idx` ON `llm_providers` (`is_default`);--> statement-breakpoint
CREATE INDEX `llm_providers_is_active_idx` ON `llm_providers` (`is_active`);--> statement-breakpoint
CREATE INDEX `llm_providers_deactivated_by_idx` ON `llm_providers` (`deactivated_by`);--> statement-breakpoint
CREATE INDEX `llm_providers_is_active_created_at_idx` ON `llm_providers` (`is_active`,`created_at`);--> statement-breakpoint
CREATE TABLE `llm_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`message_id` text NOT NULL,
	`role` text NOT NULL,
	`content` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`deactivated_at` integer,
	`deactivated_by` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`message_id`) REFERENCES `messages`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`deactivated_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `llm_messages_message_id_idx` ON `llm_messages` (`message_id`);--> statement-breakpoint
CREATE INDEX `llm_messages_role_idx` ON `llm_messages` (`role`);--> statement-breakpoint
CREATE INDEX `llm_messages_created_at_idx` ON `llm_messages` (`created_at`);--> statement-breakpoint
CREATE INDEX `llm_messages_deactivated_by_idx` ON `llm_messages` (`deactivated_by`);--> statement-breakpoint
CREATE INDEX `llm_messages_is_active_idx` ON `llm_messages` (`is_active`);--> statement-breakpoint
CREATE INDEX `llm_messages_is_active_created_at_idx` ON `llm_messages` (`is_active`,`created_at`);--> statement-breakpoint
CREATE TABLE `messages` (
	`id` text PRIMARY KEY NOT NULL,
	`source_type` text NOT NULL,
	`source_id` text NOT NULL,
	`author_id` text NOT NULL,
	`content` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`deactivated_at` integer,
	`deactivated_by` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`deactivated_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `messages_source_type_idx` ON `messages` (`source_type`);--> statement-breakpoint
CREATE INDEX `messages_source_id_idx` ON `messages` (`source_id`);--> statement-breakpoint
CREATE INDEX `messages_author_id_idx` ON `messages` (`author_id`);--> statement-breakpoint
CREATE INDEX `messages_created_at_idx` ON `messages` (`created_at`);--> statement-breakpoint
CREATE INDEX `messages_deactivated_by_idx` ON `messages` (`deactivated_by`);--> statement-breakpoint
CREATE INDEX `messages_is_active_idx` ON `messages` (`is_active`);--> statement-breakpoint
CREATE INDEX `messages_is_active_created_at_idx` ON `messages` (`is_active`,`created_at`);--> statement-breakpoint
CREATE INDEX `messages_source_time_idx` ON `messages` (`source_type`,`source_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `messages_source_active_time_idx` ON `messages` (`source_type`,`source_id`,`is_active`,`created_at`);--> statement-breakpoint
CREATE TABLE `project_channels` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`archived_at` integer,
	`archived_by` text,
	`is_active` integer DEFAULT true NOT NULL,
	`deactivated_at` integer,
	`deactivated_by` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`archived_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`deactivated_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `project_channels_project_id_idx` ON `project_channels` (`project_id`);--> statement-breakpoint
CREATE INDEX `project_channels_created_at_idx` ON `project_channels` (`created_at`);--> statement-breakpoint
CREATE INDEX `project_channels_archived_by_idx` ON `project_channels` (`archived_by`);--> statement-breakpoint
CREATE INDEX `project_channels_deactivated_by_idx` ON `project_channels` (`deactivated_by`);--> statement-breakpoint
CREATE INDEX `project_channels_is_active_idx` ON `project_channels` (`is_active`);--> statement-breakpoint
CREATE INDEX `project_channels_is_active_created_at_idx` ON `project_channels` (`is_active`,`created_at`);--> statement-breakpoint
CREATE INDEX `project_channels_archived_at_idx` ON `project_channels` (`archived_at`);--> statement-breakpoint
CREATE INDEX `project_channels_is_active_archived_at_idx` ON `project_channels` (`is_active`,`archived_at`);--> statement-breakpoint
CREATE INDEX `project_channels_project_active_idx` ON `project_channels` (`project_id`,`is_active`);--> statement-breakpoint
CREATE INDEX `project_channels_project_name_idx` ON `project_channels` (`project_id`,`name`);--> statement-breakpoint
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
	`is_active` integer DEFAULT true NOT NULL,
	`deactivated_at` integer,
	`deactivated_by` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updated_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`deactivated_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `projects_owner_id_idx` ON `projects` (`owner_id`);--> statement-breakpoint
CREATE INDEX `projects_status_idx` ON `projects` (`status`);--> statement-breakpoint
CREATE INDEX `projects_deactivated_by_idx` ON `projects` (`deactivated_by`);--> statement-breakpoint
CREATE INDEX `projects_is_active_idx` ON `projects` (`is_active`);--> statement-breakpoint
CREATE INDEX `projects_is_active_created_at_idx` ON `projects` (`is_active`,`created_at`);--> statement-breakpoint
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
	`is_active` integer DEFAULT true NOT NULL,
	`deactivated_at` integer,
	`deactivated_by` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `users_is_active_idx` ON `users` (`is_active`);--> statement-breakpoint
CREATE INDEX `users_is_active_created_at_idx` ON `users` (`is_active`,`created_at`);--> statement-breakpoint
CREATE INDEX `users_deactivated_by_idx` ON `users` (`deactivated_by`);--> statement-breakpoint
CREATE TABLE `llm_jobs` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`data` text NOT NULL,
	`opts` text,
	`priority` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'waiting' NOT NULL,
	`progress` integer DEFAULT 0 NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`max_attempts` integer DEFAULT 3 NOT NULL,
	`delay` integer DEFAULT 0 NOT NULL,
	`parent_job_id` text,
	`dependency_count` integer DEFAULT 0 NOT NULL,
	`result` text,
	`failure_reason` text,
	`stacktrace` text,
	`created_at` integer DEFAULT (unixepoch('subsec') * 1000) NOT NULL,
	`processed_on` integer,
	`finished_on` integer,
	FOREIGN KEY (`parent_job_id`) REFERENCES `llm_jobs`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `llm_jobs_queue_processing_idx` ON `llm_jobs` (`status`,`priority`,`created_at`);--> statement-breakpoint
CREATE INDEX `llm_jobs_dependencies_idx` ON `llm_jobs` (`parent_job_id`,`dependency_count`);--> statement-breakpoint
CREATE INDEX `llm_jobs_delayed_idx` ON `llm_jobs` (`status`,`delay`,`created_at`);--> statement-breakpoint
CREATE INDEX `llm_jobs_status_idx` ON `llm_jobs` (`status`);--> statement-breakpoint
CREATE INDEX `llm_jobs_name_idx` ON `llm_jobs` (`name`);--> statement-breakpoint
CREATE INDEX `llm_jobs_created_at_idx` ON `llm_jobs` (`created_at`);--> statement-breakpoint
CREATE INDEX `llm_jobs_parent_job_id_idx` ON `llm_jobs` (`parent_job_id`);