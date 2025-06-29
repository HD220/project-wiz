CREATE TABLE `jobs` (
	`id` text PRIMARY KEY NOT NULL,
	`queue_name` text NOT NULL,
	`job_name` text NOT NULL,
	`payload` blob NOT NULL,
	`job_options` blob NOT NULL,
	`return_value` blob,
	`execution_logs` blob NOT NULL,
	`progress` blob NOT NULL,
	`status` text NOT NULL,
	`priority` integer DEFAULT 0 NOT NULL,
	`attempts_made` integer DEFAULT 0 NOT NULL,
	`max_attempts` integer DEFAULT 1 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`process_at` integer,
	`started_at` integer,
	`completed_at` integer,
	`failed_at` integer,
	`failed_reason` text,
	`repeat_job_key` text,
	`parent_id` text,
	`locked_by_worker_id` text,
	`lock_expires_at` integer
);
--> statement-breakpoint
CREATE INDEX `idx_jobs_queue_status_process_at_priority` ON `jobs` (`queue_name`,`status`,`process_at`,`priority`);--> statement-breakpoint
CREATE INDEX `idx_jobs_status` ON `jobs` (`status`);--> statement-breakpoint
CREATE INDEX `idx_jobs_repeat_key` ON `jobs` (`repeat_job_key`);--> statement-breakpoint
CREATE INDEX `idx_jobs_locked_worker_id` ON `jobs` (`locked_by_worker_id`);--> statement-breakpoint
CREATE INDEX `idx_jobs_parent_id` ON `jobs` (`parent_id`);--> statement-breakpoint
CREATE INDEX `idx_jobs_queue_name` ON `jobs` (`queue_name`);--> statement-breakpoint
CREATE TABLE `repeatable_job_schedules` (
	`id` text PRIMARY KEY NOT NULL,
	`queue_name` text NOT NULL,
	`job_name` text NOT NULL,
	`cron_pattern` text,
	`every` integer,
	`job_data` blob,
	`job_options` blob,
	`timezone` text DEFAULT 'UTC',
	`limit` integer,
	`start_date` integer,
	`end_date` integer,
	`next_run_at` integer NOT NULL,
	`last_run_job_id` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`is_enabled` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_repeatable_schedules_enabled_next_run` ON `repeatable_job_schedules` (`is_enabled`,`next_run_at`);--> statement-breakpoint
CREATE INDEX `idx_repeatable_schedules_queue_name` ON `repeatable_job_schedules` (`queue_name`);