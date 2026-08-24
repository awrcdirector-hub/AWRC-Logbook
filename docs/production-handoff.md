# AWRC Training Signup Production Handoff

This app is ready to place in GitHub for long-term development and connect to Render for stress testing.

## Current Status

- The app is installable as a web app/PWA.
- The live prototype is currently hosted on ChatGPT Sites.
- Athlete access is passwordless: the athlete page opens from search, remembers the last selected athlete on that device, and can be switched for a teammate.
- Coach tools stay behind the separate coach password.
- Google Sheet sync is implemented and points at the Training Signup backend sheet.
- Current persistence uses the Sites/Cloudflare D1 runtime. A full Render production move should replace this with a Render-friendly database, preferably Render Postgres or Supabase Postgres.

## GitHub Setup

Create a repository such as:

```text
awrc-training-signup
```

Then push this project to the repo. Do not commit `.env` files.

## Render Setup

Render can read `render.yaml` as a blueprint.

Required environment variables for live Google Sheet writes:

```text
GOOGLE_SHEET_WEBHOOK_URL
NOTIFICATION_PROVIDER
NOTIFICATION_API_KEY
```

Optional environment variable:

```text
GOOGLE_SHEET_ID
GOOGLE_SERVICE_ACCOUNT_JSON
```

If `GOOGLE_SHEET_ID` is not set, the app uses the Training Signup backend sheet:

```text
1K6APM8cVQMW3_oTneRyjDy7H8VRYOpyDPWMjpJKjpaw
```

The AWRC logo links to the AWRC Hub sheet:

```text
https://docs.google.com/spreadsheets/d/1mmKMRZyJSR3mr8VocTQ2Mimz6OavPIqyVza0tBUV_FU/edit?gid=344134665#gid=344134665
```

## Google Sheet Write Setup

Use the Apps Script file in `docs/google-apps-script-sheet-sync.gs`.

1. Open the AWRC Training Signup Backend Google Sheet.
2. Click `Extensions`.
3. Click `Apps Script`.
4. Delete any starter code.
5. Paste in the contents of `docs/google-apps-script-sheet-sync.gs`.
6. Click `Deploy`.
7. Click `New deployment`.
8. Choose `Web app`.
9. Set `Execute as` to `Me`.
10. Set access to allow the deployed web app URL to receive requests.
11. Copy the web app URL.
12. In Render, add that URL as `GOOGLE_SHEET_WEBHOOK_URL`.
13. Redeploy the Render app.

After this, `Sync now` in the coach area should update these tabs:

- `Attending`
- `Signup Log`

For proper long-term Render hosting, add a Postgres database and migrate the app state route away from Cloudflare D1.

## Stress Test Checklist

- Athletes can search their name on phone, keep that athlete page selected, and switch profiles when needed.
- Athletes can confirm attendance, mark can't attend, and mark injured/sick.
- Optional/catch-up slots appear as available athlete choices.
- Coach roster search opens individual profile editing.
- Attendance percentages reset without deleting signup responses.
- The `Attending` sheet is a live coach utility tab: it lists sessions from the current live window through the next 7 days, with the next session at the top. Sessions drop off after sync once they are more than 2 hours past their start time.
- The `Signup Log` sheet keeps detailed athlete/session history across all sessions.
- The coach `Open Google Sheet` button opens the Training Signup backend sheet.
