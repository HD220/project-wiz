CREATE TABLE `jobs` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`project_id` text NOT NULL,
	`persona_id` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`priority` integer DEFAULT 0,
	`payload` text,
	`data` text,
	`result` text,
	`attempts` integer DEFAULT 0,
	`max_attempts` integer DEFAULT 3,
	`delay_ms` integer DEFAULT 0,
	`retry_delay_base_ms` integer DEFAULT 1000,
	`depends_on_job_ids` text,
	`parent_job_id` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer DEFAULT (strftime('%s', 'now')),
	`started_at` integer,
	`completed_at` integer,
	`failed_reason` text,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`parent_job_id`) REFERENCES `jobs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`caminho_working_directory` text NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer DEFAULT (strftime('%s', 'now'))
);
