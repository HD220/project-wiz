CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`nickname` text NOT NULL,
	`username` text NOT NULL,
	`email` text NOT NULL,
	`avatar` text NOT NULL,
	`llm_provider_config_id` text NOT NULL,
	FOREIGN KEY (`llm_provider_config_id`) REFERENCES `llm_providers_config`(`id`) ON UPDATE no action ON DELETE no action
);
