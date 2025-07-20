-- Add agent_id column to conversations table for agent chat support
-- This column will be null for human-to-human conversations and set for agent chats

ALTER TABLE `conversations` ADD COLUMN `agent_id` text REFERENCES `agents`(`id`);

-- Update conversation type to support agent_chat
-- Note: SQLite doesn't support ALTER COLUMN, so we need to handle this in application logic
-- The schema is already updated to support 'agent_chat' type