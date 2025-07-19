-- Custom SQL migration file, put your code below! --

-- Refatoração da tabela users e implementação do sistema de conversas
-- Esta migração implementa as seguintes mudanças:
-- 1. Remove username, passwordHash, theme da tabela users
-- 2. Adiciona type à tabela users
-- 3. Cria tabela accounts para dados de autenticação
-- 4. Cria tabela user_preferences para configurações
-- 5. Cria sistema de conversas e mensagens

-- PASSO 1: Criar novas tabelas

-- Tabela accounts (dados de autenticação)
CREATE TABLE `accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`username` text NOT NULL,
	`password_hash` text NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);

CREATE UNIQUE INDEX `accounts_username_unique` ON `accounts` (`username`);

-- Tabela user_preferences (configurações)
CREATE TABLE `user_preferences` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`theme` text DEFAULT 'system' NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);

-- Tabela conversations
CREATE TABLE `conversations` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`description` text,
	`type` text DEFAULT 'dm' NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Tabela conversation_participants
CREATE TABLE `conversation_participants` (
	`id` text PRIMARY KEY NOT NULL,
	`conversation_id` text NOT NULL,
	`participant_id` text NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`participant_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);

-- Tabela messages
CREATE TABLE `messages` (
	`id` text PRIMARY KEY NOT NULL,
	`conversation_id` text NOT NULL,
	`author_id` text NOT NULL,
	`content` text NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);

-- Tabela llm_messages
CREATE TABLE `llm_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`message_id` text NOT NULL,
	`role` text NOT NULL,
	`tool_calls` text,
	`metadata` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`message_id`) REFERENCES `messages`(`id`) ON UPDATE no action ON DELETE no action
);

-- PASSO 2: Migrar dados existentes

-- Migrar dados de autenticação para a tabela accounts
INSERT INTO `accounts` (`id`, `user_id`, `username`, `password_hash`, `created_at`, `updated_at`)
SELECT 
    hex(randomblob(16)) as id,
    `id` as user_id,
    `username`,
    `password_hash`,
    `created_at`,
    `updated_at`
FROM `users`;

-- Migrar preferências para a tabela user_preferences
INSERT INTO `user_preferences` (`id`, `user_id`, `theme`, `created_at`, `updated_at`)
SELECT 
    hex(randomblob(16)) as id,
    `id` as user_id,
    `theme`,
    `created_at`,
    `updated_at`
FROM `users`;

-- PASSO 3: Modificar tabela users
-- Criar tabela temporária com nova estrutura
CREATE TABLE `users_new` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`avatar` text,
	`type` text DEFAULT 'human' NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Migrar dados para nova estrutura
INSERT INTO `users_new` (`id`, `name`, `avatar`, `type`, `created_at`, `updated_at`)
SELECT 
    `id`,
    `name`,
    `avatar`,
    'human' as type,
    `created_at`,
    `updated_at`
FROM `users`;

-- Remover tabela antiga e renomear
DROP TABLE `users`;
ALTER TABLE `users_new` RENAME TO `users`;