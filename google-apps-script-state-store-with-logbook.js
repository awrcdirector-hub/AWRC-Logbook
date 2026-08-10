const STATE_SHEET = "State";
const OUTINGS_SHEET = "Outings";
const TOKEN = "2852";

function doGet(e) {
  if (!isAllowed(e)) return json({ error: "Unauthorized" });
  return json(readState());
}

function doPost(e) {
  if (!isAllowed(e)) return json({ error: "Unauthorized" });

  const payload = JSON.parse(e.postData.contents || "{}");
  const state = payload.state || payload;
  writeState(state);
  writeOutingsLog(state);
  return json({ ok: true, state });
}

function readState() {
  const sheet = getSheet(STATE_SHEET);
  const raw = sheet.getRange("A2").getValue();
  if (!raw) {
    return {
      outings: [],
      alerts: [],
      subscriptions: [],
      config: {
        members: [],
        plant: [],
        boatOverrides: {},
        removedMembers: []
      }
    };
  }
  return JSON.parse(raw);
}

function writeState(state) {
  const sheet = getSheet(STATE_SHEET);
  sheet.getRange("A1").setValue("app_state_json");
  sheet.getRange("A2").setValue(JSON.stringify(state));
  sheet.getRange("B1").setValue("updated");
  sheet.getRange("B2").setValue(new Date());
}

function writeOutingsLog(state) {
  const sheet = getSheet(OUTINGS_SHEET);
  const headings = [
    "Outing ID",
    "Status",
    "Boat",
    "Boat ID",
    "Captain",
    "Crew",
    "Coxswain",
    "Signed out",
    "Expected back",
    "Signed in",
    "Minutes on water",
    "Late alert sent",
    "Issue type",
    "Damage note",
    "Maintenance note",
    "Return notes",
    "Sign out notes"
  ];

  const rows = (state.outings || []).map((outing) => {
    const outAt = toDate(outing.outAt);
    const dueAt = toDate(outing.dueAt);
    const inAt = toDate(outing.inAt);
    const minutesOnWater = outAt && inAt ? Math.round((inAt - outAt) / 60000) : "";

    return [
      outing.id || "",
      outingStatus(outing),
      outing.boatName || "",
      outing.boatId || "",
      outing.captain && outing.captain.name ? outing.captain.name : "",
      names(outing.members),
      outing.coxswain && outing.coxswain.name ? outing.coxswain.name : "",
      outAt || "",
      dueAt || "",
      inAt || "",
      minutesOnWater,
      outing.overdueNotified ? "Yes" : "No",
      outing.issueType || "normal",
      outing.damageNote || "",
      outing.maintenanceNote || "",
      outing.returnNotes || "",
      outing.notes || ""
    ];
  });

  sheet.clearContents();
  sheet.getRange(1, 1, 1, headings.length).setValues([headings]);
  if (rows.length) {
    sheet.getRange(2, 1, rows.length, headings.length).setValues(rows);
  }
  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, headings.length);
}

function names(people) {
  return (people || [])
    .map((person) => person && person.name ? person.name : "")
    .filter(Boolean)
    .join(", ");
}

function outingStatus(outing) {
  if (!outing.inAt) return "On water";
  if (outing.issueType === "damage") return "Signed in - damage";
  if (outing.issueType === "maintenance") return "Signed in - maintenance";
  return "Signed in";
}

function toDate(value) {
  return value ? new Date(value) : "";
}

function getSheet(name) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  return spreadsheet.getSheetByName(name) || spreadsheet.insertSheet(name);
}

function isAllowed(e) {
  return e && e.parameter && e.parameter.token === TOKEN;
}

function json(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
