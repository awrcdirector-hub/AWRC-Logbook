const STORAGE_KEY = "club-water-log-prototype-v8";
const OVERDUE_GRACE_MINUTES = 30;
const FLEET_SYNC_INTERVAL_MS = 60 * 1000;
const SHARED_SYNC_INTERVAL_MS = 5000;
const ALERT_POLL_INTERVAL_MS = 5000;
const BOAT_ALLOCATION_CSV_URL = "https://docs.google.com/spreadsheets/d/1u5FggSDDpYk5m24o4D8UdPPujGj8G54US7rQ0PNE-B0/export?format=csv";
const API_BASE_URL = "";
const LOGBOOK_WEBHOOK_URL = "";
const BOAT_STATUS_WEBHOOK_URL = "";
const PUSH_ALERT_WEBHOOK_URL = "";
const PUSH_SUBSCRIPTION_WEBHOOK_URL = "";
const PUSH_PUBLIC_VAPID_KEY = "";
const ALERT_ROLES = {
  coaches: ["Axel Dickinson", "Allan Luff"],
  safetyOfficer: "Axel Dickinson"
};
const GRADE_COLOURS = {
  Novice: { background: "#fff2a8", text: "#4c3d00" },
  Intermediate: { background: "#ffd4e5", text: "#671737" },
  Club: { background: "#f2483d", text: "#ffffff" },
  Senior: { background: "#151515", text: "#ffffff" },
  Premier: { background: "#d7a928", text: "#221900" },
  Masters: { background: "#4f9b58", text: "#ffffff" },
  Coxswain: { background: "#8e5ad7", text: "#ffffff" }
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
  "garth-hammond-1": "#D9D2E9",
  "pat-spriggens-1": "#D9D2E9",
  "keith-mayberry-1": "#D9D2E9",
  "nana-1": "#D9D2E9",
  "brenda-ii-1": "#D9D2E9",
  "brocky-wintech-1": "#D9D2E9",
  "coles-family-1": "#D9D2E9",
  "white-kirs-1": "#D9D2E9"
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
    { name: "Allan Luff", grade: "Masters" },
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
let sharedAlertsPrimed = Boolean(localStorage.getItem(`${STORAGE_KEY}-last-alert-at`));

const $ = (selector) => document.querySelector(selector);
const views = document.querySelectorAll(".view");
const actionButtons = document.querySelectorAll(".big-action");

const els = {
  outCount: $("#outCount"),
  lateCount: $("#lateCount"),
  boatSelect: $("#boatSelect"),
  memberList: $("#memberList"),
  seatCount: $("#seatCount"),
  coxSection: $("#coxSection"),
  coxSelect: $("#coxSelect"),
  coxCaptain: $("#coxCaptain"),
  dueTime: $("#dueTime"),
  notes: $("#notes"),
  signOutForm: $("#signOutForm"),
  signInList: $("#signInList"),
  onWaterList: $("#onWaterList"),
  plantList: $("#plantList"),
  logbookList: $("#logbookList"),
  exportLogbook: $("#exportLogbook"),
  enableNotifications: $("#enableNotifications"),
  notificationNotice: $("#notificationNotice"),
  signOutMessage: $("#signOutMessage"),
  resetDemo: $("#resetDemo")
};

actionButtons.forEach((button) => {
  button.addEventListener("click", () => showView(button.dataset.view));
});

els.signOutForm.addEventListener("submit", signOut);
els.boatSelect.addEventListener("change", () => {
  updateBoatSelectColour();
  renderMemberRowsForSelectedBoat();
});
els.coxSelect.addEventListener("change", () => updateCoxColour());
els.coxCaptain.addEventListener("change", (event) => setCaptain(event.target));
els.enableNotifications.addEventListener("click", enableNotifications);
els.resetDemo.addEventListener("click", resetDemo);
els.exportLogbook.addEventListener("click", exportLogbookCsv);

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js");
}

setInterval(checkLateCrews, 15000);
render();
syncFleetFromSheet();
syncSharedOutings();
pollSharedAlerts();
setInterval(syncFleetFromSheet, FLEET_SYNC_INTERVAL_MS);
setInterval(syncSharedOutings, SHARED_SYNC_INTERVAL_MS);
setInterval(pollSharedAlerts, ALERT_POLL_INTERVAL_MS);
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    syncFleetFromSheet();
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
    state.outings = payload.outings;
    save();
    render();
  } catch (error) {
    console.warn("Shared outing sync failed", error);
  }
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

async function saveSharedSignIn(outing, hasDamage) {
  try {
    await fetch(`${API_BASE_URL}/api/outings/${encodeURIComponent(outing.id)}/sign-in`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        inAt: outing.inAt,
        returnNotes: outing.returnNotes || "",
        damageNote: outing.damageNote || "",
        maintenanceIssue: hasDamage
      })
    });
  } catch (error) {
    console.warn("Shared sign-in sync failed", error);
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
        source: "Water Log"
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
    state.plant = liveFleet.map((liveBoat) => {
      const existing = existingById.get(liveBoat.id);
      return { ...existing, ...liveBoat };
    });
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
  if (status === "repairs" || status === "repair" || status === "needs repair") return "maintenance";
  if (status === "scull" || status === "sweep") return "available";
  if (status === "rigged" || status === "available" || !status) return "available";
  return "available";
}

function letterForIndex(index) {
  return String.fromCharCode(64 + index);
}

function boatIdFromParts(plant, boatType, statusCell, count) {
  const status = statusFromSheet(statusCell);
  const repairSuffix = status === "maintenance" ? "-repairs" : status === "derigged" ? "-derigged" : "";
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

function freshDemoData() {
  const data = structuredClone(demoData);
  data.plant = data.plant.map((boat) => ({ ...boat, colour: BOAT_COLOURS[boat.id] || "" }));
  return data;
}

function normalizeState(savedState) {
  const merged = { ...freshDemoData(), ...savedState };
  merged.members = Array.isArray(merged.members) ? merged.members : demoData.members;
  merged.plant = merged.plant
    .filter((item) => item.type === "Boat")
    .map((item) => ({ ...item, seats: item.seats || inferSeatCount(item.name), colour: item.colour || BOAT_COLOURS[item.id] || "" }));
  merged.outings = merged.outings.map((outing) => ({
    ...outing,
    members: Array.isArray(outing.members) ? outing.members : []
  }));
  return merged;
}

function showView(name) {
  actionButtons.forEach((button) => button.classList.toggle("active", button.dataset.view === name));
  views.forEach((view) => view.classList.toggle("active", view.id === `view-${name}`));
  render();
}

function render() {
  renderFormOptions();
  renderLists();
  renderPlant();
  renderLogbook();
  renderNotificationNotice();
}

function renderFormOptions() {
  const usedIds = activeOutings().map((outing) => outing.boatId);
  const selectedBoat = els.boatSelect.value;
  els.boatSelect.innerHTML = plantOptions("Boat", usedIds);
  if (selectedBoat && [...els.boatSelect.options].some((option) => option.value === selectedBoat && !option.disabled)) {
    els.boatSelect.value = selectedBoat;
  }

  updateBoatSelectColour();
  renderMemberRowsForSelectedBoat();

  if (!els.dueTime.value) {
    const due = new Date(Date.now() + 90 * 60 * 1000);
    els.dueTime.value = `${String(due.getHours()).padStart(2, "0")}:${String(due.getMinutes()).padStart(2, "0")}`;
  }
}

function plantOptions(type, usedIds) {
  return state.plant
    .filter((item) => item.type === type)
    .map((item) => {
      const unavailable = !isBoatSignoutReady(item) || usedIds.includes(item.id);
      const suffix = usedIds.includes(item.id) ? " - on water" : boatStatusSuffix(item.status);
      const colour = item.colour || "#ffffff";
      return `<option value="${item.id}" ${unavailable ? "disabled" : ""} style="background-color: ${colour}; color: #172126;">${escapeHtml(item.name + suffix)}</option>`;
    })
    .join("");
}

function isBoatSignoutReady(boat) {
  return boat.status === "rigged" || boat.status === "available";
}

function boatStatusSuffix(status) {
  if (status === "maintenance") return " - repair";
  if (status === "derigged") return " - derigged";
  return "";
}

function updateBoatSelectColour() {
  const colour = selectedBoat()?.colour || "#ffffff";
  els.boatSelect.style.backgroundColor = colour;
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
    sendNotification("Boat signed out", `${plantName(outing.boatId)} is due back at ${time(outing.dueAt)}.`);
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
  row.className = `member-row ${gradeClass(member.grade)}`;
  row.innerHTML = `
    <span class="seat-label">${seatNumber}</span>
    <select data-field="member" aria-label="Seat ${seatNumber} member">
      ${memberOptions("Choose rower", member.name)}
    </select>
    <label class="captain-check" aria-label="Captain">
      <input type="checkbox" data-captain="rower">
    </label>
  `;
  row.querySelector("[data-field='member']").addEventListener("change", () => updateMemberRowColour(row));
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
    els.coxCaptain.checked = false;
    updateCoxColour();
    return;
  }

  els.coxSelect.innerHTML = memberOptions("Choose coxswain", currentCoxswain.name);
  els.coxCaptain.checked = Boolean(currentCoxswain.name && currentCoxswain.name === captain.name);
  updateCoxColour();
}

function getCoxswainFromForm() {
  if (!els.coxSelect.value) return { name: "", grade: "" };
  return memberByName(els.coxSelect.value);
}

function updateCoxColour() {
  const member = getCoxswainFromForm();
  els.coxSection.className = `cox-section ${gradeClass(member.grade)}`;
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

function memberOptions(placeholder, selectedName = "") {
  return `
    <option value="">${escapeHtml(placeholder)}</option>
    ${[...state.members]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((rosterMember) => {
        const colours = GRADE_COLOURS[rosterMember.grade] || { background: "#ffffff", text: "#172126" };
        return `<option value="${escapeHtml(rosterMember.name)}" ${rosterMember.name === selectedName ? "selected" : ""} style="background-color: ${colours.background}; color: ${colours.text};">${escapeHtml(rosterMember.name)}</option>`;
      })
      .join("")}
  `;
}

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
            <button type="button" data-action="damage">Sign In + Damage</button>
          </div>`
        : ""
    }
  `;

  const signIn = card.querySelector("[data-action='in']");
  const damage = card.querySelector("[data-action='damage']");
  if (signIn) signIn.addEventListener("click", () => signInCrew(outing.id, false));
  if (damage) damage.addEventListener("click", () => signInCrew(outing.id, true));
  return card;
}

async function signInCrew(id, hasDamage) {
  const outing = state.outings.find((item) => item.id === id);
  if (!outing) return;
  outing.inAt = new Date().toISOString();

  if (hasDamage) {
    const note = prompt("What needs fixing?", "Check boat before next outing") || "Needs checking";
    const boat = state.plant.find((item) => item.id === outing.boatId);
    outing.damageNote = note;
    outing.maintenanceIssue = true;
    outing.returnNotes = note;
    if (boat) {
      boat.status = "maintenance";
      boat.note = note;
      updateBoatStatusSheet(boat, "Repairs", note);
    }
    sendDamageAlert(outing, note);
  }

  save();
  saveSharedSignIn(outing, hasDamage);
  sendLogbookEvent(hasDamage ? "signed_in_damage" : "signed_in", outing);
  sendNotification("Boat signed in", `${plantName(outing.boatId)} returned at ${time(outing.inAt)}.`);
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
      </div>
    `;
    els.logbookList.append(card);
  });
}

function logbookPeople(outing) {
  const rowers = (outing.members || []).map((member) => member.name).join(", ");
  const cox = outing.coxswain?.name ? ` Cox: ${outing.coxswain.name}.` : "";
  const captain = outing.captain?.name ? ` Captain: ${outing.captain.name}.` : "";
  return `${rowers}.${cox}${captain}`;
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
    coxswain: outing.coxswain?.name || "",
    captain: outing.captain?.name || "",
    outAt: outing.outAt,
    dueAt: outing.dueAt,
    alertAt: alertAt(outing.dueAt).toISOString(),
    inAt: outing.inAt || "",
    notes: outing.notes || "",
    returnNotes: outing.returnNotes || "",
    maintenanceIssue: Boolean(outing.maintenanceIssue),
    recordedAt: new Date().toISOString()
  };
}

function exportLogbookCsv() {
  const rows = [
    ["Outing ID", "Boat", "Status", "Rowers", "Coxswain", "Captain", "Out", "Due", "Alert", "In", "Notes", "Return Notes"]
  ];
  state.outings.forEach((outing) => {
    rows.push([
      outing.id,
      plantName(outing.boatId),
      outing.inAt ? "Returned" : "On Water",
      (outing.members || []).map((member) => `${member.name} (${member.grade})`).join("; "),
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

function renderPlant() {
  const usedIds = activeOutings().map((outing) => outing.boatId);
  els.plantList.innerHTML = "";
  state.plant.filter((item) => item.type === "Boat").forEach((item) => {
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
  activeOutings().forEach((outing) => {
    if (!isLate(outing)) return;
    if (state.notified[outing.id]) return;
    state.notified[outing.id] = true;
    save();
    sendOverdueAlert(outing);
  });
  renderLists();
  renderPlant();
}

function sendOverdueAlert(outing) {
  const boat = plantName(outing.boatId);
  const recipients = alertRecipients(outing);
  const message = `${boat} was due back at ${time(outing.dueAt)}. The 30-minute grace period has passed. Alert: ${recipients.join(", ")}.`;
  sendPushAlert({
    key: `overdue-${outing.id}`,
    type: "overdue",
    title: "Boat overdue",
    message,
    recipients,
    outing: alertPayload(outing)
  });
  sendNotification("Boat overdue", message);
}

function sendDamageAlert(outing, note) {
  const boat = plantName(outing.boatId);
  const recipients = [...new Set([...ALERT_ROLES.coaches, ALERT_ROLES.safetyOfficer])];
  const message = `${boat} has been signed in with damage: ${note}. It has been marked for repair.`;
  sendPushAlert({
    key: `damage-${outing.id}`,
    type: "damage",
    title: "Boat damage reported",
    message,
    recipients,
    outing: alertPayload(outing),
    requireInteraction: true
  });
  sendNotification("Boat damage reported", message, {
    tag: `damage-${outing.id}`,
    requireInteraction: true
  });
}

function alertRecipients(outing) {
  const names = [
    outing.captain?.name,
    ...ALERT_ROLES.coaches,
    ALERT_ROLES.safetyOfficer
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
    maintenanceIssue: Boolean(outing.maintenanceIssue)
  };
}

function sendPushAlert(payload) {
  sendStressTestAlert(payload);

  if (!PUSH_ALERT_WEBHOOK_URL) {
    console.info("Push alert webhook not configured", payload);
    return;
  }

  fetch(PUSH_ALERT_WEBHOOK_URL, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload)
  }).catch((error) => console.warn("Push alert failed", error));
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
    const after = localStorage.getItem(`${STORAGE_KEY}-last-alert-at`) || "";
    const response = await fetch(`${API_BASE_URL}/api/alerts?after=${encodeURIComponent(after)}`, { cache: "no-store" });
    if (!response.ok) throw new Error("Shared alerts request failed");
    const payload = await response.json();
    const alerts = Array.isArray(payload.alerts) ? payload.alerts : [];
    if (sharedAlertsPrimed) {
      alerts.forEach((alert) => {
        sendNotification(alert.title || "Water Log alert", alert.message || "Open Water Log for details.", {
          tag: alert.key || alert.id || alert.type || "water-log-alert",
          requireInteraction: Boolean(alert.requireInteraction)
        });
      });
    }
    const latest = alerts.at(-1)?.createdAt;
    if (latest) localStorage.setItem(`${STORAGE_KEY}-last-alert-at`, latest);
    sharedAlertsPrimed = true;
  } catch (error) {
    console.warn("Shared alert polling failed", error);
  }
}

async function enableNotifications() {
  if (!("Notification" in window)) {
    alert("This browser does not support notifications.");
    return;
  }

  const permission = await Notification.requestPermission();
  if (permission === "granted") {
    const pushReady = await registerDeviceForPush();
    const body = pushReady
      ? "This device is registered for Water Log phone pop-up alerts."
      : "This device can show Water Log pop-up alerts while the app is open.";
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
    els.notificationNotice.querySelector("p").textContent = pushConfigurationReady()
      ? "Enabled on this device. This phone can receive Water Log pop-up alerts once registered."
      : "Enabled on this device for stress-test alerts while the app is open.";
    els.enableNotifications.textContent = pushConfigurationReady() ? "Registered" : "Enabled";
    els.enableNotifications.disabled = true;
    return;
  }

  if (Notification.permission === "denied") {
    els.notificationNotice.querySelector("p").textContent = "Notifications are blocked for this page. Change the browser site settings to allow them.";
    els.enableNotifications.textContent = "Blocked";
    els.enableNotifications.disabled = true;
    return;
  }

  els.notificationNotice.querySelector("p").textContent = "Tap Enable once on this device to allow Water Log pop-up alerts while the app is open.";
  els.enableNotifications.textContent = "Enable";
  els.enableNotifications.disabled = false;
}

async function registerDeviceForPush() {
  if (!pushConfigurationReady()) return false;
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return false;

  const registration = await navigator.serviceWorker.ready;
  const existing = await registration.pushManager.getSubscription();
  const subscription = existing || (await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(PUSH_PUBLIC_VAPID_KEY)
  }));

  sendPushSubscription(subscription);
  return true;
}

function pushConfigurationReady() {
  return Boolean(PUSH_PUBLIC_VAPID_KEY && PUSH_SUBSCRIPTION_WEBHOOK_URL && PUSH_ALERT_WEBHOOK_URL);
}

function sendPushSubscription(subscription) {
  fetch(PUSH_SUBSCRIPTION_WEBHOOK_URL, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({
      subscription,
      app: "Aramoho-Whanganui RC - Water Log",
      registeredAt: new Date().toISOString()
    })
  }).catch((error) => console.warn("Push subscription failed", error));
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
        icon: "/assets/awrc-logo.png",
        badge: "/assets/awrc-logo.png",
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
    icon: "/assets/awrc-logo.png",
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
  return state.plant.find((item) => item.id === id)?.colour || BOAT_COLOURS[id] || "";
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
  return state.members.find((member) => member.name === name) || { name: "", grade: "" };
}

function updateMemberRowColour(row) {
  const member = memberByName(row.querySelector("[data-field='member']").value);
  row.className = `member-row ${gradeClass(member.grade)}`;
}

function gradeClass(grade) {
  return grade ? `grade-${grade.toLowerCase()}` : "";
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
        .map((member) => `<span class="member-chip ${gradeClass(member.grade)}" title="${escapeHtml(member.grade)}">${escapeHtml(member.name)}</span>`)
        .join("")}
    </div>
  `;
}

function coxswainChip(coxswain) {
  return `
    <div class="member-chips">
      <span class="member-chip ${gradeClass(coxswain.grade)}" title="Coxswain - ${escapeHtml(coxswain.grade)}">Coxswain: ${escapeHtml(coxswain.name)}</span>
    </div>
  `;
}

function captainChip(captain) {
  return `
    <div class="member-chips">
      <span class="member-chip captain-chip ${gradeClass(captain.grade)}" title="Captain">Captain: ${escapeHtml(captain.name)}</span>
    </div>
  `;
}

function labelStatus(status) {
  if (status === "used") return "On Water";
  if (status === "derigged") return "Derigged";
  if (status === "maintenance") return "Repair";
  if (status === "rigged") return "Rigged";
  return "Available";
}

function time(value) {
  return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function dateTime(value) {
  if (!value) return "";
  return new Date(value).toLocaleString([], {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function csvCell(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function resetDemo() {
  localStorage.removeItem(STORAGE_KEY);
  state = freshDemoData();
  els.memberList.innerHTML = "";
  render();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
