PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_agents` (
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
INSERT INTO `__new_agents`("id", "user_id", "owner_id", "provider_id", "name", "role", "backstory", "goal", "system_prompt", "status", "model_config", "is_active", "deactivated_at", "deactivated_by", "created_at", "updated_at") SELECT "id", "user_id", "owner_id", "provider_id", "name", "role", "backstory", "goal", "system_prompt", "status", "model_config", "is_active", "deactivated_at", "deactivated_by", "created_at", "updated_at" FROM `agents`;--> statement-breakpoint
DROP TABLE `agents`;--> statement-breakpoint
ALTER TABLE `__new_agents` RENAME TO `agents`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `agents_user_id_idx` ON `agents` (`user_id`);--> statement-breakpoint
CREATE INDEX `agents_owner_id_idx` ON `agents` (`owner_id`);--> statement-breakpoint
CREATE INDEX `agents_provider_id_idx` ON `agents` (`provider_id`);--> statement-breakpoint
CREATE INDEX `agents_status_idx` ON `agents` (`status`);--> statement-breakpoint
CREATE INDEX `agents_deactivated_by_idx` ON `agents` (`deactivated_by`);--> statement-breakpoint
CREATE INDEX `agents_is_active_idx` ON `agents` (`is_active`);--> statement-breakpoint
CREATE INDEX `agents_is_active_created_at_idx` ON `agents` (`is_active`,`created_at`);