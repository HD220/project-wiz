CREATE TABLE `jobs` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`data` text NOT NULL,
	`opts` text NOT NULL,
	`status` text NOT NULL,
	`priority` integer NOT NULL,
	`delay` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`started_at` integer,
	`finished_at` integer,
	`failed_reason` text
);
