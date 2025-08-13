ALTER TABLE `users` ADD `status` text DEFAULT 'offline' NOT NULL;--> statement-breakpoint
CREATE INDEX `users_status_idx` ON `users` (`status`);