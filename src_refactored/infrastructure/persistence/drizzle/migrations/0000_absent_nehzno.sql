CREATE TABLE `jobs` (
	`id` text PRIMARY KEY NOT NULL,
	`queue_name` text NOT NULL,
	`name` text NOT NULL,
	`status` text NOT NULL,
	`payload` text,
	`options` text,
	`return_value` text,
	`error` text,
	`logs` text,
	`progress` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`started_at` integer,
	`finished_at` integer,
	`delay_until` integer,
	`attempts` integer DEFAULT 0 NOT NULL,
	`max_attempts` integer,
	`worker_id` text,
	`lock_until` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `queue_name_idx` ON `jobs` (`queue_name`);--> statement-breakpoint
CREATE UNIQUE INDEX `status_idx` ON `jobs` (`status`);