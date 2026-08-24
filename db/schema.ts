import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const programs = sqliteTable("programs", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

export const trainingGroups = sqliteTable("training_groups", {
  id: text("id").primaryKey(),
  programId: text("program_id").notNull().references(() => programs.id),
  name: text("name").notNull(),
  defaultCutoffHours: integer("default_cutoff_hours").notNull(),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
});

export const athletes = sqliteTable(
  "athletes",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email"),
    phone: text("phone"),
    seatSide: text("seat_side").notNull(),
    scull: text("scull").notNull().default("No"),
    ageGroup: text("age_group"),
    abilityClass: text("ability_class"),
    availabilityStatus: text("availability_status").notNull().default("Active"),
    active: integer("active", { mode: "boolean" }).notNull().default(true),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [
    uniqueIndex("idx_athletes_email").on(table.email),
  ],
);

export const athleteTrainingGroups = sqliteTable(
  "athlete_training_groups",
  {
    athleteId: text("athlete_id").notNull().references(() => athletes.id),
    groupId: text("group_id").notNull().references(() => trainingGroups.id),
    primaryGroup: integer("primary_group", { mode: "boolean" }).notNull().default(false),
  },
  (table) => [
    uniqueIndex("idx_athlete_training_groups_athlete_group").on(table.athleteId, table.groupId),
  ],
);

export const scheduleTemplates = sqliteTable("schedule_templates", {
  id: text("id").primaryKey(),
  groupId: text("group_id").notNull().references(() => trainingGroups.id),
  weekday: integer("weekday").notNull(),
  time: text("time").notNull(),
  title: text("title").notNull(),
  location: text("location").notNull(),
  coach: text("coach"),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
});

export const coachAccounts = sqliteTable("coach_accounts", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  passwordHash: text("password_hash").notNull(),
  passwordSalt: text("password_salt").notNull(),
  role: text("role").notNull().default("coach"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  templateId: text("template_id").references(() => scheduleTemplates.id),
  title: text("title").notNull(),
  startsAt: integer("starts_at", { mode: "timestamp_ms" }).notNull(),
  cutoffAt: integer("cutoff_at", { mode: "timestamp_ms" }).notNull(),
  reminderAt: integer("reminder_at", { mode: "timestamp_ms" }).notNull(),
  location: text("location").notNull(),
  coach: text("coach"),
  lockedAt: integer("locked_at", { mode: "timestamp_ms" }),
  historySnapshotId: text("history_snapshot_id"),
});

export const sessionGroups = sqliteTable(
  "session_groups",
  {
    sessionId: text("session_id").notNull().references(() => sessions.id),
    groupId: text("group_id").notNull().references(() => trainingGroups.id),
  },
  (table) => [
    uniqueIndex("idx_session_groups_session_group").on(table.sessionId, table.groupId),
  ],
);

export const athleteSessionExclusions = sqliteTable(
  "athlete_session_exclusions",
  {
    athleteId: text("athlete_id").notNull().references(() => athletes.id),
    sessionId: text("session_id").notNull().references(() => sessions.id),
    reason: text("reason"),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [
    uniqueIndex("idx_athlete_session_exclusions_athlete_session").on(table.athleteId, table.sessionId),
  ],
);

export const signups = sqliteTable(
  "signups",
  {
    id: text("id").primaryKey(),
    sessionId: text("session_id").notNull().references(() => sessions.id),
    athleteId: text("athlete_id").notNull().references(() => athletes.id),
    status: text("status").notNull(),
    note: text("note"),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
    updatedBy: text("updated_by").notNull(),
  },
  (table) => [
    uniqueIndex("idx_signups_session_athlete").on(table.sessionId, table.athleteId),
  ],
);

export const auditEvents = sqliteTable("audit_events", {
  id: text("id").primaryKey(),
  actorId: text("actor_id"),
  actorName: text("actor_name").notNull(),
  action: text("action").notNull(),
  entityKind: text("entity_kind").notNull(),
  entityId: text("entity_id"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

export const reminderEvents = sqliteTable("reminder_events", {
  id: text("id").primaryKey(),
  sessionId: text("session_id").notNull().references(() => sessions.id),
  athleteId: text("athlete_id").notNull().references(() => athletes.id),
  channel: text("channel").notNull(),
  sentAt: integer("sent_at", { mode: "timestamp_ms" }).notNull(),
  status: text("status").notNull(),
});

export const historySnapshots = sqliteTable("history_snapshots", {
  id: text("id").primaryKey(),
  weekLabel: text("week_label").notNull(),
  lockedAt: integer("locked_at", { mode: "timestamp_ms" }).notNull(),
  sheetSyncStatus: text("sheet_sync_status").notNull(),
  sheetRange: text("sheet_range"),
  summaryJson: text("summary_json").notNull(),
});

export const sheetSyncJobs = sqliteTable("sheet_sync_jobs", {
  id: text("id").primaryKey(),
  kind: text("kind").notNull(),
  targetSheet: text("target_sheet").notNull(),
  targetRange: text("target_range"),
  payloadJson: text("payload_json").notNull(),
  status: text("status").notNull(),
  attempts: integer("attempts").notNull().default(0),
  lastError: text("last_error"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  syncedAt: integer("synced_at", { mode: "timestamp_ms" }),
});

export const appState = sqliteTable("app_state", {
  key: text("key").primaryKey(),
  valueJson: text("value_json").notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});
