CREATE TABLE `jobs` (
	`id` text NOT NULL,
	`queue_id` text NOT NULL,
	`name` text NOT NULL,
	`data` text NOT NULL,
	`opts` text NOT NULL,
	`status` text NOT NULL,
	`updated_at` integer NOT NULL,
	`started_at` integer DEFAULT 'null',
	`finished_at` integer DEFAULT 'null',
	`failed_reason` text DEFAULT 'null',
	`delayed_until` integer DEFAULT 'null',
	PRIMARY KEY(`id`, `queue_id`),
	FOREIGN KEY (`queue_id`) REFERENCES `queues`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `queue_status_idx` ON `jobs` (`queue_id`,`status`);--> statement-breakpoint
CREATE INDEX `queue_status_priority_idx` ON `jobs` (`queue_id`,`status`,CAST("opts"->>'priority' AS INTEGER));--> statement-breakpoint
CREATE INDEX `status_updated_at_idx` ON `jobs` (`status`,`updated_at`);--> statement-breakpoint
CREATE INDEX `delayed_until_status_idx` ON `jobs` (`delayed_until`,`status`) WHERE "jobs"."delayed_until" IS NOT NULL;--> statement-breakpoint
CREATE INDEX `started_at_status_idx` ON `jobs` (`started_at`,`status`) WHERE "jobs"."started_at" IS NOT NULL;--> statement-breakpoint
CREATE TABLE `llm_models` (
	`id` text PRIMARY KEY NOT NULL,
	`llm_provider_id` text,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	FOREIGN KEY (`llm_provider_id`) REFERENCES `llm_providers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `model_slug` ON `llm_models` (`slug`);--> statement-breakpoint
CREATE TABLE `llm_providers_config` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`provider_id` text NOT NULL,
	`model_id` text NOT NULL,
	`api_key` text NOT NULL,
	FOREIGN KEY (`provider_id`) REFERENCES `llm_providers`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`model_id`) REFERENCES `llm_models`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `llm_providers` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `provider_slug` ON `llm_providers` (`slug`);--> statement-breakpoint
CREATE TABLE `queues` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`concurrency` integer DEFAULT 1 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `queues_name_unique` ON `queues` (`name`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`nickname` text NOT NULL,
	`username` text NOT NULL,
	`email` text NOT NULL,
	`avatar` text NOT NULL,
	`llm_provider_config_id` text NOT NULL,
	FOREIGN KEY (`llm_provider_config_id`) REFERENCES `llm_providers_config`(`id`) ON UPDATE no action ON DELETE no action
);
