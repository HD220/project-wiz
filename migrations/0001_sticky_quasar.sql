CREATE TABLE `llm_models` (
	`id` text PRIMARY KEY NOT NULL,
	`llm_provider_id` text,
	`name` text NOT NULL,
	FOREIGN KEY (`llm_provider_id`) REFERENCES `llm_providers`(`id`) ON UPDATE no action ON DELETE no action
);
