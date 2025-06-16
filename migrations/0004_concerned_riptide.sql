CREATE TABLE `llm_providers_config` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`provider_id` text NOT NULL,
	`model_id` text NOT NULL,
	`api_key` text NOT NULL,
	FOREIGN KEY (`provider_id`) REFERENCES `llm_providers`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`model_id`) REFERENCES `llm_models`(`id`) ON UPDATE no action ON DELETE no action
);
