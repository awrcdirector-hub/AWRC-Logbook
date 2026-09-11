# Pilot Launch Notes

## Recommended pilot scope

Start with a controlled pilot using one club device at the shed, or a very small group of captains and coaches.

The current app is ready to test the workflow:

- choose a boat
- auto-fill seats
- choose rowers and coxswain
- mark the captain
- sign a boat out
- sign it back in
- show boats on water
- show the plant list
- sync boat status from the boat allocation sheet
- keep a local historical logbook

## Important safety limitation

The current prototype stores outings in the browser on the device being used.

That means if one person signs a crew out on their phone, another person on a different phone will not automatically see that outing yet.

For a real multi-phone pilot, connect shared storage before relying on it for safety decisions. Good options are:

- Google Sheets plus Google Apps Script
- Firebase
- Supabase

## Boat allocation sync

The boat allocation sheet is already used as the live source for boat fleet status.

The app checks it:

- when the app opens
- every 60 seconds while open
- when the app tab becomes active again

Sheet status handling:

- `Scull`, `Sweep`, `Rigged`, or `Available` means the boat is available for sign-out
- `Derigged` means the boat is shown as derigged and blocked from sign-out
- `Repairs`, `Repair`, or `Needs repair` means the boat is shown as repair and blocked from sign-out

## Before a club-wide launch

Set up these items:

- live web hosting with HTTPS
- shared outing storage so all devices see the same water log
- Google Sheets historical logbook feed
- true phone push notifications for captains, coaches, and safety officer
- a short test with coaches/captains before opening it to all members

## Pilot test script

1. Sign out a single.
2. Check it appears in On Water.
3. Check the boat is blocked from being signed out again.
4. Sign it back in.
5. Sign out a coxed four.
6. Confirm four rower seats and one coxswain slot appear.
7. Mark a captain.
8. Change one boat in the allocation sheet to `Derigged`.
9. Wait up to 60 seconds and confirm it becomes unavailable in the app.
10. Change it back to `Scull` or `Sweep`.
11. Wait up to 60 seconds and confirm it becomes available again.
