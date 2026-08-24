CREATE TABLE `athlete_session_exclusions` (
	`athlete_id` text NOT NULL,
	`session_id` text NOT NULL,
	`reason` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`athlete_id`) REFERENCES `athletes`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_athlete_session_exclusions_athlete_session` ON `athlete_session_exclusions` (`athlete_id`,`session_id`);--> statement-breakpoint
CREATE TABLE `athlete_training_groups` (
	`athlete_id` text NOT NULL,
	`group_id` text NOT NULL,
	`primary_group` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`athlete_id`) REFERENCES `athletes`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`group_id`) REFERENCES `training_groups`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_athlete_training_groups_athlete_group` ON `athlete_training_groups` (`athlete_id`,`group_id`);--> statement-breakpoint
CREATE TABLE `athletes` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text,
	`phone` text,
	`seat_side` text NOT NULL,
	`scull` text DEFAULT 'No' NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`password_hash` text,
	`invite_token_hash` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_athletes_email` ON `athletes` (`email`);--> statement-breakpoint
CREATE TABLE `audit_events` (
	`id` text PRIMARY KEY NOT NULL,
	`actor_id` text,
	`actor_name` text NOT NULL,
	`action` text NOT NULL,
	`entity_kind` text NOT NULL,
	`entity_id` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `coach_accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`password_salt` text NOT NULL,
	`role` text DEFAULT 'coach' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `history_snapshots` (
	`id` text PRIMARY KEY NOT NULL,
	`week_label` text NOT NULL,
	`locked_at` integer NOT NULL,
	`sheet_sync_status` text NOT NULL,
	`sheet_range` text,
	`summary_json` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `programs` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `reminder_events` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`athlete_id` text NOT NULL,
	`channel` text NOT NULL,
	`sent_at` integer NOT NULL,
	`status` text NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`athlete_id`) REFERENCES `athletes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `schedule_templates` (
	`id` text PRIMARY KEY NOT NULL,
	`group_id` text NOT NULL,
	`weekday` integer NOT NULL,
	`time` text NOT NULL,
	`title` text NOT NULL,
	`location` text NOT NULL,
	`coach` text,
	`active` integer DEFAULT true NOT NULL,
	FOREIGN KEY (`group_id`) REFERENCES `training_groups`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `session_groups` (
	`session_id` text NOT NULL,
	`group_id` text NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`group_id`) REFERENCES `training_groups`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_session_groups_session_group` ON `session_groups` (`session_id`,`group_id`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`template_id` text,
	`title` text NOT NULL,
	`starts_at` integer NOT NULL,
	`cutoff_at` integer NOT NULL,
	`reminder_at` integer NOT NULL,
	`location` text NOT NULL,
	`coach` text,
	`locked_at` integer,
	`history_snapshot_id` text,
	FOREIGN KEY (`template_id`) REFERENCES `schedule_templates`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `sheet_sync_jobs` (
	`id` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`target_sheet` text NOT NULL,
	`target_range` text,
	`payload_json` text NOT NULL,
	`status` text NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`last_error` text,
	`created_at` integer NOT NULL,
	`synced_at` integer
);
--> statement-breakpoint
CREATE TABLE `signups` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`athlete_id` text NOT NULL,
	`status` text NOT NULL,
	`note` text,
	`updated_at` integer NOT NULL,
	`updated_by` text NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`athlete_id`) REFERENCES `athletes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_signups_session_athlete` ON `signups` (`session_id`,`athlete_id`);--> statement-breakpoint
CREATE TABLE `training_groups` (
	`id` text PRIMARY KEY NOT NULL,
	`program_id` text NOT NULL,
	`name` text NOT NULL,
	`default_cutoff_hours` integer NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	FOREIGN KEY (`program_id`) REFERENCES `programs`(`id`) ON UPDATE no action ON DELETE no action
);
