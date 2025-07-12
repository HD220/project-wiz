CREATE TABLE `channel_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`content` text NOT NULL,
	`channel_id` text NOT NULL,
	`author_id` text NOT NULL,
	`author_name` text NOT NULL,
	`type` text DEFAULT 'text' NOT NULL,
	`metadata` text,
	`is_edited` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
