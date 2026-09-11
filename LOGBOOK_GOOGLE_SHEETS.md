# Google Sheets Logbook Feed

The app keeps a local historical logbook automatically.

To feed the logbook into Google Sheets, create a Google Apps Script web app that accepts POST requests and appends or updates rows by `outingId`.

In `app.js`, set:

```js
const LOGBOOK_WEBHOOK_URL = "YOUR_APPS_SCRIPT_WEB_APP_URL";
const BOAT_STATUS_WEBHOOK_URL = "YOUR_BOAT_STATUS_APPS_SCRIPT_WEB_APP_URL";
const PUSH_ALERT_WEBHOOK_URL = "YOUR_PUSH_ALERT_WEB_APP_URL";
const PUSH_SUBSCRIPTION_WEBHOOK_URL = "YOUR_PUSH_SUBSCRIPTION_WEB_APP_URL";
const PUSH_PUBLIC_VAPID_KEY = "YOUR_PUBLIC_VAPID_KEY";
```

The app sends a payload when:

- a boat is signed out
- a boat is signed in
- a boat is signed in with damage

Each payload includes:

- outing ID
- boat
- rowers and grades
- coxswain
- captain
- out time
- expected return time
- alert time
- in time
- notes
- return notes
- damage flag

## Boat Allocation Sheet Repair Updates

When a boat is signed in with damage, the app can also send a write-back request to Google Sheets.

Set this in `app.js`:

```js
const BOAT_STATUS_WEBHOOK_URL = "YOUR_BOAT_STATUS_APPS_SCRIPT_WEB_APP_URL";
```

The webhook receives:

- boat ID
- boat name
- status, such as `Repairs`
- damage note
- update time

The Apps Script should find the matching boat row in the allocation sheet and set the Status column to `Repairs`.

The current public CSV link is read-only, so the app cannot directly edit the allocation sheet without this write-capable Apps Script web app.

## Late crew pop-up alerts

The prototype marks a crew as late only once the expected return time plus 30 minutes has passed.

When that happens, it sends one overdue alert for that outing. The alert recipients are:

- the selected boat captain
- Axel Dickinson
- Allan Luff
- Axel Dickinson as acting safety officer

Names are deduplicated, so Axel only receives one alert even though he is both coach and safety officer.

Browser notifications shown by the prototype only appear on the device where the app is open and notifications have been enabled. For true phone pop-up notifications to all recipients, the live version needs a push alert service behind `PUSH_ALERT_WEBHOOK_URL` that knows each person's phone/browser subscription.
