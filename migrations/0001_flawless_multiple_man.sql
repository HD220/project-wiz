CREATE TABLE `llm_jobs` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`data` text NOT NULL,
	`opts` text,
	`priority` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'waiting' NOT NULL,
	`progress` integer DEFAULT 0 NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`max_attempts` integer DEFAULT 3 NOT NULL,
	`delay` integer DEFAULT 0 NOT NULL,
	`parent_job_id` text,
	`dependency_count` integer DEFAULT 0 NOT NULL,
	`result` text,
	`failure_reason` text,
	`stacktrace` text,
	`created_at` integer DEFAULT (unixepoch('subsec') * 1000) NOT NULL,
	`processed_on` integer,
	`finished_on` integer,
	FOREIGN KEY (`parent_job_id`) REFERENCES `llm_jobs`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `llm_jobs_queue_processing_idx` ON `llm_jobs` (`status`,`priority`,`created_at`);--> statement-breakpoint
CREATE INDEX `llm_jobs_dependencies_idx` ON `llm_jobs` (`parent_job_id`,`dependency_count`);--> statement-breakpoint
CREATE INDEX `llm_jobs_delayed_idx` ON `llm_jobs` (`status`,`delay`,`created_at`);--> statement-breakpoint
CREATE INDEX `llm_jobs_status_idx` ON `llm_jobs` (`status`);--> statement-breakpoint
CREATE INDEX `llm_jobs_name_idx` ON `llm_jobs` (`name`);--> statement-breakpoint
CREATE INDEX `llm_jobs_created_at_idx` ON `llm_jobs` (`created_at`);--> statement-breakpoint
CREATE INDEX `llm_jobs_parent_job_id_idx` ON `llm_jobs` (`parent_job_id`);