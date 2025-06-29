CREATE TABLE `jobs` (
	`id` text PRIMARY KEY NOT NULL,
	`queue_name` text NOT NULL,
	`name` text NOT NULL,
	`payload` text,
	`options` text NOT NULL,
	`status` text NOT NULL,
	`attempts_made` integer DEFAULT 0 NOT NULL,
	`progress` text,
	`logs` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`processed_on` integer,
	`finished_on` integer,
	`delay_until` integer,
	`lock_until` integer,
	`worker_id` text,
	`return_value` text,
	`failed_reason` text,
	`stacktrace` text
);
--> statement-breakpoint
CREATE INDEX `jobs_queue_name_idx` ON `jobs` (`queue_name`);--> statement-breakpoint
CREATE INDEX `jobs_status_idx` ON `jobs` (`status`);--> statement-breakpoint
CREATE INDEX `jobs_delay_until_idx` ON `jobs` (`delay_until`);--> statement-breakpoint
CREATE INDEX `jobs_queue_status_idx` ON `jobs` (`queue_name`,`status`);--> statement-breakpoint
CREATE INDEX `jobs_worker_id_idx` ON `jobs` (`worker_id`);--> statement-breakpoint
CREATE INDEX `jobs_lock_until_idx` ON `jobs` (`lock_until`);