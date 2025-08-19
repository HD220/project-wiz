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
CREATE INDEX `accounts_user_id_idx` ON `accounts` (`user_id`);--> statement-breakpoint
CREATE INDEX `accounts_username_idx` ON `accounts` (`username`);--> statement-breakpoint
CREATE TABLE `agents` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text,
	`provider_id` text NOT NULL,
	`role` text NOT NULL,
	`backstory` text NOT NULL,
	`goal` text NOT NULL,
	`model_config` text NOT NULL,
	FOREIGN KEY (`id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`provider_id`) REFERENCES `llm_providers`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `agents_owner_id_idx` ON `agents` (`owner_id`);--> statement-breakpoint
CREATE INDEX `agents_provider_id_idx` ON `agents` (`provider_id`);--> statement-breakpoint
CREATE TABLE `direct_message_participants` (
	`id` text NOT NULL,
	`owner_id` text NOT NULL,
	`direct_message_id` text NOT NULL,
	`participant_id` text NOT NULL,
	`deactivated_at` integer,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	PRIMARY KEY(`owner_id`, `id`),
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`participant_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`owner_id`,`direct_message_id`) REFERENCES `direct_messages`(`owner_id`,`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `direct_message_participants_owner_id_idx` ON `direct_message_participants` (`owner_id`);--> statement-breakpoint
CREATE INDEX `direct_message_participants_direct_message_id_idx` ON `direct_message_participants` (`direct_message_id`);--> statement-breakpoint
CREATE INDEX `direct_message_participants_participant_id_idx` ON `direct_message_participants` (`participant_id`);--> statement-breakpoint
CREATE INDEX `direct_message_participants_deactivated_at_idx` ON `direct_message_participants` (`deactivated_at`);--> statement-breakpoint
CREATE INDEX `direct_message_participants_dm_participant_idx` ON `direct_message_participants` (`direct_message_id`,`participant_id`);--> statement-breakpoint
CREATE TABLE `direct_messages` (
	`id` text NOT NULL,
	`owner_id` text NOT NULL,
	`name` text,
	`description` text,
	`archived_at` integer,
	`deactivated_at` integer,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	PRIMARY KEY(`owner_id`, `id`),
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `direct_messages_owner_id_idx` ON `direct_messages` (`owner_id`);--> statement-breakpoint
CREATE INDEX `direct_messages_created_at_idx` ON `direct_messages` (`created_at`);--> statement-breakpoint
CREATE INDEX `direct_messages_deactivated_at_idx` ON `direct_messages` (`deactivated_at`);--> statement-breakpoint
CREATE INDEX `direct_messages_archived_at_idx` ON `direct_messages` (`archived_at`);--> statement-breakpoint
CREATE INDEX `direct_messages_deactivated_archived_at_idx` ON `direct_messages` (`deactivated_at`,`archived_at`);--> statement-breakpoint
CREATE TABLE `jobs` (
	`id` text PRIMARY KEY NOT NULL,
	`queue_name` text NOT NULL,
	`data` text NOT NULL,
	`opts` text,
	`status` text DEFAULT 'waiting' NOT NULL,
	`priority` integer DEFAULT 0 NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`max_attempts` integer DEFAULT 3 NOT NULL,
	`delay_ms` integer DEFAULT 0 NOT NULL,
	`scheduled_for` integer,
	`result` text,
	`failure_reason` text,
	`worker_id` text,
	`created_at` integer DEFAULT (unixepoch('subsec') * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch('subsec') * 1000) NOT NULL,
	`processed_on` integer,
	`finished_on` integer
);
--> statement-breakpoint
CREATE INDEX `jobs_queue_status_idx` ON `jobs` (`queue_name`,`status`,`priority`);--> statement-breakpoint
CREATE INDEX `jobs_scheduled_idx` ON `jobs` (`scheduled_for`);--> statement-breakpoint
CREATE INDEX `jobs_worker_idx` ON `jobs` (`worker_id`);--> statement-breakpoint
CREATE TABLE `llm_providers` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`api_key` text NOT NULL,
	`base_url` text,
	`default_model` text DEFAULT 'gpt-3.5-turbo' NOT NULL,
	`is_default` integer DEFAULT false NOT NULL,
	`deactivated_at` integer,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updated_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `llm_providers_owner_id_idx` ON `llm_providers` (`owner_id`);--> statement-breakpoint
CREATE INDEX `llm_providers_type_idx` ON `llm_providers` (`type`);--> statement-breakpoint
CREATE INDEX `llm_providers_is_default_idx` ON `llm_providers` (`is_default`);--> statement-breakpoint
CREATE INDEX `llm_providers_deactivated_at_idx` ON `llm_providers` (`deactivated_at`);--> statement-breakpoint
CREATE TABLE `agent_memory` (
	`memory_id` text NOT NULL,
	`agent_id` text NOT NULL,
	PRIMARY KEY(`memory_id`, `agent_id`),
	FOREIGN KEY (`memory_id`) REFERENCES `memory`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`agent_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `agent_memory_agent_idx` ON `agent_memory` (`agent_id`);--> statement-breakpoint
CREATE TABLE `memory` (
	`id` text PRIMARY KEY NOT NULL,
	`content` text NOT NULL,
	`created_by` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch('subsec') * 1000) NOT NULL,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `memory_created_by_idx` ON `memory` (`created_by`);--> statement-breakpoint
CREATE INDEX `memory_created_at_idx` ON `memory` (`created_at`);--> statement-breakpoint
CREATE TABLE `project_memory` (
	`memory_id` text NOT NULL,
	`project_id` text NOT NULL,
	PRIMARY KEY(`memory_id`, `project_id`),
	FOREIGN KEY (`memory_id`) REFERENCES `memory`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `project_memory_project_idx` ON `project_memory` (`project_id`);--> statement-breakpoint
CREATE TABLE `team_memory` (
	`memory_id` text NOT NULL,
	`project_id` text NOT NULL,
	PRIMARY KEY(`memory_id`, `project_id`),
	FOREIGN KEY (`memory_id`) REFERENCES `memory`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `team_memory_project_idx` ON `team_memory` (`project_id`);--> statement-breakpoint
CREATE TABLE `messages` (
	`id` text PRIMARY KEY NOT NULL,
	`source_type` text NOT NULL,
	`source_id` text NOT NULL,
	`owner_id` text NOT NULL,
	`author_id` text NOT NULL,
	`content` text NOT NULL,
	`deactivated_at` integer,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `messages_owner_id_idx` ON `messages` (`owner_id`);--> statement-breakpoint
CREATE INDEX `messages_author_id_idx` ON `messages` (`author_id`);--> statement-breakpoint
CREATE INDEX `messages_source_type_idx` ON `messages` (`source_type`);--> statement-breakpoint
CREATE INDEX `messages_source_id_idx` ON `messages` (`source_id`);--> statement-breakpoint
CREATE INDEX `messages_created_at_idx` ON `messages` (`created_at`);--> statement-breakpoint
CREATE INDEX `messages_deactivated_at_idx` ON `messages` (`deactivated_at`);--> statement-breakpoint
CREATE INDEX `messages_source_time_idx` ON `messages` (`source_type`,`source_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `messages_source_deactivated_time_idx` ON `messages` (`source_type`,`source_id`,`deactivated_at`,`created_at`);--> statement-breakpoint
CREATE TABLE `project_channels` (
	`id` text NOT NULL,
	`owner_id` text NOT NULL,
	`project_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`archived_at` integer,
	`deactivated_at` integer,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	PRIMARY KEY(`owner_id`, `id`),
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `project_channels_owner_id_idx` ON `project_channels` (`owner_id`);--> statement-breakpoint
CREATE INDEX `project_channels_project_id_idx` ON `project_channels` (`project_id`);--> statement-breakpoint
CREATE INDEX `project_channels_created_at_idx` ON `project_channels` (`created_at`);--> statement-breakpoint
CREATE INDEX `project_channels_deactivated_at_idx` ON `project_channels` (`deactivated_at`);--> statement-breakpoint
CREATE INDEX `project_channels_archived_at_idx` ON `project_channels` (`archived_at`);--> statement-breakpoint
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
	`archived_at` integer,
	`deactivated_at` integer,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updated_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `projects_owner_id_idx` ON `projects` (`owner_id`);--> statement-breakpoint
CREATE INDEX `projects_archived_at_idx` ON `projects` (`archived_at`);--> statement-breakpoint
CREATE INDEX `projects_deactivated_at_idx` ON `projects` (`deactivated_at`);--> statement-breakpoint
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
CREATE TABLE `user_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`token` text NOT NULL,
	`deactivated_at` integer,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_sessions_token_unique` ON `user_sessions` (`token`);--> statement-breakpoint
CREATE INDEX `user_sessions_user_id_idx` ON `user_sessions` (`user_id`);--> statement-breakpoint
CREATE INDEX `user_sessions_token_idx` ON `user_sessions` (`token`);--> statement-breakpoint
CREATE INDEX `user_sessions_expires_at_idx` ON `user_sessions` (`expires_at`);--> statement-breakpoint
CREATE INDEX `user_sessions_deactivated_at_idx` ON `user_sessions` (`deactivated_at`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`avatar` text,
	`type` text DEFAULT 'human' NOT NULL,
	`status` text DEFAULT 'offline' NOT NULL,
	`deactivated_at` integer,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `users_status_idx` ON `users` (`status`);--> statement-breakpoint
CREATE INDEX `users_deactivated_at_idx` ON `users` (`deactivated_at`);