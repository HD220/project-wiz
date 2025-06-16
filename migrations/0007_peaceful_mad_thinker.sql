CREATE TABLE `queues` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`concurrency` integer DEFAULT 1 NOT NULL,
	`created_at` integer DEFAULT '"2025-06-16T14:53:55.970Z"' NOT NULL,
	`updated_at` integer DEFAULT '"2025-06-16T14:53:55.970Z"' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `queues_name_unique` ON `queues` (`name`);