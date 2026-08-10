# Persistent State Store

Use this when deploying the Outing Logbook to Render so live outings, logbook history, admin changes, and phone notification subscriptions survive Render restarts or redeploys.

## 1. Create A Google Sheet

Create a Google Sheet called `AWRC Outing Logbook State`.

In the sheet, create a tab named:

```text
State
```

Cell `A1` can say `state`.

## 2. Add Apps Script

Open `Extensions > Apps Script` and paste this script:

```javascript
const STATE_SHEET = "State";
const TOKEN = "CHANGE_THIS_TO_A_PRIVATE_RANDOM_PASSWORD";

function doGet(e) {
  if (!isAllowed(e)) return json({ error: "Unauthorized" }, 403);
  return json(readState());
}

function doPost(e) {
  if (!isAllowed(e)) return json({ error: "Unauthorized" }, 403);

  const payload = JSON.parse(e.postData.contents || "{}");
  const state = payload.state || payload;
  writeState(state);
  return json({ ok: true, state });
}

function readState() {
  const sheet = getStateSheet();
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
  const sheet = getStateSheet();
  sheet.getRange("A1").setValue("state");
  sheet.getRange("A2").setValue(JSON.stringify(state));
  sheet.getRange("B1").setValue("updated");
  sheet.getRange("B2").setValue(new Date());
}

function getStateSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  return spreadsheet.getSheetByName(STATE_SHEET) || spreadsheet.insertSheet(STATE_SHEET);
}

function isAllowed(e) {
  return e && e.parameter && e.parameter.token === TOKEN;
}

function json(payload, statusCode) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
```

Change this line to your own private password:

```javascript
const TOKEN = "CHANGE_THIS_TO_A_PRIVATE_RANDOM_PASSWORD";
```

## 3. Deploy The Apps Script

In Apps Script:

1. Click `Deploy`.
2. Click `New deployment`.
3. Choose `Web app`.
4. Set `Execute as` to `Me`.
5. Set `Who has access` to `Anyone`.
6. Deploy.
7. Copy the Web App URL.

## 4. Add Render Environment Variables

In Render, open the Outing Logbook service and add:

```text
STATE_STORE_URL = your Apps Script Web App URL
STATE_STORE_TOKEN = the TOKEN value from the script
```

Keep your Web Push variables there too:

```text
VAPID_PUBLIC_KEY
VAPID_PRIVATE_KEY
VAPID_SUBJECT
```

Then redeploy the Render service.

## Why This Matters

Without this, Render may lose the JSON file that stores:

- active outings
- logbook history
- admin-added athletes and boats
- removed athletes and boats
- notification subscriptions

With this state store, the server restores that data on startup and writes every change back to Google Sheets.
