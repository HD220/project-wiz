DROP TABLE `llm_models`;--> statement-breakpoint
DROP TABLE `llm_providers_config`;--> statement-breakpoint
DROP TABLE `llm_providers`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_queues` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`concurrency` integer DEFAULT 1 NOT NULL,
	`created_at` integer DEFAULT '"2025-06-16T15:44:10.504Z"' NOT NULL,
	`updated_at` integer DEFAULT '"2025-06-16T15:44:10.504Z"' NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_queues`("id", "name", "concurrency", "created_at", "updated_at") SELECT "id", "name", "concurrency", "created_at", "updated_at" FROM `queues`;--> statement-breakpoint
DROP TABLE `queues`;--> statement-breakpoint
ALTER TABLE `__new_queues` RENAME TO `queues`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `queues_name_unique` ON `queues` (`name`);