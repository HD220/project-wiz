CREATE TABLE `jobs` (
	`id` text PRIMARY KEY NOT NULL,
	`queue_name` text NOT NULL,
	`name` text NOT NULL,
	`payload` text NOT NULL,
	`options` text NOT NULL,
	`return_value` text,
	`logs` text NOT NULL,
	`progress` text NOT NULL,
	`status` text NOT NULL,
	`priority` integer DEFAULT 0 NOT NULL,
	`attempts_made` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`delay_until` integer,
	`processed_on` integer,
	`finished_on` integer,
	`failed_reason` text,
	`stacktrace` text,
	`repeat_job_key` text,
	`parent_id` text,
	`worker_id` text,
	`lock_until` integer
);
--> statement-breakpoint
CREATE INDEX `idx_jobs_queue_status_delay_until_priority` ON `jobs` (`queue_name`,`status`,`delay_until`,`priority`);--> statement-breakpoint
CREATE INDEX `idx_jobs_status` ON `jobs` (`status`);--> statement-breakpoint
CREATE INDEX `idx_jobs_repeat_key` ON `jobs` (`repeat_job_key`);--> statement-breakpoint
CREATE INDEX `idx_jobs_worker_id` ON `jobs` (`worker_id`);--> statement-breakpoint
CREATE INDEX `idx_jobs_parent_id` ON `jobs` (`parent_id`);--> statement-breakpoint
CREATE INDEX `idx_jobs_queue_name` ON `jobs` (`queue_name`);