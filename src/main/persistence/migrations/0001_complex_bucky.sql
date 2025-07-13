CREATE TABLE `project_personas` (
	`project_id` text NOT NULL,
	`persona_id` text NOT NULL,
	`added_at` integer NOT NULL,
	`added_by` text NOT NULL,
	PRIMARY KEY(`project_id`, `persona_id`)
);
