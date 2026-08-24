ALTER TABLE `athletes` ADD `age_group` text;--> statement-breakpoint
ALTER TABLE `athletes` ADD `ability_class` text;--> statement-breakpoint
ALTER TABLE `athletes` ADD `availability_status` text DEFAULT 'Active' NOT NULL;