CREATE TABLE `conversations` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`name` text,
	`participants` text NOT NULL,
	`project_id` text NOT NULL,
	`is_archived` integer DEFAULT false NOT NULL,
	`last_message_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` text PRIMARY KEY NOT NULL,
	`content` text NOT NULL,
	`sender_id` text NOT NULL,
	`sender_name` text NOT NULL,
	`sender_type` text NOT NULL,
	`message_type` text NOT NULL,
	`conversation_id` text NOT NULL,
	`is_edited` integer DEFAULT false NOT NULL,
	`edited_at` integer,
	`reply_to` text,
	`mentions` text,
	`attachments` text,
	`metadata` text,
	`created_at` integer NOT NULL
);
