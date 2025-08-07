PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_dm_participants` (
	`id` text NOT NULL,
	`owner_id` text NOT NULL,
	`dm_conversation_id` text NOT NULL,
	`participant_id` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`deactivated_at` integer,
	`deactivated_by` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	PRIMARY KEY(`owner_id`, `id`),
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`participant_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`deactivated_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`owner_id`,`dm_conversation_id`) REFERENCES `dm_conversations`(`owner_id`,`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_dm_participants`("id", "owner_id", "dm_conversation_id", "participant_id", "is_active", "deactivated_at", "deactivated_by", "created_at", "updated_at") SELECT "id", "owner_id", "dm_conversation_id", "participant_id", "is_active", "deactivated_at", "deactivated_by", "created_at", "updated_at" FROM `dm_participants`;--> statement-breakpoint
DROP TABLE `dm_participants`;--> statement-breakpoint
ALTER TABLE `__new_dm_participants` RENAME TO `dm_participants`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `dm_participants_owner_id_idx` ON `dm_participants` (`owner_id`);--> statement-breakpoint
CREATE INDEX `dm_participants_dm_conversation_id_idx` ON `dm_participants` (`dm_conversation_id`);--> statement-breakpoint
CREATE INDEX `dm_participants_participant_id_idx` ON `dm_participants` (`participant_id`);--> statement-breakpoint
CREATE INDEX `dm_participants_deactivated_by_idx` ON `dm_participants` (`deactivated_by`);--> statement-breakpoint
CREATE INDEX `dm_participants_is_active_idx` ON `dm_participants` (`is_active`);--> statement-breakpoint
CREATE INDEX `dm_participants_is_active_created_at_idx` ON `dm_participants` (`is_active`,`created_at`);--> statement-breakpoint
CREATE INDEX `dm_participants_dm_participant_idx` ON `dm_participants` (`dm_conversation_id`,`participant_id`);