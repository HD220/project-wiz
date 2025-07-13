PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_llm_providers` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`provider` text NOT NULL,
	`model` text NOT NULL,
	`api_key` text NOT NULL,
	`is_default` integer DEFAULT false,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_llm_providers`("id", "name", "provider", "model", "api_key", "is_default", "created_at", "updated_at") SELECT "id", "name", "provider", "model", "api_key", "is_default", "created_at", "updated_at" FROM `llm_providers`;--> statement-breakpoint
DROP TABLE `llm_providers`;--> statement-breakpoint
ALTER TABLE `__new_llm_providers` RENAME TO `llm_providers`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
ALTER TABLE `agents` ADD `is_default` integer DEFAULT false NOT NULL;