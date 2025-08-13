-- SQLite doesn't support ALTER COLUMN, so we need to recreate the table
-- Step 1: Create new messages table with author_id field
CREATE TABLE `messages_new` (
	`id` text PRIMARY KEY NOT NULL,
	`source_type` text NOT NULL,
	`source_id` text NOT NULL,
	`owner_id` text NOT NULL,
	`author_id` text NOT NULL,
	`content` text NOT NULL,
	`deactivated_at` integer,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE cascade,
	FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE cascade
);--> statement-breakpoint

-- Step 2: Copy data from old table, using owner_id as author_id (since it was acting as author)
INSERT INTO `messages_new` (
	`id`, `source_type`, `source_id`, `owner_id`, `author_id`, 
	`content`, `deactivated_at`, `created_at`, `updated_at`
)
SELECT 
	`id`, `source_type`, `source_id`, `owner_id`, `owner_id` AS `author_id`,
	`content`, `deactivated_at`, `created_at`, `updated_at`
FROM `messages`;--> statement-breakpoint

-- Step 3: Drop old table
DROP TABLE `messages`;--> statement-breakpoint

-- Step 4: Rename new table
ALTER TABLE `messages_new` RENAME TO `messages`;--> statement-breakpoint

-- Step 5: Recreate all indexes
CREATE INDEX `messages_owner_id_idx` ON `messages` (`owner_id`);--> statement-breakpoint
CREATE INDEX `messages_author_id_idx` ON `messages` (`author_id`);--> statement-breakpoint
CREATE INDEX `messages_source_type_idx` ON `messages` (`source_type`);--> statement-breakpoint
CREATE INDEX `messages_source_id_idx` ON `messages` (`source_id`);--> statement-breakpoint
CREATE INDEX `messages_created_at_idx` ON `messages` (`created_at`);--> statement-breakpoint
CREATE INDEX `messages_deactivated_at_idx` ON `messages` (`deactivated_at`);--> statement-breakpoint
CREATE INDEX `messages_source_time_idx` ON `messages` (`source_type`,`source_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `messages_source_deactivated_time_idx` ON `messages` (`source_type`,`source_id`,`deactivated_at`,`created_at`);