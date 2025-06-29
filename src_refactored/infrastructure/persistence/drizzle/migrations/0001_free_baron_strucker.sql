PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_jobs` (
	`id` text PRIMARY KEY NOT NULL,
	`queue_name` text NOT NULL,
	`name` text NOT NULL,
	`payload` text NOT NULL,
	`options` text NOT NULL,
	`status` text NOT NULL,
	`attempts_made` integer NOT NULL,
	`progress` text NOT NULL,
	`logs` text NOT NULL,
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
INSERT INTO `__new_jobs`("id", "queue_name", "name", "payload", "options", "status", "attempts_made", "progress", "logs", "created_at", "updated_at", "processed_on", "finished_on", "delay_until", "lock_until", "worker_id", "return_value", "failed_reason", "stacktrace") SELECT "id", "queue_name", "name", "payload", "options", "status", "attempts_made", "progress", "logs", "created_at", "updated_at", "processed_on", "finished_on", "delay_until", "lock_until", "worker_id", "return_value", "failed_reason", "stacktrace" FROM `jobs`;--> statement-breakpoint
DROP TABLE `jobs`;--> statement-breakpoint
ALTER TABLE `__new_jobs` RENAME TO `jobs`;--> statement-breakpoint
PRAGMA foreign_keys=ON;