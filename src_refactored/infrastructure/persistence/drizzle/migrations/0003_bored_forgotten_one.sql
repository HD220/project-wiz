PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_jobs` (
	`id` text PRIMARY KEY NOT NULL,
	`queue_name` text NOT NULL,
	`name` text NOT NULL,
	`status` text NOT NULL,
	`payload` text,
	`options` text NOT NULL,
	`return_value` text,
	`logs` text,
	`progress` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`started_at` integer,
	`finished_at` integer,
	`delay_until` integer,
	`attempts` integer DEFAULT 0 NOT NULL,
	`worker_id` text,
	`lock_until` integer,
	`failed_reason_new` text,
	`stacktrace_new` text,
	`attempts_made` integer DEFAULT 0 NOT NULL,
	`processed_on` integer,
	`finished_on` integer,
	`failed_reason` text,
	`stacktrace` text
);
--> statement-breakpoint
INSERT INTO `__new_jobs`("id", "queue_name", "name", "status", "payload", "options", "return_value", "logs", "progress", "created_at", "updated_at", "started_at", "finished_at", "delay_until", "attempts", "worker_id", "lock_until", "failed_reason_new", "stacktrace_new", "attempts_made", "processed_on", "finished_on", "failed_reason", "stacktrace") SELECT "id", "queue_name", "name", "status", "payload", "options", "return_value", "logs", "progress", "created_at", "updated_at", "started_at", "finished_at", "delay_until", "attempts", "worker_id", "lock_until", "failed_reason_new", "stacktrace_new", "attempts_made", "processed_on", "finished_on", "failed_reason", "stacktrace" FROM `jobs`;--> statement-breakpoint
DROP TABLE `jobs`;--> statement-breakpoint
ALTER TABLE `__new_jobs` RENAME TO `jobs`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `jobs_queue_name_idx` ON `jobs` (`queue_name`);--> statement-breakpoint
CREATE INDEX `jobs_status_idx` ON `jobs` (`status`);--> statement-breakpoint
CREATE INDEX `jobs_delay_until_idx` ON `jobs` (`delay_until`);--> statement-breakpoint
CREATE INDEX `jobs_queue_status_idx` ON `jobs` (`queue_name`,`status`);