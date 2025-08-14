-- Migration: Refactor llm_jobs to jobs with improved queue system
-- Rename table and update structure for single worker, 15 concurrent jobs

-- Create new jobs table with improved structure
CREATE TABLE `jobs` (
	`id` text PRIMARY KEY NOT NULL,
	`queue_name` text NOT NULL,
	`data` text NOT NULL,
	`opts` text,
	`status` text DEFAULT 'waiting' NOT NULL,
	`priority` integer DEFAULT 0 NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`max_attempts` integer DEFAULT 3 NOT NULL,
	`delay_ms` integer DEFAULT 0 NOT NULL,
	`scheduled_for` integer,
	`result` text,
	`failure_reason` text,
	`worker_id` text,
	`created_at` integer DEFAULT (unixepoch('subsec') * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch('subsec') * 1000) NOT NULL,
	`processed_on` integer,
	`finished_on` integer
);
--> statement-breakpoint

-- Migrate data from llm_jobs to jobs (mapping old structure to new)
INSERT INTO `jobs` (
	`id`,
	`queue_name`,
	`data`,
	`opts`,
	`status`,
	`priority`,
	`attempts`,
	`max_attempts`,
	`delay_ms`,
	`scheduled_for`,
	`result`,
	`failure_reason`,
	`created_at`,
	`updated_at`,
	`processed_on`,
	`finished_on`
)
SELECT 
	`id`,
	COALESCE(`name`, 'default') as `queue_name`, -- Map name to queue_name
	`data`,
	`opts`,
	`status`,
	`priority`,
	`attempts`,
	`max_attempts`,
	0 as `delay_ms`, -- Reset delay_ms to 0
	CASE 
		WHEN `status` = 'delayed' AND `delay` > 0 
		THEN `delay` 
		ELSE NULL 
	END as `scheduled_for`, -- Convert old delay to scheduled_for
	`result`,
	`failure_reason`,
	`created_at`,
	`created_at` as `updated_at`, -- Set updated_at to created_at initially
	`processed_on`,
	`finished_on`
FROM `llm_jobs`;
--> statement-breakpoint

-- Create optimized indexes for single worker, 15 concurrent jobs
CREATE INDEX `jobs_queue_status_idx` ON `jobs` (`queue_name`,`status`,`priority`);
--> statement-breakpoint
CREATE INDEX `jobs_scheduled_idx` ON `jobs` (`scheduled_for`);
--> statement-breakpoint
CREATE INDEX `jobs_worker_idx` ON `jobs` (`worker_id`);
--> statement-breakpoint

-- Drop old table and indexes
DROP INDEX `llm_jobs_queue_processing_idx`;
--> statement-breakpoint
DROP INDEX `llm_jobs_dependencies_idx`;
--> statement-breakpoint
DROP INDEX `llm_jobs_delayed_idx`;
--> statement-breakpoint
DROP INDEX `llm_jobs_status_idx`;
--> statement-breakpoint
DROP INDEX `llm_jobs_name_idx`;
--> statement-breakpoint
DROP INDEX `llm_jobs_created_at_idx`;
--> statement-breakpoint
DROP INDEX `llm_jobs_parent_job_id_idx`;
--> statement-breakpoint
DROP TABLE `llm_jobs`;