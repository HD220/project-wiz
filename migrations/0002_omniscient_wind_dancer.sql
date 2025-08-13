CREATE TABLE `agent_memory` (
	`memory_id` text NOT NULL,
	`agent_id` text NOT NULL,
	PRIMARY KEY(`memory_id`, `agent_id`),
	FOREIGN KEY (`memory_id`) REFERENCES `memory`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`agent_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `agent_memory_agent_idx` ON `agent_memory` (`agent_id`);--> statement-breakpoint
CREATE TABLE `memory` (
	`id` text PRIMARY KEY NOT NULL,
	`content` text NOT NULL,
	`embedding` text,
	`created_by` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch('subsec') * 1000) NOT NULL,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `memory_created_by_idx` ON `memory` (`created_by`);--> statement-breakpoint
CREATE INDEX `memory_created_at_idx` ON `memory` (`created_at`);--> statement-breakpoint
CREATE TABLE `project_memory` (
	`memory_id` text NOT NULL,
	`project_id` text NOT NULL,
	PRIMARY KEY(`memory_id`, `project_id`),
	FOREIGN KEY (`memory_id`) REFERENCES `memory`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `project_memory_project_idx` ON `project_memory` (`project_id`);--> statement-breakpoint
CREATE TABLE `team_memory` (
	`memory_id` text NOT NULL,
	`project_id` text NOT NULL,
	PRIMARY KEY(`memory_id`, `project_id`),
	FOREIGN KEY (`memory_id`) REFERENCES `memory`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `team_memory_project_idx` ON `team_memory` (`project_id`);