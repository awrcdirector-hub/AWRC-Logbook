"use client";

import { Fragment, useEffect, useMemo, useState } from "react";

type Athlete = {
  id: string;
  name: string;
  groupIds: string[];
  excludedSessionIds?: string[];
  optionalSessionIds?: string[];
  seatSide: "Stroke" | "Bow" | "Both";
  scull?: "Yes" | "No";
  ageGroup?: string;
  abilityClass?: string;
  availabilityStatus?: "Active" | "Inactive";
};

type Session = {
  id: string;
  title: string;
  groupIds: string[];
  optional?: boolean;
  date: string;
  time: string;
  startsAt: string;
  cutoffAt: string;
  cutoff: string;
  coach: string;
  location: string;
  crewTarget: number;
  locked: boolean;
};

type SignupStatus = "attending" | "not-attending" | "injured";
type SignupMap = Record<string, Record<string, SignupStatus>>;
type SheetRow = Array<string | number>;
type SheetSyncResult = {
  configured?: boolean;
  message?: string;
  rowCount?: number;
  status?: string;
  targetSheet?: string;
};
type AuditEvent = {
  id: string;
  at: string;
  actor: string;
  action: string;
};

type ScheduleTemplate = {
  id: string;
  groupId: string;
  weekday: number;
  time: string;
  title: string;
  location: string;
  coach: string;
  crewTarget: number;
};

const squadGroupId = "squad";

const programGroups = [
  {
    id: squadGroupId,
    name: "Squad",
    program: "Whole Club Program",
    athletes: 0,
    schedule: "Blanket sessions for all active athletes",
    nextCutoff: "Session cutoff",
  },
  {
    id: "open-female",
    name: "Open Female",
    program: "Junior Competitive",
    athletes: 24,
    schedule: "Mon/Wed/Fri PM + Sat AM",
    nextCutoff: "Today 7:00 PM",
  },
  {
    id: "open-male",
    name: "Open Male",
    program: "Junior Competitive",
    athletes: 19,
    schedule: "Tue/Thu PM + Sat AM",
    nextCutoff: "Thu 7:00 PM",
  },
  {
    id: "novice",
    name: "Novice",
    program: "Development",
    athletes: 4,
    schedule: "Wed PM + Sun AM",
    nextCutoff: "Wed 12:00 PM",
  },
  {
    id: "coxswain",
    name: "Coxswain",
    program: "Coxswain Development",
    athletes: 0,
    schedule: "Assigned across crews",
    nextCutoff: "Session cutoff",
  },
];

const athletes: Athlete[] = [
  { id: "addison-jenkins", name: "Addison Jenkins", groupIds: ["open-female"], seatSide: "Both" },
  { id: "ava-mcdonough", name: "Ava McDonough", groupIds: ["open-female"], seatSide: "Both" },
  { id: "ava-overton", name: "Ava Overton", groupIds: ["open-female"], seatSide: "Both" },
  { id: "bailey-barnett", name: "Bailey Barnett", groupIds: ["open-female"], seatSide: "Both" },
  { id: "becky-roy", name: "Becky Roy", groupIds: ["open-female"], seatSide: "Both" },
  { id: "caralie-hanna", name: "Caralie Hanna", groupIds: ["open-female"], seatSide: "Both" },
  { id: "dempsey-schicker", name: "Dempsey Schicker", groupIds: ["open-female"], seatSide: "Both" },
  { id: "dj-paikea", name: "DJ Paikea", groupIds: ["open-female"], seatSide: "Both" },
  { id: "ellie-hewer", name: "Ellie Hewer", groupIds: ["open-female"], seatSide: "Both" },
  { id: "georgia-calman", name: "Georgia Calman", groupIds: ["open-female"], seatSide: "Both" },
  { id: "lauren-davies", name: "Lauren Davies", groupIds: ["open-female", "novice"], seatSide: "Both" },
  { id: "lilee-lambe", name: "Lilee Lambe", groupIds: ["open-female"], seatSide: "Both" },
  { id: "lily-camp", name: "Lily Camp", groupIds: ["open-female"], seatSide: "Both" },
  { id: "lily-newton", name: "Lily Newton", groupIds: ["open-female"], seatSide: "Both" },
  { id: "lily-smith", name: "Lily Smith", groupIds: ["open-female"], seatSide: "Both" },
  { id: "messina-sua", name: "Messina Su'a", groupIds: ["open-female"], seatSide: "Both" },
  { id: "millie-richardson", name: "Millie Richardson", groupIds: ["open-female"], seatSide: "Both" },
  { id: "milly-vivian", name: "Milly Vivian", groupIds: ["open-female"], seatSide: "Both" },
  { id: "myiah-dudson", name: "Myiah Dudson", groupIds: ["open-female"], seatSide: "Both" },
  { id: "robyn-van-dijk", name: "Robyn Van Dijk", groupIds: ["open-female"], seatSide: "Both" },
  { id: "ruby-bullock", name: "Ruby Bullock", groupIds: ["open-female"], seatSide: "Both" },
  { id: "rylee-earles", name: "Rylee Earles", groupIds: ["open-female"], seatSide: "Both" },
  { id: "sophia-kerwin", name: "Sophia Kerwin", groupIds: ["open-female"], seatSide: "Both" },
  { id: "sophia-sua", name: "Sophia Su'a", groupIds: ["open-female"], seatSide: "Both" },
  { id: "achilles-paikea", name: "Achilles Paikea", groupIds: ["open-male"], seatSide: "Both" },
  { id: "bryn-morgan", name: "Bryn Morgan", groupIds: ["open-male"], seatSide: "Both" },
  { id: "callum-morgan", name: "Callum Morgan", groupIds: ["open-male"], seatSide: "Both" },
  { id: "eli-kuehne", name: "Eli Kuehne", groupIds: ["open-male"], seatSide: "Both" },
  { id: "jacob-larsen", name: "Jacob Larsen", groupIds: ["open-male"], seatSide: "Both" },
  { id: "jake-buxton", name: "Jake Buxton", groupIds: ["open-male"], seatSide: "Both" },
  { id: "jake-newton", name: "Jake Newton", groupIds: ["open-male"], seatSide: "Both" },
  { id: "joni-stoehr", name: "Joni Stoehr", groupIds: ["open-male"], seatSide: "Both" },
  { id: "jordan-hallett", name: "Jordan Hallett", groupIds: ["open-male"], seatSide: "Both" },
  { id: "joseph-dudson", name: "Joseph Dudson", groupIds: ["open-male"], seatSide: "Both" },
  { id: "logan-joubert", name: "Logan Joubert", groupIds: ["open-male"], seatSide: "Both" },
  { id: "luca-kuehne", name: "Luca Kuehne", groupIds: ["open-male"], seatSide: "Both" },
  { id: "nicky-maxim", name: "Nicky Maxim", groupIds: ["open-male"], seatSide: "Both" },
  { id: "paul-horster", name: "Paul Horster", groupIds: ["open-male"], seatSide: "Both" },
  { id: "quin-vivian", name: "Quin Vivian", groupIds: ["open-male"], seatSide: "Both" },
  { id: "ross-llaneta", name: "Ross Llaneta", groupIds: ["open-male"], seatSide: "Both" },
  { id: "salvador-mazzieri", name: "Salvador Mazzieri", groupIds: ["open-male"], seatSide: "Both" },
  { id: "sam-knapton", name: "Sam Knapton", groupIds: ["open-male"], seatSide: "Both" },
  { id: "xavier-warren", name: "Xavier Warren", groupIds: ["open-male"], seatSide: "Both" },
  { id: "awatea-tutaki", name: "Awatea Tutaki", groupIds: ["novice"], seatSide: "Both" },
  { id: "hayley-bartlett", name: "Hayley Bartlett", groupIds: ["novice"], seatSide: "Both" },
  { id: "morgan-wood", name: "Morgan Wood", groupIds: ["novice"], seatSide: "Both" },
];

function withSquadGroupIds(groupIds: string[]) {
  return groupIds.includes(squadGroupId) ? groupIds : [...groupIds, squadGroupId];
}

function ensureSquadMembership(athlete: Athlete) {
  return { ...athlete, groupIds: withSquadGroupIds(athlete.groupIds) };
}

function normalizeAthleteRoster(athleteList: Athlete[]) {
  return athleteList.map(ensureSquadMembership);
}

const scheduleTemplates: ScheduleTemplate[] = [
  {
    id: "open-female-wed-pm",
    groupId: "open-female",
    weekday: 3,
    time: "15:45",
    title: "Open Female - Wed PM",
    location: "AWRC Pontoon",
    coach: "Axel",
    crewTarget: 32,
  },
  {
    id: "novice-wed-pm",
    groupId: "novice",
    weekday: 3,
    time: "15:45",
    title: "Novice - Wed PM",
    location: "AWRC Pontoon",
    coach: "Axel",
    crewTarget: 12,
  },
  {
    id: "open-male-thu-pm",
    groupId: "open-male",
    weekday: 4,
    time: "17:30",
    title: "Open Male - Thu PM",
    location: "AWRC Pontoon",
    coach: "Axel",
    crewTarget: 28,
  },
  {
    id: "open-sat-am",
    groupId: "open-female",
    weekday: 6,
    time: "07:30",
    title: "Open Squad - Sat AM",
    location: "AWRC Pontoon",
    coach: "Axel",
    crewTarget: 16,
  },
];

const weekdayOptions = [
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
  { value: 0, label: "Sunday" },
];

const manualSessions: Session[] = [
  {
    id: "sat-am",
    title: "Saturday, 7:30am, 15/8/26",
    groupIds: ["open-female", "open-male", "coxswain"],
    optional: false,
    date: "15 Aug",
    time: "7:30 AM",
    startsAt: "2026-08-15T07:30:00+12:00",
    cutoffAt: "2026-08-14T17:00:00+12:00",
    cutoff: "Fri 5:00 PM",
    coach: "Axel",
    location: "AWRC Pontoon",
    crewTarget: 16,
    locked: false,
  },
];

const initialSignups: SignupMap = {
  "open-female-wed-pm-2026-08-12": {
    "addison-jenkins": "attending",
    "ava-overton": "attending",
    "lauren-davies": "attending",
  },
  "open-male-thu-pm-2026-08-13": {
    "achilles-paikea": "attending",
    "bryn-morgan": "attending",
    "callum-morgan": "attending",
  },
  "sat-am": {
    "addison-jenkins": "attending",
    "ava-mcdonough": "attending",
    "ava-overton": "attending",
    "achilles-paikea": "attending",
    "bryn-morgan": "attending",
    "xavier-warren": "attending",
  },
};

function getAthlete(id: string) {
  return athletes.find((athlete) => athlete.id === id);
}

function getGroup(id: string) {
  return programGroups.find((group) => group.id === id);
}

function groupClass(groupId: string) {
  return `group-${groupId}`;
}

function primaryGroupId(athlete: Athlete) {
  return athlete.groupIds[0] ?? "novice";
}

function groupNames(groupIds: string[]) {
  return groupIds.map((id) => getGroup(id)?.name).filter(Boolean).join(" + ");
}

function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatDateLabel(date: Date) {
  return date.toLocaleDateString("en-NZ", { day: "numeric", month: "short" });
}

function formatTimeLabel(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date(Date.UTC(2026, 0, 1, hours, minutes));
  return date
    .toLocaleTimeString("en-NZ", { hour: "numeric", minute: "2-digit", timeZone: "UTC" })
    .replace(/\s/g, "")
    .toLowerCase();
}

function formatSessionTitle(startsAt: Date) {
  const day = startsAt.toLocaleDateString("en-NZ", { weekday: "long" });
  const time = startsAt
    .toLocaleTimeString("en-NZ", { hour: "numeric", minute: "2-digit" })
    .replace(/\s/g, "")
    .toLowerCase();

  return `${day}, ${time}`;
}

function formatSessionDateLine(session: Session, includeWeekday = false) {
  const startsAt = new Date(session.startsAt);
  const date = startsAt.toLocaleDateString("en-NZ", {
    day: "numeric",
    month: "numeric",
    year: "2-digit",
  });
  const weekday = startsAt.toLocaleDateString("en-NZ", { weekday: "long" });
  return `${includeWeekday ? `${weekday}, ` : ""}${date} at ${session.time} - ${session.location}`;
}

function getWeekStartDate(date: Date) {
  const weekStart = new Date(date);
  const day = weekStart.getDay();
  const daysSinceMonday = day === 0 ? 6 : day - 1;
  weekStart.setDate(weekStart.getDate() - daysSinceMonday);
  weekStart.setHours(0, 0, 0, 0);
  return weekStart;
}

function getWeekStartKey(session: Session) {
  return toIsoDate(getWeekStartDate(new Date(session.startsAt)));
}

function formatWeekDividerLabel(session: Session) {
  const weekStart = getWeekStartDate(new Date(session.startsAt));
  return `Week starting ${weekStart.toLocaleDateString("en-NZ", {
    weekday: "long",
    day: "numeric",
    month: "short",
  })}`;
}

function shouldShowWeekDivider(session: Session, index: number, sessionList: Session[]) {
  if (index === 0) return true;
  return getWeekStartKey(session) !== getWeekStartKey(sessionList[index - 1]);
}

function getCutoffAt(startsAt: Date) {
  const cutoffAt = new Date(startsAt);
  if (startsAt.getHours() < 12) {
    cutoffAt.setDate(cutoffAt.getDate() - 1);
    cutoffAt.setHours(17, 0, 0, 0);
  } else {
    cutoffAt.setHours(12, 0, 0, 0);
  }

  return cutoffAt;
}

function buildSession(template: ScheduleTemplate, startsAt: Date): Session {
  const cutoffAt = getCutoffAt(startsAt);
  return {
    id: `${template.id}-${toIsoDate(startsAt)}`,
    title: formatSessionTitle(startsAt),
    groupIds: [template.groupId],
    date: formatDateLabel(startsAt),
    time: formatTimeLabel(template.time),
    startsAt: startsAt.toISOString(),
    cutoffAt: cutoffAt.toISOString(),
    cutoff: cutoffAt.toLocaleString("en-NZ", { weekday: "short", hour: "numeric", minute: "2-digit" }),
    coach: template.coach,
    location: template.location,
    crewTarget: template.crewTarget,
    locked: false,
  };
}

function generateRecurringSessions(templates: ScheduleTemplate[], weekCount = 3) {
  const anchor = new Date("2026-08-10T00:00:00+12:00");
  const generated: Session[] = [];

  for (let week = 0; week < weekCount; week += 1) {
    for (const template of templates) {
      const [hours, minutes] = template.time.split(":").map(Number);
      const startsAt = new Date(anchor);
      startsAt.setDate(anchor.getDate() + week * 7 + template.weekday - 1);
      startsAt.setHours(hours, minutes, 0, 0);
      generated.push(buildSession(template, startsAt));
    }
  }

  return generated.sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
}

function sessionInputDate(session: Session) {
  return toIsoDate(new Date(session.startsAt));
}

function sessionInputTime(session: Session) {
  const startsAt = new Date(session.startsAt);
  return `${startsAt.getHours().toString().padStart(2, "0")}:${startsAt.getMinutes().toString().padStart(2, "0")}`;
}

function hasRequiredSessionAccess(athlete: Athlete, session: Session) {
  return (
    (athlete.availabilityStatus ?? "Active") === "Active" &&
    athlete.groupIds.some((groupId) => session.groupIds.includes(groupId)) &&
    !(athlete.excludedSessionIds ?? []).includes(session.id)
  );
}

function hasOptionalSlotAccess(athlete: Athlete, session: Session) {
  return (
    session.optional === true &&
    (athlete.availabilityStatus ?? "Active") === "Active"
  );
}

function hasSessionAccess(athlete: Athlete, session: Session) {
  if (!session.optional) return hasRequiredSessionAccess(athlete, session);
  return hasOptionalSlotAccess(athlete, session) && (athlete.optionalSessionIds ?? []).includes(session.id);
}

function isWithinNextSevenDays(session: Session, now = new Date()) {
  const startsAt = new Date(session.startsAt).getTime();
  const windowStart = now.getTime();
  const windowEnd = windowStart + 7 * 24 * 60 * 60 * 1000;
  return startsAt >= windowStart && startsAt <= windowEnd;
}

function isWithinLiveAttendingWindow(session: Session, now = new Date()) {
  const startsAt = new Date(session.startsAt).getTime();
  const sessionBufferEnd = startsAt + 2 * 60 * 60 * 1000;
  const windowEnd = now.getTime() + 7 * 24 * 60 * 60 * 1000;
  return sessionBufferEnd >= now.getTime() && startsAt <= windowEnd;
}

function getReminderAt(session: Session) {
  return new Date(new Date(session.cutoffAt).getTime() - 60 * 60 * 1000);
}

function isSessionLocked(session: Session, now = new Date()) {
  if (session.optional) return false;
  return session.locked || now.getTime() >= new Date(session.cutoffAt).getTime();
}

function isReminderWindowOpen(session: Session, now = new Date()) {
  if (session.optional) return false;
  const cutoffAt = new Date(session.cutoffAt);
  const reminderAt = getReminderAt(session);
  return now.getTime() >= reminderAt.getTime() && now.getTime() < cutoffAt.getTime();
}

function formatCutoffLabel(session: Session) {
  return session.optional ? "No signup cutoff" : session.cutoff;
}

function formatReminderTime(session: Session) {
  if (session.optional) return "No automatic reminder";
  return getReminderAt(session).toLocaleString("en-NZ", {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

function statusLabel(status: SignupStatus) {
  return {
    attending: "Attending",
    "not-attending": "Can't Attend",
    injured: "Injured/Sick",
  }[status];
}

function athleteGenderLabel(athlete: Athlete) {
  if (athlete.groupIds.includes("open-female")) return "Female";
  if (athlete.groupIds.includes("open-male")) return "Male";
  return "Unassigned";
}

function athleteAbilityLabel(athlete: Athlete) {
  if (athlete.abilityClass) return athlete.abilityClass;
  if (athlete.groupIds.includes("novice")) return "Novice";
  return "";
}

function compareAthletesForSheet(a: Athlete, b: Athlete) {
  const genderOrder = ["Female", "Male", "Unassigned"];
  const abilityOrder = ["Novice", "Intermediate", "Club", "Senior", "Premier", "Masters", ""];
  const genderDiff = genderOrder.indexOf(athleteGenderLabel(a)) - genderOrder.indexOf(athleteGenderLabel(b));
  if (genderDiff !== 0) return genderDiff;
  const abilityDiff = abilityOrder.indexOf(athleteAbilityLabel(a)) - abilityOrder.indexOf(athleteAbilityLabel(b));
  if (abilityDiff !== 0) return abilityDiff;
  return a.name.localeCompare(b.name);
}

function isAfterAttendanceReset(session: Session, attendanceResetAt: string | null) {
  if (!attendanceResetAt) return true;
  return new Date(session.startsAt).getTime() >= new Date(attendanceResetAt).getTime();
}

function getAttendancePercent(athlete: Athlete, sessions: Session[], signups: SignupMap, attendanceResetAt: string | null) {
  const offeredSessions = sessions.filter(
    (session) => hasSessionAccess(athlete, session) && !session.optional && isAfterAttendanceReset(session, attendanceResetAt),
  );
  if (offeredSessions.length === 0) return null;
  const attendedCount = offeredSessions.filter((session) => signups[session.id]?.[athlete.id] === "attending").length;
  return Math.round((attendedCount / offeredSessions.length) * 100);
}

function getAdjustedAttendancePercent(
  athlete: Athlete,
  sessions: Session[],
  signups: SignupMap,
  attendanceResetAt: string | null,
) {
  const requiredSessions = sessions.filter(
    (session) => hasSessionAccess(athlete, session) && !session.optional && isAfterAttendanceReset(session, attendanceResetAt),
  );
  if (requiredSessions.length === 0) return null;
  const requiredAttended = requiredSessions.filter((session) => signups[session.id]?.[athlete.id] === "attending").length;
  const catchupAttended = sessions.filter(
    (session) =>
      hasSessionAccess(athlete, session) &&
      session.optional &&
      isAfterAttendanceReset(session, attendanceResetAt) &&
      signups[session.id]?.[athlete.id] === "attending",
  ).length;
  return Math.min(100, Math.round(((requiredAttended + catchupAttended) / requiredSessions.length) * 100));
}

function normalizeSignupMap(saved: unknown): SignupMap {
  if (!saved || typeof saved !== "object") return initialSignups;
  return Object.fromEntries(
    Object.entries(saved as Record<string, unknown>).map(([sessionId, value]) => {
      if (Array.isArray(value)) {
        return [sessionId, Object.fromEntries(value.map((athleteId) => [String(athleteId), "attending" as SignupStatus]))];
      }

      if (value && typeof value === "object") {
        return [
          sessionId,
          Object.fromEntries(
            Object.entries(value as Record<string, string>).filter(([, status]) =>
              ["attending", "not-attending", "injured"].includes(status),
            ),
          ) as Record<string, SignupStatus>,
        ];
      }

      return [sessionId, {}];
    }),
  );
}

const activeAthleteStorageKey = "awrc-training-active-athlete-v2";
const trainingStateStorageKey = "awrc-training-state-v2";
const awrcHubUrl =
  "https://docs.google.com/spreadsheets/d/1mmKMRZyJSR3mr8VocTQ2Mimz6OavPIqyVza0tBUV_FU/edit?gid=344134665#gid=344134665";
const demoCoachPassword = "2852";

type SharedTrainingState = {
  athletes: Athlete[];
  sessions: Session[];
  signups: SignupMap;
  auditEvents: AuditEvent[];
  attendanceResetAt?: string | null;
};

export default function Home() {
  const [activeAthleteId, setActiveAthleteId] = useState<string | null>(null);
  const [pendingAthleteId, setPendingAthleteId] = useState("addison-jenkins");
  const [athleteSearch, setAthleteSearch] = useState("");
  const [coachPassword, setCoachPassword] = useState("");
  const [coachUnlocked, setCoachUnlocked] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState("open-female-wed-pm-2026-08-12");
  const [activeGroupId, setActiveGroupId] = useState("open-female");
  const [workspace, setWorkspace] = useState<"athlete" | "coach">("athlete");
  const [coachSection, setCoachSection] = useState<"schedule" | "roster" | "attendance">("schedule");
  const [signups, setSignups] = useState<SignupMap>(initialSignups);
  const [managedAthletes, setManagedAthletes] = useState<Athlete[]>(normalizeAthleteRoster(athletes));
  const [managedSessions, setManagedSessions] = useState<Session[]>([
    ...generateRecurringSessions(scheduleTemplates),
    ...manualSessions,
  ].sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()));
  const [newAthleteName, setNewAthleteName] = useState("");
  const [newAthleteSide, setNewAthleteSide] = useState<Athlete["seatSide"]>("Both");
  const [newAthleteScull, setNewAthleteScull] = useState<"Yes" | "No">("No");
  const [newAthleteGroupIds, setNewAthleteGroupIds] = useState<string[]>(["open-female", squadGroupId]);
  const [newSessionTitle, setNewSessionTitle] = useState("");
  const [newSessionDate, setNewSessionDate] = useState("2026-08-17");
  const [newSessionTime, setNewSessionTime] = useState("15:45");
  const [weeklyScheduleDay, setWeeklyScheduleDay] = useState(3);
  const [weeklyScheduleTime, setWeeklyScheduleTime] = useState("15:45");
  const [weeklyScheduleTitle, setWeeklyScheduleTitle] = useState("");
  const [weeklyScheduleWeeks, setWeeklyScheduleWeeks] = useState(4);
  const [weeklyScheduleType, setWeeklyScheduleType] = useState<"required" | "optional">("required");
  const [coachPreviewSearch, setCoachPreviewSearch] = useState("");
  const [rosterSearch, setRosterSearch] = useState("");
  const [selectedRosterAthleteId, setSelectedRosterAthleteId] = useState<string | null>(null);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [attendanceResetAt, setAttendanceResetAt] = useState<string | null>(null);
  const [serverStateReady, setServerStateReady] = useState(false);
  const [serverStateMessage, setServerStateMessage] = useState("Loading shared app state");
  const [sheetSyncStatus, setSheetSyncStatus] = useState<SheetSyncResult>({
    configured: false,
    message: "Google Sheet sync has not run yet",
    status: "idle",
  });
  const [sheetSyncing, setSheetSyncing] = useState(false);
  const [sessionDrafts, setSessionDrafts] = useState<Record<string, string>>(
    Object.fromEntries([...generateRecurringSessions(scheduleTemplates), ...manualSessions].map((session) => [session.id, session.title])),
  );
  const now = new Date();
  const sessions = managedSessions;

  const applySharedState = (state: Partial<SharedTrainingState>) => {
    if (Array.isArray(state.athletes)) setManagedAthletes(normalizeAthleteRoster(state.athletes));
    if (Array.isArray(state.sessions)) {
      setManagedSessions(state.sessions);
      setSessionDrafts(Object.fromEntries(state.sessions.map((session) => [session.id, session.title])));
    }
    if (state.signups) setSignups(normalizeSignupMap(state.signups));
    if (Array.isArray(state.auditEvents)) setAuditEvents(state.auditEvents);
    if (typeof state.attendanceResetAt === "string" || state.attendanceResetAt === null) {
      setAttendanceResetAt(state.attendanceResetAt ?? null);
    }
  };

  useEffect(() => {
    const rememberedAthlete = window.localStorage.getItem(activeAthleteStorageKey);
    const savedState = window.localStorage.getItem(trainingStateStorageKey);

    if (savedState) {
      try {
        applySharedState(JSON.parse(savedState) as Partial<SharedTrainingState>);
      } catch {
        window.localStorage.removeItem(trainingStateStorageKey);
      }
    }

    fetch("/api/training-state")
      .then((response) => response.json())
      .then((payload: { state?: Partial<SharedTrainingState>; configured?: boolean; message?: string }) => {
        if (payload.configured && payload.state) applySharedState(payload.state);
        setServerStateMessage(payload.configured ? "Shared app state loaded" : payload.message ?? "Using this device's saved state");
      })
      .catch(() => setServerStateMessage("Using this device's saved state"))
      .finally(() => setServerStateReady(true));

    if (rememberedAthlete) {
      setActiveAthleteId(rememberedAthlete);
      setPendingAthleteId(rememberedAthlete);
    }
  }, []);

  useEffect(() => {
    if (activeAthleteId) {
      window.localStorage.setItem(activeAthleteStorageKey, activeAthleteId);
    } else {
      window.localStorage.removeItem(activeAthleteStorageKey);
    }
  }, [activeAthleteId]);

  useEffect(() => {
    if (!serverStateReady) return;
    const nextState = {
      athletes: managedAthletes,
      sessions: managedSessions,
      signups,
      auditEvents,
      attendanceResetAt,
    };

    window.localStorage.setItem(trainingStateStorageKey, JSON.stringify(nextState));
    const timeout = window.setTimeout(() => {
      fetch("/api/training-state", {
        body: JSON.stringify(nextState),
        headers: { "content-type": "application/json" },
        method: "POST",
      })
        .then((response) => response.json())
        .then((payload: { configured?: boolean }) =>
          setServerStateMessage(payload.configured ? "Saved to app storage" : "Saved on this device"),
        )
        .catch(() => setServerStateMessage("Saved on this device"));
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [managedAthletes, managedSessions, signups, auditEvents, attendanceResetAt, serverStateReady]);

  useEffect(() => {
    if (sessions.length === 0) {
      if (activeSessionId) setActiveSessionId("");
      return;
    }

    if (!sessions.some((session) => session.id === activeSessionId)) {
      setActiveSessionId(sessions[0].id);
    }
  }, [sessions, activeSessionId]);

  const findAthlete = (id: string) => managedAthletes.find((athlete) => athlete.id === id);
  const activeAthlete = activeAthleteId ? findAthlete(activeAthleteId) ?? null : null;
  const pendingAthlete = findAthlete(pendingAthleteId) ?? managedAthletes[0] ?? athletes[0];
  const activeGroup = getGroup(activeGroupId) ?? programGroups[0];
  const activeSession = sessions.find((session) => session.id === activeSessionId) ?? sessions[0] ?? null;
  const activeSessionLocked = activeSession ? isSessionLocked(activeSession, now) : false;
  const activeSessionResponses = activeSession ? signups[activeSession.id] ?? {} : {};
  const attendingIds = Object.entries(activeSessionResponses)
    .filter(([, status]) => status === "attending")
    .map(([athleteId]) => athleteId);
  const respondedIds = Object.keys(activeSessionResponses);
  const attendingAthletes = attendingIds.map(findAthlete).filter(Boolean) as Athlete[];
  const eligibleAthletes = activeSession ? managedAthletes.filter((athlete) => hasSessionAccess(athlete, activeSession)) : [];
  const missingAthletes = eligibleAthletes.filter((athlete) => !respondedIds.includes(athlete.id));
  const notAttendingAthletes = eligibleAthletes.filter((athlete) => activeSessionResponses[athlete.id] === "not-attending");
  const injuredAthletes = eligibleAthletes.filter((athlete) => activeSessionResponses[athlete.id] === "injured");
  const reminderAthletes = activeSession?.optional ? [] : activeSession && isReminderWindowOpen(activeSession, now) ? missingAthletes : [];
  const notificationQueue = sessions.flatMap((session) => {
    if (session.optional || !isReminderWindowOpen(session, now)) return [];
    const responses = signups[session.id] ?? {};
    return managedAthletes
      .filter((athlete) => hasSessionAccess(athlete, session))
      .filter((athlete) => !responses[athlete.id])
      .map((athlete) => ({ session, athlete }));
  });
  const activeGroupSessions = sessions.filter((session) => session.optional || session.groupIds.includes(activeGroup.id));
  const activeGroupWeeklyPattern = useMemo(() => {
    const pattern = new Map<string, { label: string; count: number; optional: boolean }>();
    activeGroupSessions.forEach((session) => {
      const startsAt = new Date(session.startsAt);
      const label = `${startsAt.toLocaleDateString("en-NZ", { weekday: "long" })} ${session.time} - ${session.title}`;
      const key = `${startsAt.getDay()}-${session.time}-${session.title}-${Boolean(session.optional)}`;
      const existing = pattern.get(key);
      pattern.set(key, {
        label,
        count: (existing?.count ?? 0) + 1,
        optional: Boolean(session.optional),
      });
    });

    return Array.from(pattern.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [activeGroupSessions]);
  const athleteSchedule = activeAthlete
    ? sessions.filter((session) => hasSessionAccess(activeAthlete, session) && isWithinNextSevenDays(session, now))
    : [];
  const availableOptionalSessions = activeAthlete
    ? sessions.filter(
        (session) =>
          hasOptionalSlotAccess(activeAthlete, session) &&
          isWithinNextSevenDays(session, now) &&
          !(activeAthlete.optionalSessionIds ?? []).includes(session.id),
      )
    : [];
  const athleteSearchResults = athleteSearch.trim()
    ? managedAthletes
        .filter((athlete) => athlete.name.toLowerCase().includes(athleteSearch.trim().toLowerCase()))
        .slice(0, 5)
    : [];
  const coachPreviewResults = coachPreviewSearch.trim()
    ? managedAthletes
        .filter((athlete) => athlete.name.toLowerCase().includes(coachPreviewSearch.trim().toLowerCase()))
        .slice(0, 6)
    : [];
  const filteredRosterAthletes = useMemo(() => {
    const search = rosterSearch.trim().toLowerCase();
    const sortedAthletes = managedAthletes.slice().sort((a, b) => a.name.localeCompare(b.name));

    if (!search) return [];

    return sortedAthletes.filter((athlete) =>
      [
        athlete.name,
        groupNames(athlete.groupIds),
        athlete.ageGroup ?? "",
        athlete.abilityClass ?? "",
        athlete.availabilityStatus ?? "Active",
      ]
        .join(" ")
        .toLowerCase()
        .includes(search),
    );
  }, [managedAthletes, rosterSearch]);
  const selectedRosterAthlete = selectedRosterAthleteId ? findAthlete(selectedRosterAthleteId) : null;

  const sheetSyncRows = useMemo(() => {
    const groupList = (athleteList: Athlete[]) =>
      Array.from(new Set(athleteList.flatMap((athlete) => athlete.groupIds.map((groupId) => programGroups.find((group) => group.id === groupId)?.name ?? groupId))))
        .sort()
        .join(", ");
    const attendingRows: SheetRow[] = [
      [
        "Week",
        "Day",
        "Date",
        "Time",
        "Session",
        "Type",
        "Gender",
        "Ability",
        "Athlete",
        "Groups",
      ],
    ];
    const detailRows: SheetRow[] = [
      ["Week", "Date", "Session", "Time", "Type", "Athlete", "Group", "Status", "Age group", "Ability"],
    ];

    const sheetWindowNow = new Date();
    const liveAttendingSessions = sessions
      .filter((session) => isWithinLiveAttendingWindow(session, sheetWindowNow))
      .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());

    liveAttendingSessions.forEach((session) => {
      const responses = signups[session.id] ?? {};
      const eligibleAthletesForSession = managedAthletes
        .filter((athlete) =>
          session.optional
            ? (athlete.optionalSessionIds ?? []).includes(session.id)
            : hasRequiredSessionAccess(athlete, session),
        )
        .sort((a, b) => a.name.localeCompare(b.name));
      const athletesByStatus = (status: SignupStatus) =>
        eligibleAthletesForSession.filter((athlete) => responses[athlete.id] === status);
      const attending = athletesByStatus("attending").sort(compareAthletesForSheet);
      const startsAt = new Date(session.startsAt);
      const sessionDetails = [
        formatWeekDividerLabel(session).replace("Week starting ", ""),
        startsAt.toLocaleDateString("en-NZ", { weekday: "long" }),
        startsAt.toLocaleDateString("en-NZ"),
        session.time,
        session.title,
        session.optional ? "Optional/Catch-up" : "Required",
      ];

      if (attending.length === 0) {
        attendingRows.push([...sessionDetails, "", "", "No athletes signed up", groupList(eligibleAthletesForSession)]);
      } else {
        attending.forEach((athlete) => {
          attendingRows.push([
            ...sessionDetails,
            athleteGenderLabel(athlete),
            athleteAbilityLabel(athlete),
            athlete.name,
            groupNames(athlete.groupIds),
          ]);
        });
      }

    });

    sessions.forEach((session) => {
      const responses = signups[session.id] ?? {};
      const eligibleAthletesForSession = managedAthletes
        .filter((athlete) =>
          session.optional
            ? (athlete.optionalSessionIds ?? []).includes(session.id)
            : hasRequiredSessionAccess(athlete, session),
        )
        .sort((a, b) => a.name.localeCompare(b.name));
      const startsAt = new Date(session.startsAt);

      eligibleAthletesForSession.forEach((athlete) => {
        detailRows.push([
          formatWeekDividerLabel(session).replace("Week starting ", ""),
          startsAt.toLocaleDateString("en-NZ"),
          session.title,
          session.time,
          session.optional ? "Optional/Catch-up" : "Required",
          athlete.name,
          groupNames(athlete.groupIds),
          responses[athlete.id] ? statusLabel(responses[athlete.id]) : "No Response",
          athlete.ageGroup ?? "",
          athlete.abilityClass ?? "",
        ]);
      });
    });

    return { attendingRows, detailRows };
  }, [signups, managedAthletes, sessions]);

  const syncGoogleSheet = async () => {
    setSheetSyncing(true);
    try {
      const response = await fetch("/api/sheet-sync", {
        body: JSON.stringify(sheetSyncRows),
        headers: { "content-type": "application/json" },
        method: "POST",
      });
      const payload = (await response.json()) as SheetSyncResult;
      setSheetSyncStatus(payload);
    } catch {
      setSheetSyncStatus({
        configured: false,
        message: "Google Sheet sync could not reach the server.",
        status: "not-synced",
      });
    } finally {
      setSheetSyncing(false);
    }
  };

  useEffect(() => {
    if (!serverStateReady) return;
    const timeout = window.setTimeout(() => {
      void syncGoogleSheet();
    }, 900);

    return () => window.clearTimeout(timeout);
  }, [sheetSyncRows, serverStateReady]);

  const signInAthlete = () => {
    const search = athleteSearch.trim().toLowerCase();
    const matchedAthlete =
      managedAthletes.find((athlete) => athlete.name.toLowerCase() === search) ??
      managedAthletes.find((athlete) => athlete.name.toLowerCase().includes(search)) ??
      pendingAthlete;

    if (!search) return;
    setPendingAthleteId(matchedAthlete.id);
    setActiveAthleteId(matchedAthlete.id);
  };

  const logEvent = (actor: string, action: string) => {
    setAuditEvents((current) => [
      {
        id: `audit-${Date.now().toString(36)}-${current.length}`,
        at: new Date().toISOString(),
        actor,
        action,
      },
      ...current,
    ].slice(0, 30));
  };

  const addAthlete = () => {
    const name = newAthleteName.trim();
    if (!name) return;

    const id = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${Date.now().toString(36)}`;
    setManagedAthletes((current) => [
      ...current,
      {
        id,
        name,
        groupIds: withSquadGroupIds(newAthleteGroupIds.length > 0 ? newAthleteGroupIds : [activeGroup.id]),
        seatSide: newAthleteSide,
        scull: newAthleteScull,
        availabilityStatus: "Active",
        ageGroup: activeGroup.name,
        abilityClass: "Novice",
      },
    ]);
    setNewAthleteName("");
    setNewAthleteSide("Both");
    setNewAthleteScull("No");
    setNewAthleteGroupIds(withSquadGroupIds([activeGroup.id]));
    logEvent("Coach", `Added ${name} to ${groupNames(newAthleteGroupIds)}`);
  };

  const removeAthlete = (athleteId: string) => {
    setManagedAthletes((current) => current.filter((athlete) => athlete.id !== athleteId));
    setSignups((current) =>
      Object.fromEntries(
        Object.entries(current).map(([sessionId, sessionResponses]) => [
          sessionId,
          Object.fromEntries(Object.entries(sessionResponses).filter(([id]) => id !== athleteId)),
        ]),
      ),
    );
    if (activeAthleteId === athleteId) setActiveAthleteId(null);
    logEvent("Coach", "Removed athlete from roster and current signups");
  };

  const updateAthleteSide = (athleteId: string, seatSide: Athlete["seatSide"]) => {
    setManagedAthletes((current) =>
      current.map((athlete) => (athlete.id === athleteId ? { ...athlete, seatSide } : athlete)),
    );
    logEvent("Coach", `Updated Bow/Stroke for ${findAthlete(athleteId)?.name ?? "athlete"} to ${seatSide}`);
  };

  const updateAthleteScull = (athleteId: string, scull: "Yes" | "No") => {
    setManagedAthletes((current) =>
      current.map((athlete) => (athlete.id === athleteId ? { ...athlete, scull } : athlete)),
    );
    logEvent("Coach", `Updated Scull for ${findAthlete(athleteId)?.name ?? "athlete"} to ${scull}`);
  };

  const updateAthleteAvailability = (athleteId: string, availabilityStatus: "Active" | "Inactive") => {
    setManagedAthletes((current) =>
      current.map((athlete) => (athlete.id === athleteId ? { ...athlete, availabilityStatus } : athlete)),
    );
    logEvent("Coach", `Set ${findAthlete(athleteId)?.name ?? "athlete"} ${availabilityStatus}`);
  };

  const updateAthleteAgeGroup = (athleteId: string, ageGroup: string) => {
    setManagedAthletes((current) =>
      current.map((athlete) => (athlete.id === athleteId ? { ...athlete, ageGroup } : athlete)),
    );
    logEvent("Coach", `Updated age group for ${findAthlete(athleteId)?.name ?? "athlete"}`);
  };

  const updateAthleteAbilityClass = (athleteId: string, abilityClass: string) => {
    setManagedAthletes((current) =>
      current.map((athlete) => (athlete.id === athleteId ? { ...athlete, abilityClass } : athlete)),
    );
    logEvent("Coach", `Updated ability classification for ${findAthlete(athleteId)?.name ?? "athlete"}`);
  };

  const resetAttendancePercentages = () => {
    const resetAt = new Date().toISOString();
    setAttendanceResetAt(resetAt);
    logEvent("Coach", "Reset attendance percentage calculations");
  };

  const toggleNewAthleteGroup = (groupId: string) => {
    setNewAthleteGroupIds((current) => {
      if (current.includes(groupId)) {
        const next = current.filter((id) => id !== groupId);
        return next.length > 0 ? next : current;
      }

      return [...current, groupId];
    });
  };

  const toggleAthleteGroup = (athleteId: string, groupId: string) => {
    setManagedAthletes((current) =>
      current.map((athlete) => {
        if (athlete.id !== athleteId) return athlete;
        if (athlete.groupIds.includes(groupId)) {
          const nextGroups = athlete.groupIds.filter((id) => id !== groupId);
          return nextGroups.length > 0 ? { ...athlete, groupIds: nextGroups } : athlete;
        }

        return { ...athlete, groupIds: [...athlete.groupIds, groupId] };
      }),
    );
    logEvent("Coach", `Changed ${findAthlete(athleteId)?.name ?? "athlete"} group membership`);
  };

  const toggleAthleteSessionExclusion = (athleteId: string, sessionId: string) => {
    setManagedAthletes((current) =>
      current.map((athlete) => {
        if (athlete.id !== athleteId) return athlete;
        const excludedSessionIds = athlete.excludedSessionIds ?? [];
        return {
          ...athlete,
          excludedSessionIds: excludedSessionIds.includes(sessionId)
            ? excludedSessionIds.filter((id) => id !== sessionId)
            : [...excludedSessionIds, sessionId],
        };
      }),
    );
    setSignups((current) => ({
      ...current,
      [sessionId]: Object.fromEntries(Object.entries(current[sessionId] ?? {}).filter(([id]) => id !== athleteId)),
    }));
    logEvent("Coach", `Changed individual session access for ${findAthlete(athleteId)?.name ?? "athlete"}`);
  };

  const unlockCoachWorkspace = () => {
    setCoachUnlocked(coachPassword.trim() === demoCoachPassword);
    if (coachPassword.trim() === demoCoachPassword) {
      setCoachPassword("");
    }
  };

  const updateSignupStatus = (sessionId: string, status: SignupStatus) => {
    if (!activeAthlete) return;

    const session = sessions.find((item) => item.id === sessionId);
    if (!session || isSessionLocked(session) || !hasSessionAccess(activeAthlete, session)) return;

    setSignups((current) => {
      const sessionResponses = current[sessionId] ?? {};
      const nextResponses = { ...sessionResponses };
      const isSameStatus = nextResponses[activeAthlete.id] === status;

      if (isSameStatus) {
        delete nextResponses[activeAthlete.id];
      } else {
        nextResponses[activeAthlete.id] = status;
      }

      logEvent(activeAthlete.name, `${isSameStatus ? "Cleared" : "Set"} ${session.title} response`);

      return {
        ...current,
        [sessionId]: nextResponses,
      };
    });
  };

  const toggleOptionalSessionForAthlete = (sessionId: string) => {
    if (!activeAthlete) return;

    const session = sessions.find((item) => item.id === sessionId);
    if (!session || !hasOptionalSlotAccess(activeAthlete, session)) return;

    const isSelected = (activeAthlete.optionalSessionIds ?? []).includes(sessionId);
    setManagedAthletes((current) =>
      current.map((athlete) => {
        if (athlete.id !== activeAthlete.id) return athlete;
        const optionalSessionIds = athlete.optionalSessionIds ?? [];
        return {
          ...athlete,
          optionalSessionIds: isSelected
            ? optionalSessionIds.filter((id) => id !== sessionId)
            : [...optionalSessionIds, sessionId],
        };
      }),
    );

    if (isSelected) {
      setSignups((current) => ({
        ...current,
        [sessionId]: Object.fromEntries(Object.entries(current[sessionId] ?? {}).filter(([id]) => id !== activeAthlete.id)),
      }));
    }

    logEvent(activeAthlete.name, `${isSelected ? "Removed" : "Added"} optional session ${session.title}`);
  };

  const addCoachSession = () => {
    const [hours, minutes] = newSessionTime.split(":").map(Number);
    const startsAt = new Date(`${newSessionDate}T00:00:00`);
    startsAt.setHours(hours, minutes, 0, 0);
    const cutoffAt = getCutoffAt(startsAt);
    const session: Session = {
      id: `coach-session-${Date.now().toString(36)}`,
      title: newSessionTitle.trim() || formatSessionTitle(startsAt),
      groupIds: [activeGroup.id],
      date: formatDateLabel(startsAt),
      time: formatTimeLabel(newSessionTime),
      startsAt: startsAt.toISOString(),
      cutoffAt: cutoffAt.toISOString(),
      cutoff: cutoffAt.toLocaleString("en-NZ", { weekday: "short", hour: "numeric", minute: "2-digit" }),
      coach: "Axel",
      location: "AWRC Pontoon",
      crewTarget: activeGroup.id === squadGroupId
        ? managedAthletes.filter((athlete) => (athlete.availabilityStatus ?? "Active") === "Active").length
        : 16,
      locked: false,
    };

    setManagedSessions((current) => [...current, session].sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()));
    setSessionDrafts((current) => ({ ...current, [session.id]: session.title }));
    setNewSessionTitle("");
    setActiveSessionId(session.id);
    logEvent("Coach", `Added session ${session.title}`);
  };

  const updateSessionTitle = (sessionId: string, title: string) => {
    setSessionDrafts((current) => ({ ...current, [sessionId]: title }));
    setManagedSessions((current) =>
      current.map((session) => (session.id === sessionId ? { ...session, title: title.trim() || session.title } : session)),
    );
  };

  const updateSessionDateTime = (sessionId: string, dateValue: string, timeValue?: string) => {
    setManagedSessions((current) =>
      current
        .map((session) => {
          if (session.id !== sessionId) return session;
          const currentStart = new Date(session.startsAt);
          const [hours, minutes] = (timeValue ?? `${currentStart.getHours().toString().padStart(2, "0")}:${currentStart.getMinutes().toString().padStart(2, "0")}`).split(":").map(Number);
          const startsAt = new Date(`${dateValue}T00:00:00`);
          startsAt.setHours(hours, minutes, 0, 0);
          const cutoffAt = getCutoffAt(startsAt);
          return {
            ...session,
            date: formatDateLabel(startsAt),
            time: formatTimeLabel(`${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`),
            startsAt: startsAt.toISOString(),
            cutoffAt: cutoffAt.toISOString(),
            cutoff: cutoffAt.toLocaleString("en-NZ", { weekday: "short", hour: "numeric", minute: "2-digit" }),
          };
        })
        .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()),
    );
    logEvent("Coach", "Updated session date/time");
  };

  const addWeeklyScheduleSlot = () => {
    const [hours, minutes] = weeklyScheduleTime.split(":").map(Number);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysUntil = (weeklyScheduleDay - today.getDay() + 7) % 7;
    const firstSessionDate = new Date(today);
    firstSessionDate.setDate(today.getDate() + daysUntil);
    const baseTitle =
      weeklyScheduleTitle.trim() ||
      `${activeGroup.name} - ${weekdayOptions.find((day) => day.value === weeklyScheduleDay)?.label ?? "Weekly"} ${hours < 12 ? "AM" : "PM"}`;

    const newSessions = Array.from({ length: Math.max(1, Math.min(12, weeklyScheduleWeeks)) }, (_, index) => {
      const startsAt = new Date(firstSessionDate);
      startsAt.setDate(firstSessionDate.getDate() + index * 7);
      startsAt.setHours(hours, minutes, 0, 0);
      const cutoffAt = getCutoffAt(startsAt);
      const session: Session = {
        id: `weekly-${activeGroup.id}-${weeklyScheduleDay}-${weeklyScheduleTime.replace(":", "")}-${Date.now().toString(36)}-${index}`,
        title: baseTitle,
        groupIds: [activeGroup.id],
        optional: weeklyScheduleType === "optional",
        date: formatDateLabel(startsAt),
        time: formatTimeLabel(weeklyScheduleTime),
        startsAt: startsAt.toISOString(),
        cutoffAt: cutoffAt.toISOString(),
        cutoff: cutoffAt.toLocaleString("en-NZ", { weekday: "short", hour: "numeric", minute: "2-digit" }),
        coach: "Axel",
        location: "AWRC Pontoon",
        crewTarget: activeGroup.id === squadGroupId
          ? managedAthletes.filter((athlete) => (athlete.availabilityStatus ?? "Active") === "Active").length
          : activeGroup.id === "novice"
            ? 12
            : 16,
        locked: false,
      };

      return session;
    });

    setManagedSessions((current) =>
      [...current, ...newSessions].sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()),
    );
    setSessionDrafts((current) => ({
      ...current,
      ...Object.fromEntries(newSessions.map((session) => [session.id, session.title])),
    }));
    setActiveSessionId(newSessions[0].id);
    setWeeklyScheduleTitle("");
    logEvent("Coach", `Added ${newSessions.length} weekly ${activeGroup.name} session${newSessions.length === 1 ? "" : "s"}`);
  };

  const removeSession = (sessionId: string) => {
    setManagedSessions((current) => {
      const remainingSessions = current.filter((session) => session.id !== sessionId);
      if (activeSessionId === sessionId) {
        setActiveSessionId(remainingSessions[0]?.id ?? "");
      }
      return remainingSessions;
    });
    setSignups((current) => Object.fromEntries(Object.entries(current).filter(([id]) => id !== sessionId)));
    logEvent("Coach", "Removed session and its signup responses");
  };

  const toggleSessionOptional = (sessionId: string) => {
    setManagedSessions((current) =>
      current.map((session) => (session.id === sessionId ? { ...session, optional: !session.optional } : session)),
    );
    logEvent("Coach", "Changed optional/catch-up session setting");
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="topbar-title">
          <div>
            <p className="eyebrow">Session planning and tracking</p>
            <h1>Aramoho-Whanganui RC - Training Signup</h1>
          </div>
          <a
            className="club-logo-link"
            href={awrcHubUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            <img className="club-logo" src="/awrc-logo.png" alt="Aramoho-Whanganui Rowing Club logo" />
          </a>
        </div>
        {workspace === "coach" ? (
          <div className="top-summary" aria-label="Signup summary">
            <span><strong>{sessions.length}</strong> sessions</span>
            <span><strong>{programGroups.length}</strong> groups</span>
            <span><strong>{missingAthletes.length}</strong> reminders</span>
          </div>
        ) : null}
        <div className="action-band compact" aria-label="Workspace switcher">
          <button
            className={workspace === "athlete" ? "big-action active" : "big-action"}
            onClick={() => setWorkspace("athlete")}
            type="button"
          >
            Athlete
          </button>
          <button
            className={workspace === "coach" ? "big-action active" : "big-action"}
            onClick={() => {
              setWorkspace("coach");
              setCoachUnlocked(false);
            }}
            type="button"
          >
            Coach
          </button>
        </div>
      </header>

      <section className="hero-panel notice" aria-labelledby="app-title">
        <div>
          <p className="eyebrow">
            {workspace === "athlete" ? "Athlete signup" : coachUnlocked ? "Coach operations" : "Coach login"}
          </p>
          <h2 id="app-title">
            {workspace === "athlete"
              ? "Check your sessions and mark attendance."
              : coachUnlocked
                ? "Manage schedule, roster, and attendance."
                : "Coach tools are password protected."}
          </h2>
        </div>
      </section>

      {workspace === "athlete" ? (
      <div className="athlete-workspace">
        <aside className="panel roster-panel" aria-labelledby="roster-title">
          <div className="panel-heading">
            <p className="eyebrow">A - Athlete selection</p>
            <h2 id="roster-title">{activeAthlete ? "Signed in as" : "Choose your name"}</h2>
          </div>
          {!activeAthlete ? (
          <>
          <label className="search-box">
            Athlete name
            <input
              onChange={(event) => setAthleteSearch(event.target.value)}
              placeholder="Start typing your name"
              type="search"
              value={athleteSearch}
            />
          </label>
          {athleteSearchResults.length > 0 ? (
          <div className="search-results" aria-label="Matching athletes">
            {athleteSearchResults.map((athlete) => (
              <button
                className={`search-result ${groupClass(primaryGroupId(athlete))}`}
                key={athlete.id}
                onClick={() => {
                  setAthleteSearch(athlete.name);
                  setPendingAthleteId(athlete.id);
                  setActiveAthleteId(athlete.id);
                }}
                type="button"
              >
                <span>{athlete.name}</span>
                <em>{groupNames(athlete.groupIds)}</em>
              </button>
            ))}
          </div>
          ) : athleteSearch.trim() ? (
          <p className="search-empty">No matching athlete found.</p>
          ) : null}
          <button className="signup-button" onClick={signInAthlete} type="button">
            Open Athlete Page
          </button>
          </>
          ) : (
          <div className="identity-card">
            <div className="athlete-profile-line">
              <strong>{activeAthlete.name}</strong>
              <span>{activeAthlete.ageGroup ?? "Age group not set"}</span>
              <span>{activeAthlete.abilityClass ?? "Ability not set"}</span>
            </div>
            <span className={`group-badge ${groupClass(primaryGroupId(activeAthlete))}`}>
              {groupNames(activeAthlete.groupIds)}
            </span>
            <button className="text-button" onClick={() => setActiveAthleteId(null)} type="button">
              Switch athlete
            </button>
          </div>
          )}
        </aside>

        {activeAthlete ? (
        <section className="panel sessions-panel" id="sessions" aria-labelledby="sessions-title">
          <div className="panel-heading horizontal">
            <div>
              <p className="eyebrow">Athlete action</p>
              <h2 id="sessions-title">My sessions</h2>
            </div>
            <span className="status-pill">Private profile</span>
          </div>
          <div className="session-stack">
            {athleteSchedule.map((session, index, sessionList) => {
              const currentStatus = activeAthlete ? (signups[session.id] ?? {})[activeAthlete.id] : undefined;
              const isAttending = currentStatus === "attending";
              const count = Object.values(signups[session.id] ?? {}).filter((status) => status === "attending").length;
              const availableToAthlete = activeAthlete ? hasSessionAccess(activeAthlete, session) : false;
              const sessionLocked = isSessionLocked(session, now);
              return (
                <Fragment key={session.id}>
                {shouldShowWeekDivider(session, index, sessionList) ? (
                  <div className="week-divider" aria-label={formatWeekDividerLabel(session)}>
                    <span>{formatWeekDividerLabel(session)}</span>
                  </div>
                ) : null}
                <article
                  className={session.id === activeSession?.id ? "session-card selected" : "session-card"}
                >
                  <button className="session-main" onClick={() => setActiveSessionId(session.id)} type="button">
                    <span>
                      <strong>{formatSessionTitle(new Date(session.startsAt))}</strong>
                      <small>{formatSessionDateLine(session)}{session.optional ? " - Optional/Catch-up" : ""}</small>
                    </span>
                    <span className={sessionLocked ? "lock locked" : "lock"}>{sessionLocked ? "Locked" : "Open"}</span>
                  </button>
                  <div className="session-meta">
                    <span>Cutoff: {formatCutoffLabel(session)}</span>
                    <span>Reminder: {formatReminderTime(session)}</span>
                    <span>{count}/{session.crewTarget} target</span>
                    <span className="session-groups">
                      {session.optional ? <em className="group-badge catchup-badge">Optional/Catch-up</em> : null}
                      {session.groupIds.map((id) => (
                        <em className={`group-badge ${groupClass(id)}`} key={id}>{getGroup(id)?.name}</em>
                      ))}
                    </span>
                  </div>
                  <button
                    className={isAttending ? "signup-button attending" : "signup-button"}
                    disabled={!activeAthlete || sessionLocked || !availableToAthlete}
                    onClick={() => updateSignupStatus(session.id, "attending")}
                    type="button"
                  >
                    {!activeAthlete ? "Choose athlete to update" : !availableToAthlete ? "Not in my schedule" : sessionLocked ? "Cutoff passed" : isAttending ? "Yes, I'm In" : "Confirm Attendance"}
                  </button>
                  {activeAthlete && session.optional ? (
                    <button className="optional-remove-button" onClick={() => toggleOptionalSessionForAthlete(session.id)} type="button">
                      Remove optional session
                    </button>
                  ) : null}
                  {activeAthlete && availableToAthlete && !sessionLocked ? (
                    <div className="response-actions" aria-label={`Other responses for ${session.title}`}>
                      <button
                        className={currentStatus === "not-attending" ? "response-chip active" : "response-chip"}
                        onClick={() => updateSignupStatus(session.id, "not-attending")}
                        type="button"
                      >
                        Can't Attend
                      </button>
                      <button
                        className={currentStatus === "injured" ? "response-chip active" : "response-chip"}
                        onClick={() => updateSignupStatus(session.id, "injured")}
                        type="button"
                      >
                        Injured/Sick
                      </button>
                    </div>
                  ) : null}
                </article>
                </Fragment>
              );
            })}
          </div>
          {activeAthlete && availableOptionalSessions.length > 0 ? (
            <div className="optional-slots">
              <div className="panel-heading compact-heading">
                <p className="eyebrow">Optional/catch-up</p>
                <h3>Available slots</h3>
              </div>
              <div className="optional-slot-list">
                {availableOptionalSessions.map((session) => (
                  <article className="optional-slot-card" key={session.id}>
                    <span>
                      <strong>{formatSessionTitle(new Date(session.startsAt))}</strong>
                      <small>{formatSessionDateLine(session, true)}</small>
                    </span>
                    <button onClick={() => toggleOptionalSessionForAthlete(session.id)} type="button">
                      Add to My Week
                    </button>
                  </article>
                ))}
              </div>
            </div>
          ) : null}
        </section>
        ) : null}
      </div>
      ) : (
      <>
      {!coachUnlocked ? (
      <section className="coach-login panel" aria-labelledby="coach-login-title">
        <div>
          <p className="eyebrow">Coach login</p>
          <h2 id="coach-login-title">Enter coach password</h2>
        </div>
        <label className="password-box">
          Coach password
          <input
            onChange={(event) => setCoachPassword(event.target.value)}
            placeholder="Enter coach password"
            type="password"
            value={coachPassword}
          />
        </label>
        <button className="signup-button" onClick={unlockCoachWorkspace} type="button">
          Unlock coach workspace
        </button>
      </section>
      ) : (
      <>
      <div className="workspace-grid coach-workspace">
        <aside className="panel roster-panel" aria-labelledby="roster-title">
          <div className="panel-heading">
            <p className="eyebrow">Coach context</p>
            <h2 id="roster-title">Find athlete</h2>
          </div>
          <label className="search-box">
            Athlete search
            <input
              onChange={(event) => setCoachPreviewSearch(event.target.value)}
              placeholder="Search athlete name"
              type="search"
              value={coachPreviewSearch}
            />
          </label>
          {activeAthlete ? (
            <div className="identity-card compact-identity">
              <strong>{activeAthlete.name}</strong>
              <span className={`group-badge ${groupClass(primaryGroupId(activeAthlete))}`}>{groupNames(activeAthlete.groupIds)}</span>
            </div>
          ) : null}
          {coachPreviewSearch.trim() ? (
          <div className="search-results" aria-label="Choose athlete preview">
            {coachPreviewResults.map((athlete) => (
              <button
                className={`search-result ${groupClass(primaryGroupId(athlete))}`}
                key={athlete.id}
                onClick={() => {
                  setActiveAthleteId(athlete.id);
                  setCoachPreviewSearch(athlete.name);
                }}
                type="button"
              >
                <span>
                  <strong>{athlete.name}</strong>
                  <small>{groupNames(athlete.groupIds)}</small>
                </span>
              </button>
            ))}
            {coachPreviewResults.length === 0 ? <p className="search-empty">No athlete found.</p> : null}
          </div>
          ) : null}
        </aside>

        <section className="panel program-panel" id="programs" aria-labelledby="program-title">
          <div className="panel-heading horizontal">
            <div>
              <p className="eyebrow">Coach setup</p>
              <h2 id="program-title">Programs, groups & roster</h2>
            </div>
            <div className="coach-actions">
              <span className="status-pill">{managedAthletes.length} athletes</span>
              <span className={sheetSyncStatus.configured ? "status-pill synced" : "status-pill locked"}>
                {sheetSyncStatus.configured ? "Sheet synced" : "Sheet setup needed"}
              </span>
              <a className="sheet-link-button" href="/api/sheet-link" rel="noopener noreferrer" target="_blank">
                Open Google Sheet
              </a>
              <button className="sheet-link-button" disabled={sheetSyncing} onClick={() => void syncGoogleSheet()} type="button">
                {sheetSyncing ? "Syncing..." : "Sync now"}
              </button>
              <button className="reset-percent-button" onClick={resetAttendancePercentages} type="button">
                Reset attendance %
              </button>
            </div>
          </div>
          <div className="sheet-sync-message">
            <strong>{sheetSyncStatus.targetSheet ?? "AWRC Training Signup Backend"}</strong>
            <span>{sheetSyncStatus.message ?? "Waiting to sync"}</span>
            {typeof sheetSyncStatus.rowCount === "number" ? <em>{sheetSyncStatus.rowCount} rows prepared</em> : null}
          </div>
          <div className="coach-nav" aria-label="Coach sections">
            <button className={coachSection === "schedule" ? "active" : ""} onClick={() => setCoachSection("schedule")} type="button">
              Schedule
            </button>
            <button className={coachSection === "roster" ? "active" : ""} onClick={() => setCoachSection("roster")} type="button">
              Roster
            </button>
            <button className={coachSection === "attendance" ? "active" : ""} onClick={() => setCoachSection("attendance")} type="button">
              Attendance
            </button>
          </div>
          {coachSection === "schedule" ? (
          <>
          <div className="group-tabs" role="tablist" aria-label="Program groups">
            {programGroups.map((group) => (
              <button
                className={`${group.id === activeGroup.id ? "group-tab active" : "group-tab"} ${groupClass(group.id)}`}
                key={group.id}
                onClick={() => setActiveGroupId(group.id)}
                type="button"
              >
                {group.name}
              </button>
            ))}
          </div>
          <div className="program-detail">
            <div>
              <span>Program</span>
              <strong>{activeGroup.program}</strong>
            </div>
            <div>
              <span>Schedule template</span>
              <strong>{activeGroup.schedule}</strong>
            </div>
            <div>
              <span>Assigned athletes</span>
              <strong>{managedAthletes.filter((athlete) => athlete.groupIds.includes(activeGroup.id)).length} active</strong>
            </div>
          </div>
          <div className="weekly-schedule-builder">
            <div className="roster-heading">
              <div>
                <h3>Recurring group program</h3>
              </div>
              <span>{activeGroup.name}</span>
            </div>
            <div className="weekly-builder-form">
              <label>
                Day
                <select
                  onChange={(event) => setWeeklyScheduleDay(Number(event.target.value))}
                  value={weeklyScheduleDay}
                >
                  {weekdayOptions.map((day) => (
                    <option key={day.value} value={day.value}>{day.label}</option>
                  ))}
                </select>
              </label>
              <label>
                Time
                <input
                  onChange={(event) => setWeeklyScheduleTime(event.target.value)}
                  type="time"
                  value={weeklyScheduleTime}
                />
              </label>
              <label>
                Weeks
                <input
                  max={12}
                  min={1}
                  onChange={(event) => setWeeklyScheduleWeeks(Number(event.target.value))}
                  type="number"
                  value={weeklyScheduleWeeks}
                />
              </label>
              <label>
                Type
                <select
                  onChange={(event) => setWeeklyScheduleType(event.target.value as "required" | "optional")}
                  value={weeklyScheduleType}
                >
                  <option value="required">Required signup</option>
                  <option value="optional">Optional/Catch-up</option>
                </select>
              </label>
              <label className="weekly-title-field">
                Session title
                <input
                  onChange={(event) => setWeeklyScheduleTitle(event.target.value)}
                  placeholder={`${activeGroup.name} training`}
                  value={weeklyScheduleTitle}
                />
              </label>
              <button className="mini-button" onClick={addWeeklyScheduleSlot} type="button">
                Add weekly slot
              </button>
            </div>
            <div className="weekly-pattern-list" aria-label={`Weekly pattern for ${activeGroup.name}`}>
              {activeGroupWeeklyPattern.length > 0 ? (
                activeGroupWeeklyPattern.map((slot) => (
                  <span key={`${slot.label}-${slot.optional}`}>
                    <strong>{slot.label}</strong>
                    <em>{slot.optional ? "Optional" : "Required"} - {slot.count} upcoming</em>
                  </span>
                ))
              ) : (
                <p>No weekly sessions have been added for {activeGroup.name} yet.</p>
              )}
            </div>
          </div>
          </>
          ) : null}
          {coachSection === "roster" ? (
          <>
          <div className="add-athlete-form">
            <label>
              Athlete name
              <input
                onChange={(event) => setNewAthleteName(event.target.value)}
                placeholder={`Add to ${activeGroup.name}`}
                value={newAthleteName}
              />
            </label>
            <label>
              Bow/Stroke
              <select
                onChange={(event) => setNewAthleteSide(event.target.value as Athlete["seatSide"])}
                value={newAthleteSide}
              >
                <option>Both</option>
                <option>Stroke</option>
                <option>Bow</option>
              </select>
            </label>
            <label>
              Scull
              <select
                onChange={(event) => setNewAthleteScull(event.target.value as "Yes" | "No")}
                value={newAthleteScull}
              >
                <option>No</option>
                <option>Yes</option>
              </select>
            </label>
            <fieldset>
              <legend>Training schedules</legend>
              {programGroups.map((group) => (
                <label className={`schedule-check ${groupClass(group.id)}`} key={group.id}>
                  <input
                    checked={newAthleteGroupIds.includes(group.id)}
                    onChange={() => toggleNewAthleteGroup(group.id)}
                    type="checkbox"
                  />
                  <span>{group.name}</span>
                </label>
              ))}
            </fieldset>
            <button className="mini-button" onClick={addAthlete} type="button">Add athlete</button>
          </div>
          <div className="roster-heading">
            <div>
              <h3>Season roster</h3>
            </div>
            <span>{managedAthletes.filter((athlete) => athlete.groupIds.length > 1).length} multi-schedule</span>
          </div>
          <label className="roster-search">
            Search athlete profiles
            <input
              onChange={(event) => {
                setRosterSearch(event.target.value);
                setSelectedRosterAthleteId(null);
              }}
              placeholder="Search name, group, age, ability, or status"
              type="search"
              value={rosterSearch}
            />
            <span>
              {rosterSearch.trim()
                ? `${filteredRosterAthletes.length} match${filteredRosterAthletes.length === 1 ? "" : "es"} found`
                : `Search ${managedAthletes.length} athlete profiles`}
            </span>
          </label>
          <div className="management-list">
            {!rosterSearch.trim() ? (
              <p className="roster-empty">Search for an athlete to open their profile.</p>
            ) : filteredRosterAthletes.length === 0 ? (
              <p className="roster-empty">No athlete profiles match that search.</p>
            ) : !selectedRosterAthlete ? (
              <div className="roster-result-list" aria-label="Matching athlete profiles">
                {filteredRosterAthletes.slice(0, 8).map((athlete) => (
                  <button
                    className={`roster-result ${groupClass(primaryGroupId(athlete))}`}
                    key={athlete.id}
                    onClick={() => setSelectedRosterAthleteId(athlete.id)}
                    type="button"
                  >
                    <span>
                      <strong>{athlete.name}</strong>
                      <small>
                        {(athlete.availabilityStatus ?? "Active")} - {groupNames(athlete.groupIds)}
                        {" "} - Age: {athlete.ageGroup ?? "Not set"}
                        {" "} - Ability: {athlete.abilityClass ?? "Not set"}
                      </small>
                    </span>
                    <em>Open profile</em>
                  </button>
                ))}
              </div>
            ) : (() => {
              const athlete = selectedRosterAthlete;
              const attendancePercent = getAttendancePercent(athlete, sessions, signups, attendanceResetAt);
              const adjustedAttendancePercent = getAdjustedAttendancePercent(athlete, sessions, signups, attendanceResetAt);
              return (
                <div className="management-row" key={athlete.id}>
                  <span>
                    <strong>{athlete.name}</strong>
                    <small>
                      {(athlete.availabilityStatus ?? "Active")}
                      {" "} - Age: {athlete.ageGroup ?? "Not set"}
                      {" "} - Ability: {athlete.abilityClass ?? "Not set"}
                    </small>
                    <span className="assigned-groups">
                      {athlete.groupIds.map((groupId) => (
                        <em className={`group-badge ${groupClass(groupId)}`} key={groupId}>
                          {getGroup(groupId)?.name}
                        </em>
                      ))}
                    </span>
                    <span className="schedule-checkboxes">
                      {programGroups.map((group) => (
                        <label className={`schedule-check ${groupClass(group.id)}`} key={group.id}>
                          <input
                            checked={athlete.groupIds.includes(group.id)}
                            onChange={() => toggleAthleteGroup(athlete.id, group.id)}
                            type="checkbox"
                          />
                          <span>{group.name}</span>
                        </label>
                      ))}
                    </span>
                    <span className="session-exceptions">
                      <strong>Individual session access</strong>
                      {sessions
                        .filter(
                          (session) =>
                            !session.optional && athlete.groupIds.some((groupId) => session.groupIds.includes(groupId)),
                        )
                        .map((session) => {
                          const excluded = (athlete.excludedSessionIds ?? []).includes(session.id);
                          return (
                            <label className={excluded ? "session-exception excluded" : "session-exception"} key={session.id}>
                              <input
                                checked={!excluded}
                                onChange={() => toggleAthleteSessionExclusion(athlete.id, session.id)}
                                type="checkbox"
                              />
                              <span>{session.title}</span>
                            </label>
                          );
                        })}
                    </span>
                  </span>
                  <span className="roster-actions">
                    <span className="attendance-percent">
                      {attendancePercent === null ? "No sessions" : `${attendancePercent}% attendance`}
                    </span>
                    <span className="attendance-percent adjusted">
                      {adjustedAttendancePercent === null ? "No adjusted" : `${adjustedAttendancePercent}% adjusted`}
                    </span>
                    <label className="profile-field">
                      <span>Status</span>
                      <select
                        aria-label={`Active status for ${athlete.name}`}
                        onChange={(event) => updateAthleteAvailability(athlete.id, event.target.value as "Active" | "Inactive")}
                        value={athlete.availabilityStatus ?? "Active"}
                      >
                        <option>Active</option>
                        <option>Inactive</option>
                      </select>
                    </label>
                    <label className="profile-field">
                      <span>Bow/Stroke</span>
                      <select
                        aria-label={`Bow or stroke for ${athlete.name}`}
                        onChange={(event) => updateAthleteSide(athlete.id, event.target.value as Athlete["seatSide"])}
                        value={athlete.seatSide}
                      >
                        <option>Both</option>
                        <option>Stroke</option>
                        <option>Bow</option>
                      </select>
                    </label>
                    <label className="profile-field">
                      <span>Scull</span>
                      <select
                        aria-label={`Scull for ${athlete.name}`}
                        onChange={(event) => updateAthleteScull(athlete.id, event.target.value as "Yes" | "No")}
                        value={athlete.scull ?? "No"}
                      >
                        <option>No</option>
                        <option>Yes</option>
                      </select>
                    </label>
                    <label className="profile-field">
                      <span>Age group</span>
                      <select
                        aria-label={`Age group for ${athlete.name}`}
                        onChange={(event) => updateAthleteAgeGroup(athlete.id, event.target.value)}
                        value={athlete.ageGroup ?? ""}
                      >
                        <option value="">Not set</option>
                        <option>Novice</option>
                        <option>U14</option>
                        <option>U15</option>
                        <option>U16</option>
                        <option>U17</option>
                        <option>U18</option>
                        <option>Open</option>
                      </select>
                    </label>
                    <label className="profile-field">
                      <span>Ability</span>
                      <select
                        aria-label={`Ability classification for ${athlete.name}`}
                        onChange={(event) => updateAthleteAbilityClass(athlete.id, event.target.value)}
                        value={athlete.abilityClass ?? ""}
                      >
                        <option value="">Not set</option>
                        <option>Novice</option>
                        <option>Intermediate</option>
                        <option>Club</option>
                        <option>Senior</option>
                        <option>Premier</option>
                        <option>Masters</option>
                      </select>
                    </label>
                    <button onClick={() => removeAthlete(athlete.id)} type="button">Remove</button>
                  </span>
                </div>
              );
            })()}
          </div>
          </>
          ) : null}
          {coachSection === "schedule" ? (
          <div className="schedule-editor">
            <h3>Week-to-week session edits</h3>
            <div className="add-session-form">
              <label>
                Session title
                <input
                  onChange={(event) => setNewSessionTitle(event.target.value)}
                  placeholder="Leave blank to auto-name"
                  value={newSessionTitle}
                />
              </label>
              <label>
                Date
                <input
                  onChange={(event) => setNewSessionDate(event.target.value)}
                  type="date"
                  value={newSessionDate}
                />
              </label>
              <label>
                Time
                <input
                  onChange={(event) => setNewSessionTime(event.target.value)}
                  type="time"
                  value={newSessionTime}
                />
              </label>
              <button className="mini-button" onClick={addCoachSession} type="button">Add session</button>
            </div>
            <div className="schedule-grid">
              {activeGroupSessions.map((session, index, sessionList) => (
                <Fragment key={session.id}>
                {shouldShowWeekDivider(session, index, sessionList) ? (
                  <div className="week-divider schedule-week-divider" aria-label={formatWeekDividerLabel(session)}>
                    <span>{formatWeekDividerLabel(session)}</span>
                  </div>
                ) : null}
                <article className={`session-edit-row ${groupClass(activeGroup.id)}`}>
                  <label>
                    Session
                    <input
                      onChange={(event) => updateSessionTitle(session.id, event.target.value)}
                      value={sessionDrafts[session.id] ?? session.title}
                    />
                  </label>
                  <label>
                    Date
                    <input
                      onChange={(event) => updateSessionDateTime(session.id, event.target.value)}
                      type="date"
                      value={sessionInputDate(session)}
                    />
                  </label>
                  <label>
                    Time
                    <input
                      onChange={(event) => updateSessionDateTime(session.id, sessionInputDate(session), event.target.value)}
                      type="time"
                      value={sessionInputTime(session)}
                    />
                  </label>
                  <label className="catchup-toggle">
                    <input
                      checked={Boolean(session.optional)}
                      onChange={() => toggleSessionOptional(session.id)}
                      type="checkbox"
                    />
                    Optional/Catch-up
                  </label>
                  <button onClick={() => removeSession(session.id)} type="button">Remove</button>
                </article>
                </Fragment>
              ))}
            </div>
          </div>
          ) : null}
        </section>

        {coachSection === "attendance" ? (
        activeSession ? (
        <section className="panel coach-panel" id="coach" aria-labelledby="coach-title">
          <div className="panel-heading horizontal">
            <div>
              <p className="eyebrow">Attendance dashboard</p>
              <h2 id="coach-title">Selected session</h2>
            </div>
            <span className={activeSessionLocked ? "status-pill locked" : "status-pill"}>{activeSessionLocked ? "Locked" : "Open"}</span>
          </div>
          <label className="session-picker">
            Session
            <select onChange={(event) => setActiveSessionId(event.target.value)} value={activeSession.id}>
              {sessions.map((session) => (
                <option key={session.id} value={session.id}>
                  {formatSessionTitle(new Date(session.startsAt))} - {session.title}
                </option>
              ))}
            </select>
          </label>
          <div className="selected-session-summary">
            <div>
              <span>Date & time</span>
              <strong>{formatSessionDateLine(activeSession)}</strong>
            </div>
            <div>
              <span>Cutoff</span>
              <strong>{formatCutoffLabel(activeSession)}</strong>
            </div>
            <div>
              <span>Groups</span>
              <strong>{activeSession.groupIds.map((id) => getGroup(id)?.name).filter(Boolean).join(", ")}</strong>
            </div>
          </div>
          <div className="attendance-stats">
            <span><strong>{attendingAthletes.length}</strong> attending</span>
            <span><strong>{notAttendingAthletes.length}</strong> can't attend</span>
            <span><strong>{injuredAthletes.length}</strong> injured/sick</span>
            <span><strong>{missingAthletes.length}</strong> no response</span>
          </div>
          <div className="attendance-columns">
            <div className="attendance-column attending">
              <h3>Attending</h3>
              <div className="name-grid">
                {attendingAthletes.length > 0 ? attendingAthletes.map((athlete) => (
                  <span className={groupClass(primaryGroupId(athlete))} key={athlete.id}>{athlete.name}</span>
                )) : <p>No athletes attending yet.</p>}
              </div>
            </div>
            <div className="attendance-column">
              <h3>Can't attend</h3>
              <div className="name-grid">
                {notAttendingAthletes.length > 0 ? notAttendingAthletes.map((athlete) => (
                  <span className={groupClass(primaryGroupId(athlete))} key={athlete.id}>{athlete.name}</span>
                )) : <p>No absences marked.</p>}
              </div>
            </div>
            <div className="attendance-column health-alert">
              <h3>Injured/Sick</h3>
              <div className="name-grid">
                {injuredAthletes.length > 0 ? injuredAthletes.map((athlete) => (
                  <span className={groupClass(primaryGroupId(athlete))} key={athlete.id}>{athlete.name}</span>
                )) : <p>No health alerts for this session.</p>}
              </div>
            </div>
            <div className="attendance-column">
              <h3>No response</h3>
              <div className="name-grid">
                {missingAthletes.length > 0 ? missingAthletes.map((athlete) => (
                  <span className={groupClass(primaryGroupId(athlete))} key={athlete.id}>{athlete.name}</span>
                )) : <p>Everyone has responded.</p>}
              </div>
            </div>
          </div>
          <div className="reminder-block">
            <h3>Notifications</h3>
            <p>
              {activeSession.optional
                ? "Optional/catch-up sessions do not send cutoff reminders."
                : `${reminderAthletes.length} reminder${reminderAthletes.length === 1 ? "" : "s"} due now. ${notificationQueue.length} due across all sessions.`}
            </p>
          </div>
        </section>
        ) : (
        <section className="panel coach-panel" id="coach" aria-labelledby="coach-title">
          <div className="panel-heading horizontal">
            <div>
              <p className="eyebrow">Coach view</p>
              <h2 id="coach-title">No sessions selected</h2>
            </div>
            <span className="status-pill locked">Empty</span>
          </div>
          <div className="reminder-block">
            <h3>No sessions in the schedule</h3>
          </div>
        </section>
        )
        ) : null}
      </div>
      </>
      )}
      </>
      )}
    </main>
  );
}

