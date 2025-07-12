ALTER TABLE `conversations` DROP COLUMN `type`;--> statement-breakpoint
ALTER TABLE `conversations` DROP COLUMN `name`;--> statement-breakpoint
ALTER TABLE `conversations` DROP COLUMN `project_id`;--> statement-breakpoint
ALTER TABLE `conversations` DROP COLUMN `is_archived`;--> statement-breakpoint
ALTER TABLE `conversations` DROP COLUMN `updated_at`;--> statement-breakpoint
ALTER TABLE `messages` DROP COLUMN `message_type`;--> statement-breakpoint
ALTER TABLE `messages` DROP COLUMN `is_edited`;--> statement-breakpoint
ALTER TABLE `messages` DROP COLUMN `edited_at`;--> statement-breakpoint
ALTER TABLE `messages` DROP COLUMN `reply_to`;--> statement-breakpoint
ALTER TABLE `messages` DROP COLUMN `mentions`;--> statement-breakpoint
ALTER TABLE `messages` DROP COLUMN `attachments`;--> statement-breakpoint
ALTER TABLE `messages` DROP COLUMN `metadata`;