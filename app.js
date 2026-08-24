const STORAGE_KEY = "club-water-log-prototype-v8";
const NOTIFICATION_USER_KEY = `${STORAGE_KEY}-notification-user`;
const SEEN_ALERTS_KEY = `${STORAGE_KEY}-seen-alerts`;
const PUSH_REGISTERED_KEY = `${STORAGE_KEY}-push-registered`;
const PUSH_REGISTERED_USER_KEY = `${STORAGE_KEY}-push-registered-user`;
const OVERDUE_GRACE_MINUTES = 30;
const OVERDUE_REPEAT_MINUTES = 10;
const FLEET_SYNC_INTERVAL_MS = 60 * 1000;
const SHARED_SYNC_INTERVAL_MS = 5000;
const ALERT_POLL_INTERVAL_MS = 5000;
const BOAT_ALLOCATION_CSV_URL = "https://docs.google.com/spreadsheets/d/1u5FggSDDpYk5m24o4D8UdPPujGj8G54US7rQ0PNE-B0/export?format=csv";
const API_BASE_URL = "";
const LOGBOOK_WEBHOOK_URL = "";
const BOAT_STATUS_WEBHOOK_URL = "";
let pushPublicVapidKey = "";
const ADMIN_PASSWORD = "2852";
const ALERT_ROLES = {
  coaches: ["Axel Dickinson", "Allan Luff"],
  safetyOfficer: "Axel Dickinson",
  alwaysNotify: ["Axel Dickinson", "Tiffany Davies"]
};
const HULL_TYPE_COLOURS = {
  racing: "#FFF2CC",
  training: "#F4CCCC",
  private: "#D9D2E9"
};
const BOAT_COLOURS = {
  "hammond-family-8": "#F4CCCC",
  "pro8-weenink-8": "#F4CCCC",
  "city-college-8": "#F4CCCC",
  "dave-dudley-4": "#FFF2CC",
  "chris-harris-4": "#FFF2CC",
  "grader-howells-4": "#FFF2CC",
  "pawson-family-4": "#FFF2CC",
  "aj-luff-4": "#F4CCCC",
  "wayne-jones-4": "#F4CCCC",
  "nz-centennial-4": "#F4CCCC",
  "les-clark-4": "#F4CCCC",
  "pat-spriggens-4": "#F4CCCC",
  "bruce-gichard-4": "#F4CCCC",
  "city-college-4-derigged": "#F4CCCC",
  "wintech-4-derigged": "#F4CCCC",
  "rangiora-4": "#D9D2E9",
  "jo-stewart-4": "#D9D2E9",
  "filippi-private-2": "#D9D2E9",
  "oscar-smith-2": "#FFF2CC",
  "murray-wright-2": "#FFF2CC",
  "wintech-2-derigged": "#F4CCCC",
  "john-symes-2": "#F4CCCC",
  "barb-saunders-2": "#F4CCCC",
  "richard-brock-2": "#F4CCCC",
  "trevor-rush-2": "#F4CCCC",
  "darryl-thompson-2": "#F4CCCC",
  "aramoho-centennial-2": "#F4CCCC",
  "city-college-2-derigged": "#F4CCCC",
  "wintech-2-repairs": "#F4CCCC",
  "invercargill-2": "#D9D2E9",
  "diocesan-2": "#D9D2E9",
  "barry-windelburn-1": "#FFF2CC",
  "murray-carey-1": "#FFF2CC",
  "rachel-1": "#FFF2CC",
  "adele-luff-1": "#FFF2CC",
  "tony-upchurch-1": "#F4CCCC",
  "jimmy-jandal-1": "#F4CCCC",
  "city-college-kirs-1-repairs": "#F4CCCC",
  "rua-1": "#F4CCCC",
  "hakuna-matata-1": "#F4CCCC",
  "wintech-yellow-1-a": "#F4CCCC",
  "wintech-yellow-1-b": "#F4CCCC",
  "wintech-navy-blue-1": "#F4CCCC",
  "wintech-red-1": "#F4CCCC",
  "brocky-empacher-1": "#D9D2E9",
  "bruce-slr-1x-1": "#D9D2E9",
  "searite-1x-1": "#D9D2E9",
  "garth-hammond-1": "#D9D2E9",
  "pat-spriggens-1": "#D9D2E9",
  "keith-mayberry-1": "#D9D2E9",
  "nana-1": "#D9D2E9",
  "brenda-ii-1": "#D9D2E9",
  "brocky-wintech-1": "#D9D2E9",
  "coles-family-1": "#D9D2E9",
  "white-kirs-1": "#D9D2E9",
  "coach-boat-1-1": "#000000",
  "coach-boat-2-1": "#000000",
  "coach-boat-3-1": "#000000",
  "coach-boat-4-1": "#000000",
  "coach-boat-5-1": "#000000"
};

const demoData = {
  members: [
    { name: "Becky Roy", grade: "Intermediate" },
    { name: "Robyn Van Dijk", grade: "Club" },
    { name: "Eli Kuehne", grade: "Senior" },
    { name: "Awatea Tutaki", grade: "Coxswain" },
    { name: "Ellie Hewer", grade: "Intermediate" },
    { name: "Addison Jenkins", grade: "Club" },
    { name: "Jake Newton", grade: "Senior" },
    { name: "Hayley Bartlett", grade: "Coxswain" },
    { name: "Lily Camp", grade: "Intermediate" },
    { name: "Bailey Barnett", grade: "Club" },
    { name: "Nicky Maxim", grade: "Senior" },
    { name: "Lauren Davies", grade: "Coxswain" },
    { name: "Lily Newton", grade: "Intermediate" },
    { name: "Bryn Morgan", grade: "Club" },
    { name: "Achilles Paikea", grade: "Senior" },
    { name: "Misha Young", grade: "Coxswain" },
    { name: "Myiah Dudson", grade: "Intermediate" },
    { name: "Caralie Hanna", grade: "Club" },
    { name: "Jordan Hallett", grade: "Senior" },
    { name: "Morgan Wood", grade: "Coxswain" },
    { name: "Thomas Dwyer", grade: "Intermediate" },
    { name: "Logan Joubert", grade: "Club" },
    { name: "Quin Vivian", grade: "Senior" },
    { name: "Ava Overton", grade: "Intermediate" },
    { name: "Joseph Dudson", grade: "Club" },
    { name: "Ross Llaneta", grade: "Senior" },
    { name: "Axel Dickinson", grade: "Senior" },
    { name: "Adrian van Bussel", grade: "Masters" },
    { name: "Allan Luff", grade: "Masters" },
    { name: "Andrew Quirk", grade: "Masters" },
    { name: "Anna Loftus", grade: "Masters" },
    { name: "Bruce Osborne", grade: "Masters" },
    { name: "Bruce Tate", grade: "Masters" },
    { name: "Cath Cheatley", grade: "Masters" },
    { name: "Colin Wright", grade: "Masters" },
    { name: "Des Healey", grade: "Masters" },
    { name: "Des Lock", grade: "Masters" },
    { name: "Eleanor Arnst", grade: "Masters" },
    { name: "Faith McGregor", grade: "Masters" },
    { name: "Garth Hammond", grade: "Masters" },
    { name: "Grader Howells", grade: "Masters" },
    { name: "Jacs Rush", grade: "Masters" },
    { name: "James Richardson", grade: "Masters" },
    { name: "Jane McGimpsey", grade: "Masters" },
    { name: "Jason Reid", grade: "Masters" },
    { name: "Katy Newton", grade: "Masters" },
    { name: "Lance O'Brien", grade: "Masters" },
    { name: "Louise Nightingale", grade: "Masters" },
    { name: "Matt Bailey", grade: "Masters" },
    { name: "Murray Carey", grade: "Masters" },
    { name: "Murray Stewart", grade: "Masters" },
    { name: "Penny Richardson", grade: "Masters" },
    { name: "Quinten King", grade: "Masters" },
    { name: "Rachael Corcoran", grade: "Masters" },
    { name: "Richard Brock", grade: "Masters" },
    { name: "Sarah Kuehne", grade: "Masters" },
    { name: "Stuart Fraser", grade: "Masters" },
    { name: "Sue O'Leary", grade: "Masters" },
    { name: "Thomas Monaghan", grade: "Masters" },
    { name: "Tony Upchurch", grade: "Masters" },
    { name: "Tracy Wigzell", grade: "Masters" },
    { name: "Tiffany Davies", grade: "Masters" },
    { name: "Callum Morgan", grade: "Intermediate" },
    { name: "Ruby Bullock", grade: "Club" },
    { name: "Danya Booth", grade: "Intermediate" },
    { name: "Xavier Warren", grade: "Club" },
    { name: "Rylee Earles", grade: "Intermediate" },
    { name: "Millie Richardson", grade: "Club" },
    { name: "Georgia Calman", grade: "Intermediate" },
    { name: "Sophia Su'a", grade: "Club" },
    { name: "Jacob Larsen", grade: "Intermediate" },
    { name: "Zac Visser", grade: "Club" },
    { name: "Jake Buxton", grade: "Intermediate" },
    { name: "Dempsey Schicker", grade: "Club" },
    { name: "Lilee Lambe", grade: "Intermediate" },
    { name: "DJ Paikea", grade: "Club" },
    { name: "Sam Knapton", grade: "Club" },
    { name: "Karlon Johnson", grade: "Club" },
    { name: "Felix De Groot", grade: "Club" },
    { name: "Luca Kuehne", grade: "Intermediate" },
    { name: "Milly Vivian", grade: "Intermediate" },
    { name: "Salvador Mazzieri", grade: "Intermediate" },
    { name: "Sophia Kerwin", grade: "Intermediate" },
    { name: "Zack Newton", grade: "Intermediate" },
    { name: "Milo Weber", grade: "Intermediate" },
    { name: "David Strobel", grade: "Intermediate" },
    { name: "Adela Slanarova", grade: "Intermediate" }
  ],
  plant: [
    { id: "hammond-family-8", type: "Boat", name: "Hammond Family (8+)", seats: 8, status: "available", note: "65 - 75, Sweep" },
    { id: "pro8-weenink-8", type: "Boat", name: "Pro8 Weenink (8+)", seats: 8, status: "available", note: "85 - 100, Sweep" },
    { id: "city-college-8", type: "Boat", name: "City College (8+/x+)", seats: 8, status: "available", note: "65 - 75, Scull" },
    { id: "dave-dudley-4", type: "Boat", name: "Dave Dudley (4-/4x-)", seats: 4, status: "available", note: "70 - 75, Scull" },
    { id: "chris-harris-4", type: "Boat", name: "Chris Harris (4-/4x-)", seats: 4, status: "available", note: "85 - 95, Scull" },
    { id: "grader-howells-4", type: "Boat", name: "Grader Howells (4+/4x+)", seats: 4, status: "available", note: "70 - 90, Scull" },
    { id: "pawson-family-4", type: "Boat", name: "Pawson Family (4+/4x+)", seats: 4, status: "available", note: "60 - 70, Scull" },
    { id: "aj-luff-4", type: "Boat", name: "AJ Luff (4-/4x-)", seats: 4, status: "available", note: "85 - 95, Sweep" },
    { id: "wayne-jones-4", type: "Boat", name: "Wayne Jones (4-/4x-)", seats: 4, status: "available", note: "70 - 90, Scull" },
    { id: "nz-centennial-4", type: "Boat", name: "NZ Centennial (4-/4x-)", seats: 4, status: "available", note: "60 - 80, Scull" },
    { id: "les-clark-4", type: "Boat", name: "Les Clark (4+/4x+)", seats: 4, status: "available", note: "80 - 90, Scull" },
    { id: "pat-spriggens-4", type: "Boat", name: "Pat Spriggens (4+/4x+)", seats: 4, status: "available", note: "65 - 75, Scull" },
    { id: "bruce-gichard-4", type: "Boat", name: "Bruce Gichard (4+/4x+)", seats: 4, status: "available", note: "70 - 80, Scull" },
    { id: "city-college-4-derigged", type: "Boat", name: "City College (4+/4x+)", seats: 4, status: "derigged", note: "65 - 75, Derigged" },
    { id: "wintech-4-derigged", type: "Boat", name: "Wintech (4+/4x+)", seats: 4, status: "derigged", note: "65 - 75, Derigged" },
    { id: "rangiora-4", type: "Boat", name: "Rangiora (4-)", seats: 4, status: "available", note: "Sweep" },
    { id: "jo-stewart-4", type: "Boat", name: "Jo Stewart (4-/4x-)", seats: 4, status: "available", note: "Sweep" },
    { id: "filippi-private-2", type: "Boat", name: "Filippi (Private) (2x/2-)", seats: 2, status: "available", note: "80 - 90, Scull, Private" },
    { id: "oscar-smith-2", type: "Boat", name: "Oscar Smith (2x)", seats: 2, status: "available", note: "65 - 75, Scull" },
    { id: "murray-wright-2", type: "Boat", name: "Murray Wright (2x/2-)", seats: 2, status: "available", note: "75 - 85, Scull" },
    { id: "wintech-2-derigged", type: "Boat", name: "Wintech (2x)", seats: 2, status: "derigged", note: "60 - 80, Derigged" },
    { id: "john-symes-2", type: "Boat", name: "John Symes (2x/2-)", seats: 2, status: "available", note: "85 - 100, Scull" },
    { id: "barb-saunders-2", type: "Boat", name: "Barb Saunders (2x/2-)", seats: 2, status: "available", note: "70 - 75, Scull" },
    { id: "richard-brock-2", type: "Boat", name: "Richard Brock (2x/2-)", seats: 2, status: "available", note: "70 - 85, Scull" },
    { id: "trevor-rush-2", type: "Boat", name: "Trevor Rush (2x)", seats: 2, status: "available", note: "70 - 85, Scull" },
    { id: "darryl-thompson-2", type: "Boat", name: "Darryl Thompson (2x)", seats: 2, status: "available", note: "70 - 85, Scull" },
    { id: "aramoho-centennial-2", type: "Boat", name: "Aramoho Centennial (2x/2-)", seats: 2, status: "available", note: "65 - 75, Scull" },
    { id: "city-college-2-derigged", type: "Boat", name: "City College (2-/2x)", seats: 2, status: "derigged", note: "70 - 80, Derigged" },
    { id: "wintech-2-repairs", type: "Boat", name: "Wintech (2x/2-)", seats: 2, status: "maintenance", note: "65 - 75, Repairs" },
    { id: "invercargill-2", type: "Boat", name: "Invercargill (2x)", seats: 2, status: "available", note: "Scull" },
    { id: "diocesan-2", type: "Boat", name: "Diocesan (2x/2-)", seats: 2, status: "available", note: "Scull" },
    { id: "barry-windelburn-1", type: "Boat", name: "Barry Windelburn (1x)", seats: 1, status: "available", note: "85 - 95, Scull" },
    { id: "murray-carey-1", type: "Boat", name: "Murray Carey (1x)", seats: 1, status: "available", note: "75 - 85, Scull" },
    { id: "rachel-1", type: "Boat", name: "Rachel (1x)", seats: 1, status: "available", note: "65 - 75, Scull" },
    { id: "adele-luff-1", type: "Boat", name: "Adele Luff (1x)", seats: 1, status: "available", note: "60 - 80, Scull" },
    { id: "tony-upchurch-1", type: "Boat", name: "Tony Upchurch (1x)", seats: 1, status: "available", note: "70 - 85, Scull" },
    { id: "jimmy-jandal-1", type: "Boat", name: "Jimmy Jandal (1x)", seats: 1, status: "available", note: "70 - 85, Scull" },
    { id: "city-college-kirs-1-repairs", type: "Boat", name: "City College Kirs (1x)", seats: 1, status: "maintenance", note: "70 - 80, Repairs" },
    { id: "rua-1", type: "Boat", name: "Rua (1x)", seats: 1, status: "available", note: "70 - 80, Scull" },
    { id: "hakuna-matata-1", type: "Boat", name: "Hakuna Matata (1x)", seats: 1, status: "available", note: "80 - 90, Scull" },
    { id: "wintech-yellow-1-a", type: "Boat", name: "Wintech Yellow A (1x)", seats: 1, status: "available", note: "75 - 85, Scull" },
    { id: "wintech-yellow-1-b", type: "Boat", name: "Wintech Yellow B (1x)", seats: 1, status: "available", note: "75 - 85, Scull" },
    { id: "wintech-navy-blue-1", type: "Boat", name: "Wintech Navy Blue (1x)", seats: 1, status: "available", note: "60 - 75, Scull" },
    { id: "wintech-red-1", type: "Boat", name: "Wintech Red (1x)", seats: 1, status: "available", note: "60 - 75, Scull" },
    { id: "brocky-empacher-1", type: "Boat", name: "Brocky Empacher (1x)", seats: 1, status: "available", note: "75 - 85, Scull" },
    { id: "garth-hammond-1", type: "Boat", name: "Garth Hammond (1x)", seats: 1, status: "available", note: "Scull" },
    { id: "pat-spriggens-1", type: "Boat", name: "Pat Spriggens (1x)", seats: 1, status: "available", note: "Scull" },
    { id: "keith-mayberry-1", type: "Boat", name: "Keith Mayberry (1x)", seats: 1, status: "available", note: "Scull" },
    { id: "nana-1", type: "Boat", name: "Nana (1x)", seats: 1, status: "available", note: "Scull" },
    { id: "brenda-ii-1", type: "Boat", name: "Brenda II (1x)", seats: 1, status: "available", note: "Scull" },
    { id: "brocky-wintech-1", type: "Boat", name: "Brocky Wintech (1x)", seats: 1, status: "available", note: "Scull" },
    { id: "coles-family-1", type: "Boat", name: "Cole's Family (1x)", seats: 1, status: "available", note: "Scull" },
    { id: "white-kirs-1", type: "Boat", name: "White KIRS (1x)", seats: 1, status: "available", note: "Scull" }
  ],
  outings: [],
  notified: {}
};

let state = load();
let seenAlertKeys = new Set(JSON.parse(localStorage.getItem(SEEN_ALERTS_KEY) || "[]"));

const $ = (selector) => document.querySelector(selector);
const views = document.querySelectorAll(".view");
const actionButtons = document.querySelectorAll(".big-action[data-view]");

const els = {
  outCount: $("#outCount"),
  lateCount: $("#lateCount"),
  boatSelect: $("#boatSelect"),
  boatSearch: $("#boatSearch"),
  memberList: $("#memberList"),
  seatCount: $("#seatCount"),
  coxSection: $("#coxSection"),
  coxSelect: $("#coxSelect"),
  coxSearch: $("#coxSearch"),
  coxCaptain: $("#coxCaptain"),
  dueTime: $("#dueTime"),
  notes: $("#notes"),
  signOutForm: $("#signOutForm"),
  signInList: $("#signInList"),
  onWaterList: $("#onWaterList"),
  plantList: $("#plantList"),
  logbookList: $("#logbookList"),
  exportLogbook: $("#exportLogbook"),
  adminLogin: $("#adminLogin"),
  adminTools: $("#adminTools"),
  adminStatus: $("#adminStatus"),
  adminPassword: $("#adminPassword"),
  adminUnlock: $("#adminUnlock"),
  addAthleteForm: $("#addAthleteForm"),
  adminAthleteName: $("#adminAthleteName"),
  adminAthleteGrade: $("#adminAthleteGrade"),
  removeAthleteForm: $("#removeAthleteForm"),
  adminRemoveAthlete: $("#adminRemoveAthlete"),
  addBoatForm: $("#addBoatForm"),
  adminBoatName: $("#adminBoatName"),
  adminBoatSeats: $("#adminBoatSeats"),
  adminBoatHullType: $("#adminBoatHullType"),
  adminBoatStatus: $("#adminBoatStatus"),
  removeBoatForm: $("#removeBoatForm"),
  adminRemoveBoat: $("#adminRemoveBoat"),
  boatStatusForm: $("#boatStatusForm"),
  adminStatusBoat: $("#adminStatusBoat"),
  adminStatusValue: $("#adminStatusValue"),
  adminStatusNote: $("#adminStatusNote"),
  adminMessage: $("#adminMessage"),
  enableNotifications: $("#enableNotifications"),
  notificationNotice: $("#notificationNotice"),
  notifyPersonSearch: $("#notifyPersonSearch"),
  notifyPerson: $("#notifyPerson"),
  adminRemoveAthleteSearch: $("#adminRemoveAthleteSearch"),
  adminRemoveBoatSearch: $("#adminRemoveBoatSearch"),
  adminStatusBoatSearch: $("#adminStatusBoatSearch"),
  signOutMessage: $("#signOutMessage"),
  pickerOverlay: $("#pickerOverlay"),
  pickerTitle: $("#pickerTitle"),
  pickerSearch: $("#pickerSearch"),
  pickerList: $("#pickerList"),
  pickerClose: $("#pickerClose")
};
let activePicker = null;
let adminUnlocked = false;

actionButtons.forEach((button) => {
  button.addEventListener("click", () => showView(button.dataset.view));
});

els.signOutForm.addEventListener("submit", signOut);
els.boatSearch.addEventListener("click", openBoatPicker);
els.coxSearch.addEventListener("click", openCoxswainPicker);
els.coxCaptain.addEventListener("change", (event) => setCaptain(event.target));
els.enableNotifications.addEventListener("click", enableNotifications);
els.notifyPersonSearch.addEventListener("click", openNotificationPersonPicker);
els.adminRemoveAthleteSearch.addEventListener("click", openAdminRemoveAthletePicker);
els.adminRemoveBoatSearch.addEventListener("click", () => openAdminBoatPicker("remove"));
els.adminStatusBoatSearch.addEventListener("click", () => openAdminBoatPicker("status"));
els.exportLogbook.addEventListener("click", exportLogbookCsv);
els.adminUnlock.addEventListener("click", unlockAdmin);
els.addAthleteForm.addEventListener("submit", addAdminAthlete);
els.removeAthleteForm.addEventListener("submit", removeAdminAthlete);
els.addBoatForm.addEventListener("submit", addAdminBoat);
els.removeBoatForm.addEventListener("submit", removeAdminBoat);
els.boatStatusForm.addEventListener("submit", updateAdminBoatStatus);
els.pickerClose.addEventListener("click", closePicker);
els.pickerSearch.addEventListener("input", renderPickerList);

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js");
}

setInterval(checkLateCrews, 15000);
render();
syncFleetFromSheet();
syncSharedConfig();
syncSharedOutings();
pollSharedAlerts();
setInterval(syncFleetFromSheet, FLEET_SYNC_INTERVAL_MS);
setInterval(syncSharedConfig, FLEET_SYNC_INTERVAL_MS);
setInterval(syncSharedOutings, SHARED_SYNC_INTERVAL_MS);
setInterval(pollSharedAlerts, ALERT_POLL_INTERVAL_MS);
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    syncFleetFromSheet();
    syncSharedConfig();
    syncSharedOutings();
    pollSharedAlerts();
    renderNotificationNotice();
  }
});
window.addEventListener("focus", renderNotificationNotice);

function load() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return freshDemoData();
  try {
    return normalizeState(JSON.parse(raw));
  } catch {
    return freshDemoData();
  }
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

async function syncSharedOutings() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/outings`, { cache: "no-store" });
    if (!response.ok) throw new Error("Shared outings request failed");
    const payload = await response.json();
    if (!Array.isArray(payload.outings)) return;
    const localBeforeMerge = state.outings;
    state.outings = mergeOutings(state.outings, payload.outings);
    save();
    resyncMissingSharedOutings(localBeforeMerge, payload.outings);
    render();
  } catch (error) {
    console.warn("Shared outing sync failed", error);
  }
}

async function resyncMissingSharedOutings(localOutings = [], sharedOutings = []) {
  const sharedIds = new Set(sharedOutings.map((outing) => outing.id));
  const missing = localOutings.filter((outing) => outing?.id && !sharedIds.has(outing.id));
  for (const outing of missing) {
    await saveSharedOuting(outing);
  }
}

function mergeOutings(localOutings = [], sharedOutings = []) {
  const byId = new Map();
  [...localOutings, ...sharedOutings].forEach((outing) => {
    if (!outing?.id) return;
    const existing = byId.get(outing.id);
    byId.set(outing.id, existing ? newestOuting(existing, outing) : outing);
  });
  return [...byId.values()].sort((a, b) => new Date(b.outAt || 0) - new Date(a.outAt || 0));
}

function newestOuting(a, b) {
  if (b.inAt && !a.inAt) return b;
  if (a.inAt && !b.inAt) return a;
  const aUpdated = new Date(a.inAt || a.outAt || 0).getTime();
  const bUpdated = new Date(b.inAt || b.outAt || 0).getTime();
  return bUpdated >= aUpdated ? { ...a, ...b } : { ...b, ...a };
}

async function saveSharedOuting(outing) {
  try {
    await fetch(`${API_BASE_URL}/api/outings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(outing)
    });
  } catch (error) {
    console.warn("Shared sign-out sync failed", error);
  }
}

async function saveSharedSignIn(outing, issueType = "normal") {
  try {
    const response = await fetch(`${API_BASE_URL}/api/outings/${encodeURIComponent(outing.id)}/sign-in`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        inAt: outing.inAt,
        returnNotes: outing.returnNotes || "",
        damageNote: outing.damageNote || "",
        maintenanceNote: outing.maintenanceNote || "",
        issueType,
        damageIssue: issueType === "damage",
        maintenanceIssue: issueType !== "normal"
      })
    });
    if (!response.ok) throw new Error("Shared sign-in request failed");
    return await response.json();
  } catch (error) {
    console.warn("Shared sign-in sync failed", error);
    return null;
  }
}

async function syncSharedConfig() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/config`, { cache: "no-store" });
    if (!response.ok) return;
    const payload = await response.json();
    let changed = false;
    if (Array.isArray(payload.members)) {
      state.members = mergeMembers(state.members, payload.members, state.removedMembers || []);
      changed = true;
    }
    if (Array.isArray(payload.plant)) {
      const existingById = new Map(state.plant.map((boat) => [boat.id, boat]));
      payload.plant.forEach((boat) => existingById.set(boat.id, applyBoatColour({ ...existingById.get(boat.id), ...boat })));
      state.plant = [...existingById.values()]
        .filter((boat) => !state.boatOverrides?.[boat.id]?.removed)
        .map(applyBoatColour);
      changed = true;
    }
    if (payload.boatOverrides && typeof payload.boatOverrides === "object") {
      state.boatOverrides = { ...(state.boatOverrides || {}), ...payload.boatOverrides };
      changed = true;
    }
    if (Array.isArray(payload.removedMembers)) {
      state.removedMembers = [...new Set([...(state.removedMembers || []), ...payload.removedMembers])];
      state.members = state.members.filter((member) => !state.removedMembers.includes(member.name));
      changed = true;
    }
    if (changed) {
      save();
      render();
    }
  } catch (error) {
    console.warn("Shared admin config sync failed", error);
  }
}

async function saveSharedConfig() {
  try {
    await fetch(`${API_BASE_URL}/api/config`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        members: state.members,
        plant: state.plant,
        boatOverrides: state.boatOverrides || {},
        removedMembers: state.removedMembers || []
      })
    });
  } catch (error) {
    console.warn("Shared admin config save failed", error);
  }
}

async function updateBoatStatusSheet(boat, status, note = "") {
  if (!BOAT_STATUS_WEBHOOK_URL || !boat) return;

  try {
    await fetch(BOAT_STATUS_WEBHOOK_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        boatId: boat.id,
        boatName: boat.name,
        status,
        note,
        updatedAt: new Date().toISOString(),
        source: "Outing Logbook"
      })
    });
  } catch (error) {
    console.warn("Boat status sheet sync failed", error);
  }
}

async function syncFleetFromSheet() {
  try {
    const response = await fetch(`${BOAT_ALLOCATION_CSV_URL}&cacheBust=${Date.now()}`);
    if (!response.ok) throw new Error("Sheet request failed");
    const rows = parseCsv(await response.text());
    const liveFleet = extractFleetFromRows(rows);
    if (!liveFleet.length) return;

    const existingById = new Map(state.plant.map((boat) => [boat.id, boat]));
    const customBoats = state.plant.filter((boat) => boat.custom && !liveFleet.some((liveBoat) => liveBoat.id === boat.id));
    state.plant = liveFleet.map((liveBoat) => {
      const existing = existingById.get(liveBoat.id);
      const override = state.boatOverrides?.[liveBoat.id] || {};
      if (override.removed) return null;
      return applyBoatColour({ ...existing, ...liveBoat, ...override });
    }).concat(customBoats.map(applyBoatColour));
    state.plant = state.plant.filter(Boolean).map(applyBoatColour);
    save();
    render();
  } catch (error) {
    console.warn("Boat allocation sync failed", error);
  }
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && quoted && next === '"') {
      value += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(value);
      value = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(value);
      rows.push(row);
      row = [];
      value = "";
    } else {
      value += char;
    }
  }

  if (value || row.length) {
    row.push(value);
    rows.push(row);
  }
  return rows;
}

function extractFleetFromRows(rows) {
  const rawBoats = [];

  for (const row of rows) {
    const plant = cleanCell(row[0]);
    const weight = cleanCell(row[1]);
    const statusCell = cleanCell(row[3]);
    const boatType = cleanCell(row[4]);

    if (plant === "Oars") break;
    if (!plant || plant === "Plant" || plant === "Boat Allocation") continue;
    if (!/^\d/.test(boatType)) continue;

    rawBoats.push({ plant, weight, statusCell, boatType, key: `${plant}|${boatType}` });
  }

  const totals = rawBoats.reduce((map, boat) => {
    map.set(boat.key, (map.get(boat.key) || 0) + 1);
    return map;
  }, new Map());
  const seen = new Map();

  return rawBoats.map((boat) => {
    const count = (seen.get(boat.key) || 0) + 1;
    seen.set(boat.key, count);
    const duplicateSuffix = totals.get(boat.key) > 1 ? ` ${letterForIndex(count)}` : "";
    const { plant, weight, statusCell, boatType } = boat;
    const displayName = `${plant}${duplicateSuffix} (${boatType})`;
    const id = boatIdFromParts(plant, boatType, statusCell, totals.get(boat.key) > 1 ? count : 0);
    const status = statusFromSheet(statusCell);
    const noteParts = [weight, statusCell].filter(Boolean);

    return {
      id,
      type: "Boat",
      name: displayName,
      seats: inferSeatCount(boatType),
      status,
      note: noteParts.join(", "),
      colour: BOAT_COLOURS[id] || ""
    };
  });
}

function cleanCell(value) {
  return String(value || "").trim();
}

function statusFromSheet(statusCell) {
  const status = cleanCell(statusCell).toLowerCase();
  if (status === "derigged") return "derigged";
  if (status === "repairs" || status === "repair" || status === "needs repair") return "damage";
  if (status === "scull" || status === "sweep") return "available";
  if (status === "rigged" || status === "available" || !status) return "available";
  return "available";
}

function letterForIndex(index) {
  return String.fromCharCode(64 + index);
}

function boatIdFromParts(plant, boatType, statusCell, count) {
  const status = statusFromSheet(statusCell);
  const repairSuffix = status === "damage" ? "-repairs" : status === "derigged" ? "-derigged" : "";
  const duplicateSuffix = count ? `-${letterForIndex(count).toLowerCase()}` : "";
  return `${slugify(plant)}-${inferSeatCount(boatType)}${repairSuffix}${duplicateSuffix}`;
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/'/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function applyBoatColour(boat) {
  if (!boat) return boat;
  return { ...boat, colour: preferredBoatColour(boat) };
}

function preferredBoatColour(boat) {
  if (!boat) return "";
  const name = boat.name || "";
  if (BOAT_COLOURS[boat.id]) return BOAT_COLOURS[boat.id];
  if (isCoachBoat(boat)) return "#000000";
  if (/^wintech\s*\(2x\/2-\)/i.test(name)) return "#F4CCCC";
  if (/^new 1x\b/i.test(name)) return "#FFF2CC";
  if (HULL_TYPE_COLOURS[boat.hullType]) return HULL_TYPE_COLOURS[boat.hullType];
  if (/^bruce slr\b/i.test(name) || /^searite\b/i.test(name)) return "#D9D2E9";
  return boat.colour || "";
}

function freshDemoData() {
  const data = structuredClone(demoData);
  data.plant = data.plant.map(applyBoatColour);
  data.boatOverrides = {};
  data.removedMembers = [];
  return data;
}

function normalizeState(savedState) {
  const merged = { ...freshDemoData(), ...savedState };
  merged.removedMembers = Array.isArray(merged.removedMembers) ? merged.removedMembers : [];
  merged.members = mergeMembers(demoData.members, Array.isArray(merged.members) ? merged.members : [], merged.removedMembers);
  merged.boatOverrides = merged.boatOverrides && typeof merged.boatOverrides === "object" ? merged.boatOverrides : {};
  merged.plant = merged.plant
    .filter((item) => item.type === "Boat")
    .map((item) => applyBoatColour({ ...item, seats: item.seats || inferSeatCount(item.name) }));
  merged.outings = merged.outings.map((outing) => ({
    ...outing,
    members: Array.isArray(outing.members) ? outing.members : []
  }));
  return merged;
}

function mergeMembers(defaultMembers, savedMembers, removedMembers = []) {
  const removed = new Set(removedMembers);
  const membersByName = new Map();
  [...defaultMembers, ...savedMembers].forEach((member) => {
    if (removed.has(member?.name)) return;
    if (!member?.name || membersByName.has(member.name)) return;
    membersByName.set(member.name, member);
  });
  return [...membersByName.values()];
}

function showView(name) {
  actionButtons.forEach((button) => button.classList.toggle("active", button.dataset.view === name));
  views.forEach((view) => view.classList.toggle("active", view.id === `view-${name}`));
  render();
}

function render() {
  renderNotificationPersonOptions();
  renderFormOptions();
  renderLists();
  renderPlant();
  renderLogbook();
  renderAdmin();
  renderNotificationNotice();
}

function renderNotificationPersonOptions() {
  const selectedName = localStorage.getItem(NOTIFICATION_USER_KEY) || "";
  const exists = state.members.some((member) => member.name === selectedName);
  els.notifyPerson.value = exists ? selectedName : "";
  els.notifyPersonSearch.textContent = exists ? selectedName : "Choose your name";
}

function renderFormOptions() {
  if (isSignOutFormActive()) return;
  const usedIds = activeOutings().map((outing) => outing.boatId);
  const selectedBoat = els.boatSelect.value;
  if (selectedBoat && !isBoatSelectable(selectedBoat, usedIds)) clearBoatSelection();

  updateBoatSelectColour();
  renderMemberRowsForSelectedBoat();

}

function isBoatSelectable(boatId, usedIds = activeOutings().map((outing) => outing.boatId)) {
  const boat = state.plant.find((item) => item.id === boatId);
  return Boolean(boat && isBoatSignoutReady(boat) && !usedIds.includes(boat.id));
}

function isSignOutFormActive() {
  if (document.activeElement && els.signOutForm.contains(document.activeElement)) return true;
  return Boolean(
      els.boatSelect.value ||
      els.notes.value ||
      els.coxSelect.value ||
      getMembersFromForm().length ||
      getCaptainFromForm().name
  );
}

function isBoatSignoutReady(boat) {
  return ["rigged", "available", "derigged", "maintenance"].includes(boat.status);
}

function boatStatusSuffix(status) {
  if (status === "damage") return " - damage";
  if (status === "maintenance") return " - maintenance";
  if (status === "derigged") return " - derigged";
  return "";
}

function updateBoatSelectColour() {
  const colour = selectedBoat()?.colour || "#ffffff";
  els.boatSearch.style.backgroundColor = colour;
  els.boatSearch.style.color = isDarkColour(colour) ? "#ffffff" : "";
}

function chooseBoat(boat) {
  els.boatSelect.value = boat.id;
  els.boatSearch.textContent = boat.name;
  updateBoatSelectColour();
  renderMemberRowsForSelectedBoat();
}

function clearBoatSelection() {
  els.boatSelect.value = "";
  els.boatSearch.textContent = "Choose boat";
  updateBoatSelectColour();
}

async function signOut(event) {
  event.preventDefault();
  clearSignOutMessage();
  const submit = els.signOutForm.querySelector("[type='submit']");
  submit.disabled = true;

  try {
    const members = getMembersFromForm();
    const boat = selectedBoat();
    const seats = boat?.seats || 1;
    const uniqueNames = new Set(members.map((member) => member.name));
    const coxswain = getCoxswainFromForm();
    const captain = getCaptainFromForm();
    if (!boat) throw new Error("Please choose a boat.");
    if (!els.dueTime.value) throw new Error("Please enter the expected return time.");
    if (!isBoatSignoutReady(boat)) throw new Error("That boat is not available for sign-out.");
    if (members.length < seats) throw new Error("Please choose a rower for every seat in the boat.");
    if (uniqueNames.size !== members.length) throw new Error("Each rower can only be listed once in the boat.");
    if (isSelectedBoatCoxed() && !coxswain.name) throw new Error("Please choose a coxswain for this boat.");
    if (coxswain.name && uniqueNames.has(coxswain.name)) throw new Error("The coxswain cannot also be listed as a rower.");
    if (!captain.name) throw new Error("Please choose a boat captain.");

    const outing = {
      id: createId(),
      boatId: els.boatSelect.value,
      boatName: plantName(els.boatSelect.value),
      members,
      coxswain,
      captain,
      dueAt: buildDueDate(els.dueTime.value).toISOString(),
      notes: els.notes.value.trim(),
      outAt: new Date().toISOString(),
      inAt: null
    };

    state.outings.unshift(outing);
    save();
    saveSharedOuting(outing);
    sendLogbookEvent("signed_out", outing);
    showSignOutMessage(`${plantName(outing.boatId)} signed out.`, "success");
    els.signOutForm.reset();
    els.memberList.innerHTML = "";
    showView("signin");
  } catch (error) {
    showSignOutMessage(error.message || "The crew could not be signed out.", "error");
  } finally {
    submit.disabled = false;
  }
}

function showSignOutMessage(message, type = "") {
  els.signOutMessage.textContent = message;
  els.signOutMessage.className = `form-message show ${type}`.trim();
}

function clearSignOutMessage() {
  els.signOutMessage.textContent = "";
  els.signOutMessage.className = "form-message";
}

function createId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  if (window.crypto?.getRandomValues) {
    const bytes = new Uint8Array(16);
    window.crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = [...bytes].map((byte) => byte.toString(16).padStart(2, "0"));
    return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex.slice(6, 8).join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10, 16).join("")}`;
  }
  return `outing-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function renderMemberRowsForSelectedBoat() {
  const currentMembers = getMembersFromForm();
  const currentCoxswain = getCoxswainFromForm();
  const currentCaptain = getCaptainFromForm();
  const boat = selectedBoat();
  const seats = boat?.seats || 1;
  els.seatCount.textContent = `${seats} seat${seats === 1 ? "" : "s"}`;
  els.memberList.innerHTML = "";

  for (let index = 0; index < seats; index += 1) {
    addMemberRow(index + 1, currentMembers[index] || { name: "", grade: "" }, currentCaptain);
  }
  renderCoxswainForSelectedBoat(currentCoxswain, currentCaptain);
}

function addMemberRow(seatNumber, member, captain = { name: "" }) {
  const row = document.createElement("div");
  row.className = "member-row";
  row.innerHTML = `
    <span class="seat-label">${seatNumber}</span>
    <button data-field="member-search" class="picker-trigger" type="button" aria-label="Seat ${seatNumber} member">${escapeHtml(member.name || "Choose rower")}</button>
    <input data-field="member" type="hidden" value="${escapeHtml(member.name)}">
    <label class="captain-check" aria-label="Captain">
      <input type="checkbox" data-captain="rower">
    </label>
  `;
  row.querySelector("[data-field='member-search']").addEventListener("click", () => openMemberPicker(row));
  row.querySelector("[data-captain='rower']").addEventListener("change", (event) => setCaptain(event.target));
  els.memberList.append(row);
  if (member.name && member.name === captain.name) {
    row.querySelector("[data-captain='rower']").checked = true;
  }
  updateMemberRowColour(row);
}

function getMembersFromForm() {
  return [...els.memberList.querySelectorAll(".member-row")]
    .map((row) => ({
      ...memberByName(row.querySelector("[data-field='member']").value)
    }))
    .filter((member) => member.name);
}

function renderCoxswainForSelectedBoat(currentCoxswain = { name: "", grade: "" }, captain = { name: "" }) {
  const isCoxed = isSelectedBoatCoxed();
  els.coxSection.hidden = !isCoxed;
  if (!isCoxed) {
    els.coxSelect.value = "";
    els.coxSearch.textContent = "Choose coxswain";
    els.coxCaptain.checked = false;
    updateCoxColour();
    return;
  }

  els.coxSelect.value = currentCoxswain.name || "";
  els.coxSearch.textContent = currentCoxswain.name || "Choose coxswain";
  els.coxCaptain.checked = Boolean(currentCoxswain.name && currentCoxswain.name === captain.name);
  updateCoxColour();
}

function getCoxswainFromForm() {
  if (!els.coxSelect.value) return { name: "", grade: "" };
  return memberByName(els.coxSelect.value);
}

function updateCoxColour() {
  els.coxSection.className = "cox-section";
}

function chooseMember(row, member) {
  const search = row.querySelector("[data-field='member-search']");
  const hidden = row.querySelector("[data-field='member']");
  hidden.value = member.name || "";
  search.textContent = member.name || "Choose rower";
}

function chooseCoxswain(member) {
  els.coxSelect.value = member.name || "";
  els.coxSearch.textContent = member.name || "Choose coxswain";
}

function setCaptain(checkbox) {
  document.querySelectorAll("[data-captain]").forEach((item) => {
    if (item !== checkbox) item.checked = false;
  });
}

function getCaptainFromForm() {
  const checked = document.querySelector("[data-captain]:checked");
  if (!checked) return { name: "", grade: "", role: "" };
  if (checked.dataset.captain === "coxswain") {
    return { ...getCoxswainFromForm(), role: "Coxswain" };
  }
  const row = checked.closest(".member-row");
  return { ...memberByName(row.querySelector("[data-field='member']").value), role: row.querySelector(".seat-label").textContent };
}

function openBoatPicker() {
  openPicker({
    title: "Choose boat",
    placeholder: "Search boats",
    items: sortedBoats()
      .filter((item) => isBoatSelectable(item.id))
      .map((boat) => ({
        label: boat.name,
        detail: boat.note || labelStatus(boat.status),
        value: boat
      })),
    onSelect: chooseBoat
  });
}

function openMemberPicker(row) {
  openPicker({
    title: "Choose rower",
    placeholder: "Type a rower name",
    searchFirst: true,
    items: [
      ...sortedMembers().map((member) => ({
        label: member.name,
        value: member
      })),
      {
        label: "Visitor / unregistered rower",
        detail: "Type their name manually",
        value: { manual: true }
      }
    ],
    onSelect: (member) => {
      if (member.manual) {
        openManualNamePicker("Visitor / unregistered rower", "Enter visitor name", (name) => chooseMember(row, { name, grade: "Visitor" }));
        return false;
      }
      chooseMember(row, member);
      return true;
    }
  });
}

function openCoxswainPicker() {
  openPicker({
    title: "Choose coxswain",
    placeholder: "Type a coxswain name",
    searchFirst: true,
    items: [
      ...sortedMembers().map((member) => ({
        label: member.name,
        value: member
      })),
      {
        label: "Visitor / unregistered coxswain",
        detail: "Type their name manually",
        value: { manual: true }
      }
    ],
    onSelect: (member) => {
      if (member.manual) {
        openManualNamePicker("Visitor / unregistered coxswain", "Enter visitor name", (name) => chooseCoxswain({ name, grade: "Visitor" }));
        return false;
      }
      chooseCoxswain(member);
      return true;
    }
  });
}

function openNotificationPersonPicker() {
  openPicker({
    title: "This device belongs to",
    placeholder: "Type your name",
    items: sortedMembers().map((member) => ({
      label: member.name,
      value: member
    })),
    onSelect: (member) => {
      const previousName = notificationUserName();
      els.notifyPerson.value = member.name;
      els.notifyPersonSearch.textContent = member.name;
      localStorage.setItem(NOTIFICATION_USER_KEY, member.name);
      if (previousName && previousName !== member.name) {
        localStorage.removeItem(PUSH_REGISTERED_KEY);
        localStorage.removeItem(PUSH_REGISTERED_USER_KEY);
      }
      renderNotificationNotice();
      return true;
    }
  });
}

function openAdminRemoveAthletePicker() {
  openPicker({
    title: "Remove athlete",
    placeholder: "Type athlete name",
    items: sortedMembers().map((member) => ({
      label: member.name,
      value: member
    })),
    onSelect: (member) => {
      els.adminRemoveAthlete.value = member.name;
      els.adminRemoveAthleteSearch.textContent = member.name;
      return true;
    }
  });
}

function openAdminBoatPicker(target) {
  const boats = sortedBoats().map((boat) => ({
    label: boat.name,
    detail: labelStatus(boat.status),
    value: boat
  }));
  openPicker({
    title: target === "remove" ? "Remove boat" : "Adjust boat",
    placeholder: "Type boat name",
    items: boats,
    onSelect: (boat) => {
      if (target === "remove") {
        els.adminRemoveBoat.value = boat.id;
        els.adminRemoveBoatSearch.textContent = boat.name;
      } else {
        els.adminStatusBoat.value = boat.id;
        els.adminStatusBoatSearch.textContent = boat.name;
      }
      return true;
    }
  });
}

function sortedMembers() {
  return [...state.members].sort((a, b) => a.name.localeCompare(b.name));
}

function sortedBoats() {
  return [...state.plant]
    .filter((item) => item.type === "Boat")
    .sort(compareBoats);
}

function compareBoats(a, b) {
  return boatTypeRank(a) - boatTypeRank(b)
    || hullTypeRank(a) - hullTypeRank(b)
    || a.name.localeCompare(b.name);
}

function boatTypeRank(boat) {
  if (isCoachBoat(boat)) return 900;
  const type = boatTypeText(boat);
  const seats = boat.seats || inferSeatCount(boat.name);

  if (type.includes("8")) return 10;
  if (type.includes("4-") || type.includes("4x-")) return 20;
  if (type.includes("4+") || type.includes("4x+")) return 30;
  if (seats === 4) return 35;
  if (type.includes("2-") || type.includes("2x/2-") || type.includes("2-/2x")) return 40;
  if (type.includes("2x")) return 45;
  if (seats === 2) return 50;
  if (type.includes("1x") || seats === 1) return 70;
  return 800;
}

function hullTypeRank(boat) {
  if (isCoachBoat(boat)) return 99;
  if (boat.hullType === "racing") return 0;
  if (boat.hullType === "training") return 1;
  if (boat.hullType === "private") return 2;

  const colour = preferredBoatColour(boat);
  if (colour === HULL_TYPE_COLOURS.racing) return 0;
  if (colour === HULL_TYPE_COLOURS.training) return 1;
  if (colour === HULL_TYPE_COLOURS.private) return 2;
  return 3;
}

function boatTypeText(boat) {
  const match = (boat.name || "").match(/\(([^)]+)\)/);
  return (match ? match[1] : boat.name || "").toLowerCase().replace(/\s+/g, "");
}

function isCoachBoat(boat) {
  return /^coach boat\b/i.test(boat?.name || "");
}

function openPicker(config) {
  activePicker = config;
  els.pickerTitle.textContent = config.title;
  els.pickerSearch.placeholder = config.placeholder;
  els.pickerSearch.value = "";
  els.pickerOverlay.hidden = false;
  renderPickerList();
  els.pickerSearch.focus();
}

function openManualNamePicker(title, placeholder, onSubmit) {
  activePicker = {
    title,
    placeholder,
    manual: true,
    onSubmit,
    submitLabel: "Use this name",
    helpText: "Type the name above, then tap here."
  };
  els.pickerTitle.textContent = title;
  els.pickerSearch.placeholder = placeholder;
  els.pickerSearch.value = "";
  els.pickerOverlay.hidden = false;
  renderPickerList();
  els.pickerSearch.focus();
}

function closePicker() {
  if (activePicker?.onCancel) activePicker.onCancel();
  activePicker = null;
  els.pickerOverlay.hidden = true;
  els.pickerList.innerHTML = "";
}

function renderPickerList() {
  if (!activePicker) return;
  if (activePicker.manual) {
    els.pickerList.innerHTML = `
      <button type="button" class="picker-option" data-action="manual-name">
        <strong>${escapeHtml(activePicker.submitLabel || "Use this name")}</strong>
        <span>${escapeHtml(activePicker.helpText || "Type the name above, then tap here.")}</span>
      </button>
    `;
    els.pickerList.querySelector("[data-action='manual-name']").addEventListener("click", () => {
      const name = els.pickerSearch.value.trim();
      if (!name) {
        els.pickerSearch.focus();
        return;
      }
      activePicker.onSubmit(name);
      closePicker();
    });
    return;
  }

  const query = els.pickerSearch.value.trim().toLowerCase();
  const visitorItems = activePicker.items.filter((item) => item.value?.manual);
  const regularItems = activePicker.items.filter((item) => !item.value?.manual);
  const items = activePicker.searchFirst && !query
    ? visitorItems
    : [
        ...regularItems.filter((item) => item.label.toLowerCase().includes(query)),
        ...visitorItems.filter((item) => !query || item.label.toLowerCase().includes(query) || "visitor".includes(query) || "unregistered".includes(query))
      ];
  els.pickerList.innerHTML = items.length
    ? items
        .map(
          (item, index) => `
            <button type="button" class="picker-option" data-index="${index}">
              <strong>${escapeHtml(item.label)}</strong>
              ${item.detail ? `<span>${escapeHtml(item.detail)}</span>` : ""}
            </button>
          `
        )
        .join("")
    : `<div class="empty">No matches.</div>`;

  [...els.pickerList.querySelectorAll("[data-index]")].forEach((button) => {
    button.addEventListener("click", () => {
      const shouldClose = activePicker.onSelect(items[Number(button.dataset.index)].value);
      if (shouldClose !== false) closePicker();
    });
  });
}

function requestIssueNote(title, placeholder, fallback) {
  return new Promise((resolve) => {
    activePicker = {
      title,
      placeholder,
      manual: true,
      submitLabel: "Save note",
      helpText: "Type the note above, then tap here.",
      onSubmit: (value) => resolve(value || fallback),
      onCancel: () => resolve(fallback)
    };
    els.pickerTitle.textContent = title;
    els.pickerSearch.placeholder = placeholder;
    els.pickerSearch.value = fallback;
    els.pickerOverlay.hidden = false;
    renderPickerList();
    els.pickerSearch.focus();
  });
}

window.openBoatPicker = openBoatPicker;
window.openMemberPicker = openMemberPicker;
window.openCoxswainPicker = openCoxswainPicker;

function buildDueDate(value) {
  const [hours, minutes] = value.split(":").map(Number);
  const due = new Date();
  due.setHours(hours, minutes, 0, 0);
  if (due < new Date(Date.now() - 30 * 60 * 1000)) due.setDate(due.getDate() + 1);
  return due;
}

function renderLists() {
  const active = activeOutings();
  const late = active.filter(isLate);
  els.outCount.textContent = active.length;
  els.lateCount.textContent = late.length;

  els.signInList.innerHTML = active.length ? "" : `<div class="empty">Nobody is signed out.</div>`;
  els.onWaterList.innerHTML = active.length ? "" : `<div class="empty">Clear water log.</div>`;

  active.forEach((outing) => {
    els.signInList.append(outingCard(outing, true));
    els.onWaterList.append(outingCard(outing, false));
  });
}

function outingCard(outing, canSignIn) {
  const card = document.createElement("article");
  const late = isLate(outing);
  card.className = `card ${late ? "late" : ""}`;
  const boatColour = selectedBoatColour(outing.boatId);
  if (boatColour) {
    card.style.borderLeft = `10px solid ${boatColour}`;
    card.style.background = late ? `linear-gradient(90deg, ${boatColour} 0, #fff7f5 120px)` : `linear-gradient(90deg, ${boatColour} 0, #ffffff 120px)`;
  }
  card.innerHTML = `
    <div class="row">
      <div>
        <h3>${escapeHtml(plantName(outing.boatId))}</h3>
        <p>${memberSummary(outing.members)}</p>
        ${outing.coxswain?.name ? `<p>Coxswain: ${escapeHtml(outing.coxswain.name)}</p>` : ""}
        ${outing.captain?.name ? `<p>Captain: ${escapeHtml(outing.captain.name)}</p>` : ""}
      </div>
      <span class="tag ${late ? "late" : ""}">${late ? "Late" : "Out"}</span>
    </div>
    ${memberChips(outing.members)}
    ${outing.coxswain?.name ? coxswainChip(outing.coxswain) : ""}
    ${outing.captain?.name ? captainChip(outing.captain) : ""}
    <p>Out ${time(outing.outAt)}. Due ${time(outing.dueAt)}. Alert ${time(alertAt(outing.dueAt))}.</p>
    ${outing.notes ? `<p>${escapeHtml(outing.notes)}</p>` : ""}
    ${
      canSignIn
        ? `<div class="card-actions">
            <button type="button" data-action="in">Sign In</button>
            <button type="button" data-action="maintenance">Maintenance Note</button>
            <button type="button" data-action="damage">Damage</button>
          </div>`
        : ""
    }
  `;

  const signIn = card.querySelector("[data-action='in']");
  const maintenance = card.querySelector("[data-action='maintenance']");
  const damage = card.querySelector("[data-action='damage']");
  if (signIn) signIn.addEventListener("click", () => signInCrew(outing.id, "normal"));
  if (maintenance) maintenance.addEventListener("click", () => signInCrew(outing.id, "maintenance"));
  if (damage) damage.addEventListener("click", () => signInCrew(outing.id, "damage"));
  return card;
}

async function signInCrew(id, issueType = "normal") {
  const outing = state.outings.find((item) => item.id === id);
  if (!outing) return;
  outing.inAt = new Date().toISOString();

  if (issueType === "maintenance" || issueType === "damage") {
    const defaultNote = issueType === "damage" ? "Boat unavailable until checked" : "Maintenance suggested";
    const title = issueType === "damage" ? "Damage report" : "Maintenance note";
    const note = await requestIssueNote(title, "What should coaches and the safety officer know?", defaultNote);
    const boat = state.plant.find((item) => item.id === outing.boatId);
    outing.returnNotes = note;
    outing.issueType = issueType;
    if (issueType === "damage") {
      outing.damageNote = note;
      outing.damageIssue = true;
      outing.maintenanceIssue = true;
    } else {
      outing.maintenanceNote = note;
      outing.maintenanceIssue = true;
    }
    if (issueType === "damage" && boat) {
      boat.status = "damage";
      boat.note = note;
      state.boatOverrides[boat.id] = { status: "damage", note };
      updateBoatStatusSheet(boat, "Repairs", note);
    }
  }

  save();
  const sharedResult = await saveSharedSignIn(outing, issueType);
  if (sharedResult?.outing) Object.assign(outing, sharedResult.outing);
  sendLogbookEvent(issueType === "normal" ? "signed_in" : `signed_in_${issueType}`, outing);
  render();
}

function renderLogbook() {
  const outings = [...state.outings].sort((a, b) => new Date(b.outAt) - new Date(a.outAt));
  els.logbookList.innerHTML = outings.length ? "" : `<div class="empty">No outings recorded yet.</div>`;

  outings.forEach((outing) => {
    const card = document.createElement("article");
    const status = outing.inAt ? "Returned" : isLate(outing) ? "Late" : "On Water";
    card.className = `logbook-row ${status === "Late" ? "late" : ""}`;
    card.innerHTML = `
      <div>
        <strong>${escapeHtml(dateTime(outing.outAt))}</strong>
        <span>${escapeHtml(status)}</span>
      </div>
      <div>
        <strong>${escapeHtml(plantName(outing.boatId))}</strong>
        <span>${escapeHtml(logbookPeople(outing))}</span>
      </div>
      <div>
        <span>Due ${time(outing.dueAt)} · Alert ${time(alertAt(outing.dueAt))}</span>
        <span>${outing.inAt ? `In ${time(outing.inAt)}` : "Not signed in"}</span>
        ${outing.issueType ? `<span>${escapeHtml(issueLabel(outing))}</span>` : ""}
      </div>
    `;
    els.logbookList.append(card);
  });
}

function renderAdmin() {
  const removeAthlete = state.members.find((member) => member.name === els.adminRemoveAthlete.value);
  els.adminRemoveAthleteSearch.textContent = removeAthlete ? removeAthlete.name : "Choose athlete";
  if (!removeAthlete) els.adminRemoveAthlete.value = "";

  const removeBoat = state.plant.find((boat) => boat.id === els.adminRemoveBoat.value);
  els.adminRemoveBoatSearch.textContent = removeBoat ? removeBoat.name : "Choose boat";
  if (!removeBoat) els.adminRemoveBoat.value = "";

  const statusBoat = state.plant.find((boat) => boat.id === els.adminStatusBoat.value);
  els.adminStatusBoatSearch.textContent = statusBoat ? statusBoat.name : "Choose boat";
  if (!statusBoat) els.adminStatusBoat.value = "";
}

function unlockAdmin() {
  if (els.adminPassword.value !== ADMIN_PASSWORD) {
    showAdminMessage("Incorrect admin password.", "error");
    return;
  }
  adminUnlocked = true;
  els.adminLogin.hidden = true;
  els.adminTools.hidden = false;
  els.adminStatus.textContent = "Unlocked";
  els.adminStatus.classList.add("unlocked");
  els.adminPassword.value = "";
  showAdminMessage("Admin unlocked for this device.", "success");
}

function requireAdminUnlocked() {
  if (adminUnlocked) return true;
  els.adminLogin.hidden = false;
  els.adminTools.hidden = true;
  els.adminStatus.textContent = "Locked";
  els.adminStatus.classList.remove("unlocked");
  showAdminMessage("Enter the admin password before making changes.", "error");
  return false;
}

function addAdminAthlete(event) {
  event.preventDefault();
  if (!requireAdminUnlocked()) return;
  const name = els.adminAthleteName.value.trim();
  if (!name) {
    showAdminMessage("Enter an athlete name.", "error");
    return;
  }
  if (state.members.some((member) => member.name.toLowerCase() === name.toLowerCase())) {
    showAdminMessage(`${name} is already in the athlete list.`, "error");
    return;
  }
  state.members.push({ name, grade: els.adminAthleteGrade.value });
  state.members = sortedMembers();
  save();
  saveSharedConfig();
  els.addAthleteForm.reset();
  render();
  showAdminMessage(`${name} added. Athlete list now has ${state.members.length} names.`, "success");
}

function removeAdminAthlete(event) {
  event.preventDefault();
  if (!requireAdminUnlocked()) return;
  const name = els.adminRemoveAthlete.value;
  if (!name) {
    showAdminMessage("Choose an athlete to remove.", "error");
    return;
  }
  state.members = state.members.filter((member) => member.name !== name);
  state.removedMembers = [...new Set([...(state.removedMembers || []), name])];
  save();
  saveSharedConfig();
  render();
  showAdminMessage(`${name} removed. Athlete list now has ${state.members.length} names.`, "success");
}

function addAdminBoat(event) {
  event.preventDefault();
  if (!requireAdminUnlocked()) return;
  const name = els.adminBoatName.value.trim();
  if (!name) {
    showAdminMessage("Enter a boat name.", "error");
    return;
  }
  const hullType = els.adminBoatHullType.value || "racing";
  const id = uniqueBoatId(name, els.adminBoatSeats.value);
  state.plant.push(applyBoatColour({
    id,
    type: "Boat",
    name,
    seats: Number(els.adminBoatSeats.value),
    hullType,
    status: els.adminBoatStatus.value,
    note: "",
    custom: true
  }));
  save();
  saveSharedConfig();
  els.addBoatForm.reset();
  render();
  showAdminMessage(`${name} added. Boat list now has ${state.plant.filter((item) => item.type === "Boat").length} boats.`, "success");
}

function removeAdminBoat(event) {
  event.preventDefault();
  if (!requireAdminUnlocked()) return;
  const boatId = els.adminRemoveBoat.value;
  const boat = state.plant.find((item) => item.id === boatId);
  if (!boat) {
    showAdminMessage("Choose a boat to remove.", "error");
    return;
  }
  if (activeOutings().some((outing) => outing.boatId === boatId)) {
    showAdminMessage("That boat is currently on water. Sign it in before removing it.", "error");
    return;
  }
  state.plant = state.plant.filter((item) => item.id !== boatId);
  state.boatOverrides[boatId] = { removed: true };
  save();
  saveSharedConfig();
  render();
  showAdminMessage(`${boat.name} removed. Boat list now has ${state.plant.filter((item) => item.type === "Boat").length} boats.`, "success");
}

function updateAdminBoatStatus(event) {
  event.preventDefault();
  if (!requireAdminUnlocked()) return;
  const boat = state.plant.find((item) => item.id === els.adminStatusBoat.value);
  if (!boat) {
    showAdminMessage("Choose a boat to update.", "error");
    return;
  }
  boat.status = els.adminStatusValue.value;
  boat.note = els.adminStatusNote.value.trim();
  state.boatOverrides[boat.id] = { status: boat.status, note: boat.note };
  save();
  saveSharedConfig();
  updateBoatStatusSheet(boat, boat.status === "damage" ? "Repairs" : labelStatus(boat.status), boat.note);
  render();
  showAdminMessage(`${boat.name} updated to ${labelStatus(boat.status)}.`, "success");
}

function uniqueBoatId(name, seats) {
  const base = `${slugify(name)}-${seats}`;
  let id = base;
  let index = 2;
  while (state.plant.some((item) => item.id === id)) {
    id = `${base}-${index}`;
    index += 1;
  }
  return id;
}

function showAdminMessage(message, type = "") {
  els.adminMessage.textContent = message;
  els.adminMessage.className = `form-message show ${type}`.trim();
  els.adminMessage.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function logbookPeople(outing) {
  const rowers = (outing.members || []).map((member) => member.name).join(", ");
  const cox = outing.coxswain?.name ? ` Cox: ${outing.coxswain.name}.` : "";
  const captain = outing.captain?.name ? ` Captain: ${outing.captain.name}.` : "";
  return `${rowers}.${cox}${captain}`;
}

function issueLabel(outing) {
  if (outing.issueType === "damage") return `Damage: ${outing.damageNote || outing.returnNotes || "Needs checking"}`;
  if (outing.issueType === "maintenance") return `Maintenance: ${outing.maintenanceNote || outing.returnNotes || "Maintenance suggested"}`;
  return "";
}

function sendLogbookEvent(eventType, outing) {
  if (!LOGBOOK_WEBHOOK_URL) return;

  const payload = logbookPayload(eventType, outing);
  fetch(LOGBOOK_WEBHOOK_URL, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload)
  }).catch((error) => console.warn("Logbook sync failed", error));
}

function logbookPayload(eventType, outing) {
  return {
    eventType,
    outingId: outing.id,
    boat: plantName(outing.boatId),
    boatId: outing.boatId,
    status: outing.inAt ? "Returned" : "On Water",
    rowers: (outing.members || []).map((member) => `${member.name} (${member.grade})`),
    visitors: visitorNames(outing),
    coxswain: outing.coxswain?.name || "",
    captain: outing.captain?.name || "",
    issueType: outing.issueType || "",
    outAt: outing.outAt,
    dueAt: outing.dueAt,
    alertAt: alertAt(outing.dueAt).toISOString(),
    inAt: outing.inAt || "",
    notes: outing.notes || "",
    returnNotes: outing.returnNotes || "",
    damageNote: outing.damageNote || "",
    maintenanceNote: outing.maintenanceNote || "",
    damageIssue: Boolean(outing.damageIssue),
    maintenanceIssue: Boolean(outing.maintenanceIssue),
    recordedAt: new Date().toISOString()
  };
}

function exportLogbookCsv() {
  const rows = [
    ["Outing ID", "Boat", "Status", "Rowers", "Visitors", "Coxswain", "Captain", "Out", "Due", "Alert", "In", "Notes", "Return Notes"]
  ];
  state.outings.forEach((outing) => {
    rows.push([
      outing.id,
      plantName(outing.boatId),
      outing.inAt ? "Returned" : "On Water",
      (outing.members || []).map((member) => `${member.name} (${member.grade})`).join("; "),
      visitorNames(outing).join("; "),
      outing.coxswain?.name || "",
      outing.captain?.name || "",
      dateTime(outing.outAt),
      dateTime(outing.dueAt),
      dateTime(alertAt(outing.dueAt)),
      outing.inAt ? dateTime(outing.inAt) : "",
      outing.notes || "",
      outing.returnNotes || ""
    ]);
  });

  const csv = rows.map((row) => row.map(csvCell).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `awrc-water-log-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function visitorNames(outing) {
  const rowerVisitors = (outing.members || [])
    .filter((member) => ["Visitor", "Other"].includes(member.grade))
    .map((member) => member.name);
  const coxswainVisitor = ["Visitor", "Other"].includes(outing.coxswain?.grade) ? [outing.coxswain.name] : [];
  return [...rowerVisitors, ...coxswainVisitor].filter(Boolean);
}

function renderPlant() {
  const usedIds = activeOutings().map((outing) => outing.boatId);
  els.plantList.innerHTML = "";
  sortedBoats().forEach((item) => {
    const status = usedIds.includes(item.id) ? "used" : item.status;
    const card = document.createElement("article");
    card.className = "card";
    if (item.colour) {
      card.style.borderLeft = `10px solid ${item.colour}`;
      card.style.background = `linear-gradient(90deg, ${item.colour} 0, #ffffff 120px)`;
    }
    card.innerHTML = `
      <div class="row">
        <div>
          <h3>${escapeHtml(item.name)}</h3>
          <p>${escapeHtml(item.type)}${item.note ? ` - ${escapeHtml(item.note)}` : ""}</p>
        </div>
        <span class="tag ${status}">${labelStatus(status)}</span>
      </div>
    `;
    els.plantList.append(card);
  });
}

function checkLateCrews() {
  renderLists();
  renderPlant();
}

function sendOverdueAlert(outing) {
  const boat = plantName(outing.boatId);
  const recipients = alertRecipients(outing);
  const message = `${boat} was due back at ${time(outing.dueAt)}. The 30-minute grace period has passed. Alert: ${recipients.join(", ")}.`;
  sendPushAlert({
    key: `overdue-open-app-${outing.id}-${Date.now()}`,
    type: "overdue",
    title: "Boat overdue",
    message,
    recipients,
    outing: alertPayload(outing)
  });
  sendNotificationForAlert({
    key: `overdue-${outing.id}`,
    title: "Boat overdue",
    message,
    recipients,
    requireInteraction: true
  });
}

function sendDamageAlert(outing, note) {
  const boat = plantName(outing.boatId);
  const recipients = alertRecipients(outing);
  const message = `${boat} has been signed in with damage: ${note}. It is unavailable until checked.`;
  sendPushAlert({
    key: `damage-${outing.id}`,
    type: "damage",
    title: "Boat damage reported",
    message,
    recipients,
    outing: alertPayload(outing),
    requireInteraction: true
  });
  sendNotificationForAlert({
    key: `damage-${outing.id}`,
    title: "Boat damage reported",
    message,
    recipients,
    tag: `damage-${outing.id}`,
    requireInteraction: true
  });
}

function sendMaintenanceAlert(outing, note) {
  const boat = plantName(outing.boatId);
  const recipients = alertRecipients(outing);
  const message = `${boat} has a maintenance note: ${note}. The boat has not been marked unavailable.`;
  sendPushAlert({
    key: `maintenance-${outing.id}`,
    type: "maintenance",
    title: "Boat maintenance note",
    message,
    recipients,
    outing: alertPayload(outing),
    requireInteraction: true
  });
  sendNotificationForAlert({
    key: `maintenance-${outing.id}`,
    title: "Boat maintenance note",
    message,
    recipients,
    tag: `maintenance-${outing.id}`,
    requireInteraction: true
  });
}

function alertRecipients(outing) {
  const names = [
    outing.captain?.name,
    ...ALERT_ROLES.coaches,
    ALERT_ROLES.safetyOfficer,
    ...ALERT_ROLES.alwaysNotify
  ].filter(Boolean);
  return [...new Set(names)];
}

function alertPayload(outing) {
  return {
    outingId: outing.id,
    boat: plantName(outing.boatId),
    rowers: (outing.members || []).map((member) => member.name),
    coxswain: outing.coxswain?.name || "",
    captain: outing.captain?.name || "",
    coaches: ALERT_ROLES.coaches,
    safetyOfficer: ALERT_ROLES.safetyOfficer,
    outAt: outing.outAt,
    dueAt: outing.dueAt,
    alertAt: alertAt(outing.dueAt).toISOString(),
    notes: outing.notes || "",
    damageNote: outing.damageNote || "",
    maintenanceNote: outing.maintenanceNote || "",
    issueType: outing.issueType || "",
    damageIssue: Boolean(outing.damageIssue),
    maintenanceIssue: Boolean(outing.maintenanceIssue)
  };
}

function sendPushAlert(payload) {
  sendStressTestAlert(payload);
}

async function sendStressTestAlert(payload) {
  try {
    await fetch(`${API_BASE_URL}/api/alerts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  } catch (error) {
    console.warn("Stress-test alert sync failed", error);
  }
}

async function pollSharedAlerts() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/alerts`, { cache: "no-store" });
    if (!response.ok) throw new Error("Shared alerts request failed");
    const payload = await response.json();
    const alerts = Array.isArray(payload.alerts) ? payload.alerts : [];
    alerts.forEach((alert) => {
      const key = alert.key || alert.id || `${alert.type}-${alert.createdAt}`;
      if (seenAlertKeys.has(key)) return;
      if (sendNotificationForAlert(alert)) seenAlertKeys.add(key);
    });
    localStorage.setItem(SEEN_ALERTS_KEY, JSON.stringify([...seenAlertKeys].slice(-300)));
  } catch (error) {
    console.warn("Shared alert polling failed", error);
  }
}

function sendNotificationForAlert(alert) {
  if (isPushRegisteredForCurrentUser()) return false;
  if (!shouldReceiveAlert(alert)) return false;
  sendNotification(alert.title || "Outing Logbook alert", alert.message || "Open Outing Logbook for details.", {
    tag: alert.key || alert.id || alert.type || "water-log-alert",
    requireInteraction: Boolean(alert.requireInteraction)
  });
  return true;
}

function shouldReceiveAlert(alert) {
  const recipients = Array.isArray(alert.recipients) ? alert.recipients.filter(Boolean) : [];
  if (!recipients.length) return false;
  const currentUser = notificationUserName();
  return Boolean(currentUser && recipients.includes(currentUser));
}

function notificationUserName() {
  return els.notifyPerson?.value || localStorage.getItem(NOTIFICATION_USER_KEY) || "";
}

function isPushRegisteredForCurrentUser() {
  return localStorage.getItem(PUSH_REGISTERED_KEY) === "true"
    && localStorage.getItem(PUSH_REGISTERED_USER_KEY) === notificationUserName();
}

async function enableNotifications() {
  if (!("Notification" in window)) {
    alert("This browser does not support notifications.");
    return;
  }
  if (!notificationUserName()) {
    alert("Please choose who this device belongs to before enabling notifications.");
    return;
  }

  const permission = Notification.permission === "granted" ? "granted" : await Notification.requestPermission();
  if (permission === "granted") {
    const pushReady = await registerDeviceForPush();
    const body = pushReady
      ? "This device is registered for Outing Logbook phone pop-up alerts."
      : "This device can show Outing Logbook pop-up alerts while the app is open.";
    sendNotification("Notifications enabled", body);
  }
  renderNotificationNotice();
}

function renderNotificationNotice() {
  if (!("Notification" in window)) {
    els.notificationNotice.querySelector("p").textContent = "This browser does not support notifications.";
    els.enableNotifications.textContent = "Unavailable";
    els.enableNotifications.disabled = true;
    return;
  }

  if (Notification.permission === "granted") {
    if (isPushRegisteredForCurrentUser()) {
      els.notificationNotice.querySelector("p").textContent = `Enabled for ${notificationUserName() || "this device"}. This device only gets alerts addressed to that person.`;
      els.enableNotifications.textContent = "Enabled";
      els.enableNotifications.disabled = true;
      return;
    }

    els.notificationNotice.querySelector("p").textContent = "Notifications are allowed, but this device still needs to be registered for phone push alerts. Tap Enable once more.";
    els.enableNotifications.textContent = "Enable";
    els.enableNotifications.disabled = false;
    return;
  }

  if (Notification.permission === "denied") {
    els.notificationNotice.querySelector("p").textContent = "Notifications are blocked for this page. Change the browser site settings to allow them.";
    els.enableNotifications.textContent = "Blocked";
    els.enableNotifications.disabled = true;
    return;
  }

  els.notificationNotice.querySelector("p").textContent = "Choose your name, then tap Enable once. Captains only get alerts for their own boat. Coaches and the safety officer get late and damage alerts.";
  els.enableNotifications.textContent = "Enable";
  els.enableNotifications.disabled = false;
}

async function registerDeviceForPush() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return false;
  const publicKey = await getPushPublicKey();
  if (!publicKey) return false;
  const userName = notificationUserName();
  if (!userName) return false;

  try {
    const registration = await navigator.serviceWorker.register("service-worker.js");
    await registration.update().catch(() => {});
    await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();
    subscription = subscription || (await subscribeForPush(registration, publicKey));

    try {
      await sendPushSubscription(subscription, userName);
    } catch (error) {
      console.warn("Push subscription failed; trying a fresh phone registration", error);
      await subscription.unsubscribe().catch(() => {});
      subscription = await subscribeForPush(registration, publicKey);
      await sendPushSubscription(subscription, userName);
    }

    localStorage.setItem(PUSH_REGISTERED_KEY, "true");
    localStorage.setItem(PUSH_REGISTERED_USER_KEY, userName);
    return true;
  } catch (error) {
    console.warn("Push registration failed", error);
    localStorage.removeItem(PUSH_REGISTERED_KEY);
    localStorage.removeItem(PUSH_REGISTERED_USER_KEY);
    return false;
  }
}

function subscribeForPush(registration, publicKey) {
  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey)
  });
}

async function getPushPublicKey() {
  if (pushPublicVapidKey) return pushPublicVapidKey;
  try {
    const response = await fetch(`${API_BASE_URL}/api/push/public-key`, { cache: "no-store" });
    if (!response.ok) return "";
    const payload = await response.json();
    pushPublicVapidKey = payload.publicKey || "";
    return pushPublicVapidKey;
  } catch {
    return "";
  }
}

async function sendPushSubscription(subscription, userName) {
  const response = await fetch(`${API_BASE_URL}/api/push/subscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      subscription,
      userName,
      app: "AWRC Outing Logbook",
      registeredAt: new Date().toISOString()
    })
  });
  if (!response.ok) throw new Error("Notification registration was not saved.");
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = `${base64String}${padding}`.replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

function sendNotification(title, body, options = {}) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => registration.showNotification(title, {
        body,
        icon: "/logbook-icon-v10.png",
        badge: "/logbook-icon-v10.png",
        tag: options.tag || title,
        requireInteraction: Boolean(options.requireInteraction)
      }))
      .catch(() => showWindowNotification(title, body, options));
  } else {
    showWindowNotification(title, body, options);
  }
}

function showWindowNotification(title, body, options = {}) {
  new Notification(title, {
    body,
    icon: "/logbook-icon-v10.png",
    tag: options.tag || title,
    requireInteraction: Boolean(options.requireInteraction)
  });
}

function activeOutings() {
  return state.outings.filter((outing) => !outing.inAt);
}

function isLate(outing) {
  return Date.now() > alertAt(outing.dueAt).getTime();
}

function alertAt(dueAt) {
  return new Date(new Date(dueAt).getTime() + OVERDUE_GRACE_MINUTES * 60 * 1000);
}

function plantName(id) {
  return state.plant.find((item) => item.id === id)?.name || "Unknown boat";
}

function selectedBoatColour(id) {
  return preferredBoatColour(state.plant.find((item) => item.id === id)) || BOAT_COLOURS[id] || "";
}

function isDarkColour(colour) {
  if (!colour || !colour.startsWith("#")) return false;
  const hex = colour.replace("#", "");
  const fullHex = hex.length === 3 ? [...hex].map((char) => char + char).join("") : hex;
  if (fullHex.length !== 6) return false;
  const red = parseInt(fullHex.slice(0, 2), 16);
  const green = parseInt(fullHex.slice(2, 4), 16);
  const blue = parseInt(fullHex.slice(4, 6), 16);
  return (red * 299 + green * 587 + blue * 114) / 1000 < 120;
}

function selectedBoat() {
  return state.plant.find((item) => item.id === els.boatSelect.value);
}

function isSelectedBoatCoxed() {
  return isCoxedBoat(selectedBoat());
}

function isCoxedBoat(boat) {
  if (!boat) return false;
  const typeMatch = boat.name.match(/\(([^)]+)\)/);
  const type = typeMatch ? typeMatch[1] : boat.name;
  return type.split("/").some((part) => ["4+", "4x+", "8x+", "8+"].includes(part.trim()));
}

function memberByName(name) {
  if (!name) return { name: "", grade: "" };
  return state.members.find((member) => member.name === name) || { name, grade: "Visitor" };
}

function updateMemberRowColour(row) {
  row.className = "member-row";
}

function inferSeatCount(name = "") {
  const lowerName = name.toLowerCase();
  const numericSeatCount = lowerName.match(/\b([1248])(?:x|\+|-|\/|$)/);
  if (numericSeatCount) return Number(numericSeatCount[1]);
  if (lowerName.includes("eight")) return 8;
  if (lowerName.includes("four") || lowerName.includes("quad")) return 4;
  if (lowerName.includes("double") || lowerName.includes("pair")) return 2;
  if (lowerName.includes("single")) return 1;
  return 1;
}

function memberSummary(members = []) {
  if (!members.length) return "No members listed";
  return `${members.length} member${members.length === 1 ? "" : "s"} listed`;
}

function memberChips(members = []) {
  if (!members.length) return "";
  return `
    <div class="member-chips">
      ${members
        .map((member) => `<span class="member-chip">${escapeHtml(member.name)}</span>`)
        .join("")}
    </div>
  `;
}

function coxswainChip(coxswain) {
  return `
    <div class="member-chips">
      <span class="member-chip">Coxswain: ${escapeHtml(coxswain.name)}</span>
    </div>
  `;
}

function captainChip(captain) {
  return `
    <div class="member-chips">
      <span class="member-chip captain-chip">Captain: ${escapeHtml(captain.name)}</span>
    </div>
  `;
}

function labelStatus(status) {
  if (status === "used") return "On Water";
  if (status === "derigged") return "Derigged";
  if (status === "damage") return "Damage";
  if (status === "maintenance") return "Maintenance";
  if (status === "rigged") return "Rigged";
  return "Available";
}

function time(value) {
  return new Date(value).toLocaleTimeString("en-NZ", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Pacific/Auckland"
  });
}

function dateTime(value) {
  if (!value) return "";
  return new Date(value).toLocaleString("en-NZ", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Pacific/Auckland"
  });
}

function csvCell(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
