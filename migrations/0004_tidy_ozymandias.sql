PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_llm_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`message_id` text NOT NULL,
	`role` text NOT NULL,
	`content` text NOT NULL,
	`deactivated_at` integer,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`message_id`) REFERENCES `messages`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_llm_messages`("id", "owner_id", "message_id", "role", "content", "deactivated_at", "created_at", "updated_at") SELECT "id", "owner_id", "message_id", "role", "content", "deactivated_at", "created_at", "updated_at" FROM `llm_messages`;--> statement-breakpoint
DROP TABLE `llm_messages`;--> statement-breakpoint
ALTER TABLE `__new_llm_messages` RENAME TO `llm_messages`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `llm_messages_owner_id_idx` ON `llm_messages` (`owner_id`);--> statement-breakpoint
CREATE INDEX `llm_messages_message_id_idx` ON `llm_messages` (`message_id`);--> statement-breakpoint
CREATE INDEX `llm_messages_role_idx` ON `llm_messages` (`role`);--> statement-breakpoint
CREATE INDEX `llm_messages_created_at_idx` ON `llm_messages` (`created_at`);--> statement-breakpoint
CREATE INDEX `llm_messages_deactivated_at_idx` ON `llm_messages` (`deactivated_at`);--> statement-breakpoint
CREATE TABLE `__new_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`source_type` text NOT NULL,
	`source_id` text NOT NULL,
	`owner_id` text NOT NULL,
	`content` text NOT NULL,
	`deactivated_at` integer,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_messages`("id", "source_type", "source_id", "owner_id", "content", "deactivated_at", "created_at", "updated_at") SELECT "id", "source_type", "source_id", "owner_id", "content", "deactivated_at", "created_at", "updated_at" FROM `messages`;--> statement-breakpoint
DROP TABLE `messages`;--> statement-breakpoint
ALTER TABLE `__new_messages` RENAME TO `messages`;--> statement-breakpoint
CREATE INDEX `messages_owner_id_idx` ON `messages` (`owner_id`);--> statement-breakpoint
CREATE INDEX `messages_source_type_idx` ON `messages` (`source_type`);--> statement-breakpoint
CREATE INDEX `messages_source_id_idx` ON `messages` (`source_id`);--> statement-breakpoint
CREATE INDEX `messages_created_at_idx` ON `messages` (`created_at`);--> statement-breakpoint
CREATE INDEX `messages_deactivated_at_idx` ON `messages` (`deactivated_at`);--> statement-breakpoint
CREATE INDEX `messages_source_time_idx` ON `messages` (`source_type`,`source_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `messages_source_deactivated_time_idx` ON `messages` (`source_type`,`source_id`,`deactivated_at`,`created_at`);