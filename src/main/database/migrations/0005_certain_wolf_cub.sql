PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_llm_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`message_id` text NOT NULL,
	`role` text NOT NULL,
	`content` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`deactivated_at` integer,
	`deactivated_by` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`message_id`) REFERENCES `messages`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`deactivated_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_llm_messages`("id", "message_id", "role", "content", "is_active", "deactivated_at", "deactivated_by", "created_at", "updated_at") SELECT "id", "message_id", "role", "content", "is_active", "deactivated_at", "deactivated_by", "created_at", "updated_at" FROM `llm_messages`;--> statement-breakpoint
DROP TABLE `llm_messages`;--> statement-breakpoint
ALTER TABLE `__new_llm_messages` RENAME TO `llm_messages`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `llm_messages_message_id_idx` ON `llm_messages` (`message_id`);--> statement-breakpoint
CREATE INDEX `llm_messages_role_idx` ON `llm_messages` (`role`);--> statement-breakpoint
CREATE INDEX `llm_messages_created_at_idx` ON `llm_messages` (`created_at`);--> statement-breakpoint
CREATE INDEX `llm_messages_deactivated_by_idx` ON `llm_messages` (`deactivated_by`);--> statement-breakpoint
CREATE INDEX `llm_messages_is_active_idx` ON `llm_messages` (`is_active`);--> statement-breakpoint
CREATE INDEX `llm_messages_is_active_created_at_idx` ON `llm_messages` (`is_active`,`created_at`);--> statement-breakpoint
CREATE TABLE `__new_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`conversation_id` text NOT NULL,
	`author_id` text NOT NULL,
	`content` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`deactivated_at` integer,
	`deactivated_by` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`deactivated_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_messages`("id", "conversation_id", "author_id", "content", "is_active", "deactivated_at", "deactivated_by", "created_at", "updated_at") SELECT "id", "conversation_id", "author_id", "content", "is_active", "deactivated_at", "deactivated_by", "created_at", "updated_at" FROM `messages`;--> statement-breakpoint
DROP TABLE `messages`;--> statement-breakpoint
ALTER TABLE `__new_messages` RENAME TO `messages`;--> statement-breakpoint
CREATE INDEX `messages_conversation_id_idx` ON `messages` (`conversation_id`);--> statement-breakpoint
CREATE INDEX `messages_author_id_idx` ON `messages` (`author_id`);--> statement-breakpoint
CREATE INDEX `messages_created_at_idx` ON `messages` (`created_at`);--> statement-breakpoint
CREATE INDEX `messages_deactivated_by_idx` ON `messages` (`deactivated_by`);--> statement-breakpoint
CREATE INDEX `messages_is_active_idx` ON `messages` (`is_active`);--> statement-breakpoint
CREATE INDEX `messages_is_active_created_at_idx` ON `messages` (`is_active`,`created_at`);--> statement-breakpoint
CREATE INDEX `messages_conversation_time_idx` ON `messages` (`conversation_id`,`created_at`);