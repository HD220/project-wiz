CREATE TABLE `agents` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`role` text NOT NULL,
	`expertise` text,
	`personality` text,
	`system_prompt` text NOT NULL,
	`avatar_url` text,
	`status` text DEFAULT 'online' NOT NULL,
	`is_global` integer DEFAULT true,
	`llm_provider` text DEFAULT 'deepseek',
	`llm_model` text DEFAULT 'deepseek-chat',
	`temperature` real DEFAULT 0.7,
	`max_tokens` integer DEFAULT 4000,
	`created_by` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `channels` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`type` text DEFAULT 'text' NOT NULL,
	`position` integer DEFAULT 0,
	`is_private` integer DEFAULT false,
	`permissions` text,
	`created_by` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `dm_conversations` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`agent_id` text NOT NULL,
	`is_active` integer DEFAULT true,
	`is_pinned` integer DEFAULT false,
	`last_message_at` integer,
	`last_read_at` integer,
	`unread_count` integer DEFAULT 0,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`agent_id`) REFERENCES `agents`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `forum_posts` (
	`id` text PRIMARY KEY NOT NULL,
	`topic_id` text NOT NULL,
	`content` text NOT NULL,
	`content_type` text DEFAULT 'markdown',
	`author_id` text NOT NULL,
	`author_type` text NOT NULL,
	`reply_to_id` text,
	`position` integer DEFAULT 0,
	`metadata` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer,
	FOREIGN KEY (`topic_id`) REFERENCES `forum_topics`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`reply_to_id`) REFERENCES `forum_posts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `forum_topics` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`status` text DEFAULT 'open',
	`priority` text DEFAULT 'medium',
	`category` text,
	`tags` text,
	`created_by` text NOT NULL,
	`created_by_type` text NOT NULL,
	`view_count` integer DEFAULT 0,
	`post_count` integer DEFAULT 0,
	`last_activity_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `issue_activities` (
	`id` text PRIMARY KEY NOT NULL,
	`issue_id` text NOT NULL,
	`activity_type` text NOT NULL,
	`description` text NOT NULL,
	`old_value` text,
	`new_value` text,
	`actor_id` text NOT NULL,
	`actor_type` text NOT NULL,
	`metadata` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`issue_id`) REFERENCES `issues`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `issue_comments` (
	`id` text PRIMARY KEY NOT NULL,
	`issue_id` text NOT NULL,
	`content` text NOT NULL,
	`content_type` text DEFAULT 'markdown',
	`author_id` text NOT NULL,
	`author_type` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer,
	FOREIGN KEY (`issue_id`) REFERENCES `issues`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `issues` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`status` text DEFAULT 'todo' NOT NULL,
	`priority` text DEFAULT 'medium',
	`type` text DEFAULT 'task',
	`assignee_id` text,
	`assignee_type` text,
	`estimated_hours` real,
	`actual_hours` real,
	`story_points` integer,
	`labels` text,
	`git_branch` text,
	`git_commits` text,
	`pull_request_url` text,
	`metadata` text,
	`created_by` text NOT NULL,
	`created_by_type` text NOT NULL,
	`due_date` integer,
	`started_at` integer,
	`completed_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` text PRIMARY KEY NOT NULL,
	`channel_id` text,
	`dm_conversation_id` text,
	`content` text NOT NULL,
	`content_type` text DEFAULT 'text',
	`author_id` text NOT NULL,
	`author_type` text NOT NULL,
	`message_type` text DEFAULT 'text',
	`metadata` text,
	`reply_to_id` text,
	`thread_id` text,
	`created_at` integer NOT NULL,
	`updated_at` integer,
	`deleted_at` integer,
	FOREIGN KEY (`channel_id`) REFERENCES `channels`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`dm_conversation_id`) REFERENCES `dm_conversations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`reply_to_id`) REFERENCES `messages`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`git_url` text,
	`local_path` text,
	`icon_url` text,
	`icon_emoji` text,
	`visibility` text DEFAULT 'private',
	`status` text DEFAULT 'active',
	`settings` text,
	`owner_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `project_agents` (
	`project_id` text NOT NULL,
	`agent_id` text NOT NULL,
	`role` text,
	`permissions` text,
	`is_active` integer DEFAULT true,
	`added_by` text NOT NULL,
	`added_at` integer NOT NULL,
	`removed_at` integer,
	PRIMARY KEY(`project_id`, `agent_id`),
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`agent_id`) REFERENCES `agents`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`added_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `project_users` (
	`project_id` text NOT NULL,
	`user_id` text NOT NULL,
	`role` text DEFAULT 'member',
	`permissions` text,
	`joined_at` integer NOT NULL,
	`left_at` integer,
	PRIMARY KEY(`project_id`, `user_id`),
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`email` text,
	`password_hash` text NOT NULL,
	`display_name` text NOT NULL,
	`avatar_url` text,
	`bio` text,
	`preferences` text,
	`is_active` integer DEFAULT true,
	`last_login_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);