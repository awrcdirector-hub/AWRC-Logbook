const STATE_SHEET = "State";
const OUTINGS_SHEET = "Outings";
const TOKEN = "2852";
const STATE_START_ROW = 2;
const STATE_CHUNK_SIZE = 45000;

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
  const lastRow = Math.max(sheet.getLastRow(), STATE_START_ROW);
  const chunkCount = Math.max(1, lastRow - STATE_START_ROW + 1);
  const raw = sheet
    .getRange(STATE_START_ROW, 1, chunkCount, 1)
    .getValues()
    .map((row) => row[0] || "")
    .join("");
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
  const raw = JSON.stringify(state);
  const chunks = [];
  for (let index = 0; index < raw.length; index += STATE_CHUNK_SIZE) {
    chunks.push([raw.slice(index, index + STATE_CHUNK_SIZE)]);
  }

  sheet.getRange("A1").setValue("app_state_json");
  if (sheet.getLastRow() >= STATE_START_ROW) {
    sheet.getRange(STATE_START_ROW, 1, sheet.getLastRow() - STATE_START_ROW + 1, 1).clearContent();
  }
  if (chunks.length) {
    sheet.getRange(STATE_START_ROW, 1, chunks.length, 1).setValues(chunks);
  }
  sheet.getRange("B1").setValue("updated");
  sheet.getRange("B2").setValue(new Date());
  sheet.getRange("C1").setValue("state_chunks");
  sheet.getRange("C2").setValue(chunks.length);
  formatStateSheet(sheet, Math.max(chunks.length + 1, 2));
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
  formatOutingsSheet(sheet, headings.length, rows.length + 1);
}

function formatOutingsSheet(sheet, columnCount, rowCount) {
  const usedRows = Math.max(rowCount, 1);
  const range = sheet.getRange(1, 1, usedRows, columnCount);

  range
    .setFontFamily("Nunito")
    .setVerticalAlignment("middle")
    .setWrap(true);

  sheet.getRange(1, 1, 1, columnCount).setFontWeight("bold");
  sheet.autoResizeColumns(1, columnCount);
  sheet.autoResizeRows(1, usedRows);

  for (let column = 1; column <= columnCount; column += 1) {
    const currentWidth = sheet.getColumnWidth(column);
    sheet.setColumnWidth(column, Math.max(110, Math.ceil(currentWidth * 1.1)));
  }

  for (let row = 1; row <= usedRows; row += 1) {
    const currentHeight = sheet.getRowHeight(row);
    sheet.setRowHeight(row, Math.max(26, Math.ceil(currentHeight * 1.1)));
  }
}

function formatStateSheet(sheet, rowCount) {
  const usedRows = Math.max(rowCount, 2);
  const range = sheet.getRange(1, 1, usedRows, 3);

  range
    .setFontFamily("Nunito")
    .setVerticalAlignment("middle")
    .setWrap(true);

  sheet.getRange(1, 1, 1, 3).setFontWeight("bold");
  sheet.autoResizeColumns(1, 3);
  sheet.autoResizeRows(1, usedRows);

  for (let column = 1; column <= 3; column += 1) {
    const currentWidth = sheet.getColumnWidth(column);
    sheet.setColumnWidth(column, Math.max(130, Math.ceil(currentWidth * 1.1)));
  }

  for (let row = 1; row <= usedRows; row += 1) {
    const currentHeight = sheet.getRowHeight(row);
    sheet.setRowHeight(row, Math.max(30, Math.ceil(currentHeight * 1.1)));
  }
}

function formatSheetsNow() {
  const state = readState();
  const stateSheet = getSheet(STATE_SHEET);
  const stateRows = Math.max(stateSheet.getLastRow(), STATE_START_ROW);

  formatStateSheet(stateSheet, stateRows);
  writeOutingsLog(state);
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

function forceSignInByAthleteName() {
  const athleteName = "Nicky Maxim";
  const state = readState();
  const now = new Date().toISOString();
  let changed = false;

  (state.outings || []).forEach((outing) => {
    if (outing.inAt) return;
    const people = [
      ...(outing.members || []),
      outing.captain || {},
      outing.coxswain || {}
    ];
    if (!people.some((person) => person && person.name === athleteName)) return;

    outing.inAt = now;
    outing.issueType = outing.issueType || "normal";
    outing.returnNotes = outing.returnNotes || "Admin force signed in after sync issue.";
    changed = true;
  });

  if (!changed) {
    throw new Error(`No active outing found for ${athleteName}`);
  }

  writeState(state);
  writeOutingsLog(state);
}
