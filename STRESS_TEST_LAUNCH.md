# Stress Test Launch

This build is for testing the full Water Log workflow with other users before the final production launch.

## What this stress-test build does

- multiple users see the same shared outings list
- sign-outs are saved on the server
- sign-ins are saved on the server
- overdue checks happen on the server
- connected users can receive Water Log pop-up notifications while the app is open
- the boat allocation sheet still live-syncs boat availability

## Important phone notification note

Phone notification permissions need a secure origin.

This means notifications work properly when the app is hosted on HTTPS, such as:

- Netlify
- Render
- Railway
- Firebase Hosting
- Vercel

They usually will not work properly from a plain local network address like `http://10.14.94.103:4173` on a phone.

## Current local test URL

On this laptop:

```text
http://localhost:4173
```

On another device on the same Wi-Fi, the likely local URL is:

```text
http://10.14.94.103:4173
```

That local Wi-Fi URL is useful for checking the form and shared water log, but it is not the right final test for phone pop-up notifications.

## Recommended stress-test hosting

Use a Node-capable HTTPS host, not a static-only host, because this stress-test build includes a small server.

Good simple options:

- Render Web Service
- Railway
- Fly.io

Start command:

```text
node server.js
```

The app will use the host's assigned HTTPS URL.

## Test flow

1. Open the HTTPS app URL on two phones.
2. Tap **Enable** for notifications on both phones.
3. On phone A, sign out a boat with a captain.
4. Confirm phone B sees the outing within a few seconds.
5. Set the expected return time close enough to test.
6. Leave the crew unsigned-in until 30 minutes after expected return.
7. Confirm both connected phones receive a Water Log overdue pop-up.
8. Sign the crew back in from either phone.
9. Confirm the other phone updates within a few seconds.

## Known stress-test limitation

This build is meant to test form and club workflow. It sends pop-up alerts to connected open app sessions.

For final production, background phone push notifications when the app is closed still need the production web-push sender connected.
