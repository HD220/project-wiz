PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_users` (
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
INSERT INTO `__new_users`("id", "name", "avatar", "type", "is_active", "deactivated_at", "deactivated_by", "created_at", "updated_at") SELECT "id", "name", "avatar", "type", "is_active", "deactivated_at", "deactivated_by", "created_at", "updated_at" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `users_is_active_idx` ON `users` (`is_active`);--> statement-breakpoint
CREATE INDEX `users_is_active_created_at_idx` ON `users` (`is_active`,`created_at`);--> statement-breakpoint
CREATE INDEX `users_deactivated_by_idx` ON `users` (`deactivated_by`);--> statement-breakpoint
ALTER TABLE `llm_messages` ADD `content` text NOT NULL;--> statement-breakpoint
ALTER TABLE `llm_messages` DROP COLUMN `tool_calls`;--> statement-breakpoint
ALTER TABLE `llm_messages` DROP COLUMN `metadata`;