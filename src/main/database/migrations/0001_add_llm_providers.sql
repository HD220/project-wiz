CREATE TABLE `llm_providers` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`api_key` text,
	`base_url` text,
	`model` text NOT NULL,
	`temperature` real DEFAULT 0.7,
	`max_tokens` integer DEFAULT 4000,
	`is_default` integer DEFAULT false,
	`is_active` integer DEFAULT true,
	`config` text,
	`created_by` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);