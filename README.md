# AWRC Training Signup

Training Signup is the athlete session-signup app for the Aramoho-Whanganui Rowing Club Hub.

## What It Does

- Athletes search their name, open their athlete page, and confirm attendance or absence.
- The selected athlete is remembered on the device, with a simple switch-athlete flow for shared devices.
- Coaches use a separate coach password for attendance, roster, schedules, profile edits, and history.
- Optional/catch-up sessions can be offered by coaches and added by athletes.
- Signup summaries are prepared for Google Sheets so names can be copied cleanly into boat allocation.

## Local Commands

```bash
pnpm install
pnpm run dev
pnpm test
```

## Production Notes

The current live prototype runs on ChatGPT Sites with Cloudflare D1-style persistence. `render.yaml` is included for the GitHub + Render handoff, but a long-term Render deployment should use a Render-friendly database such as Render Postgres or Supabase Postgres.

Required production secrets are documented in `docs/production-handoff.md`.
