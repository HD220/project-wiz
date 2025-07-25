ALTER TABLE `conversations` ADD `archived_at` integer;--> statement-breakpoint
ALTER TABLE `conversations` ADD `archived_by` text REFERENCES users(id);--> statement-breakpoint
ALTER TABLE `conversations` ADD `archived_reason` text;--> statement-breakpoint
CREATE INDEX `conversations_archived_by_idx` ON `conversations` (`archived_by`);--> statement-breakpoint
CREATE INDEX `conversations_archived_at_idx` ON `conversations` (`archived_at`);--> statement-breakpoint
CREATE INDEX `conversations_is_active_archived_at_idx` ON `conversations` (`is_active`,`archived_at`);