# Official Launch Requirements

The app is ready to be hosted as a pilot, but official club use needs shared data and real push notifications connected before it should be relied on for safety.

## What is already in the app

- PWA manifest for phone home-screen install
- service worker
- phone/browser notification permission button
- web push subscription plumbing
- overdue alert payloads for captain, coaches, and safety officer
- boat allocation sheet sync
- local historical logbook

## What must be connected for official launch

### 1. HTTPS hosting

Use a public HTTPS host such as Netlify, Firebase Hosting, Vercel, or GitHub Pages.

Phone push notifications require HTTPS, except when testing on `localhost`.

### 2. Shared outing storage

The current app still stores outings in each browser's local storage.

Before relying on the app across multiple phones, outings need to be stored centrally so everyone sees the same water log.

Good options:

- Firebase Firestore
- Supabase
- Google Sheets plus Apps Script

### 3. Push notification service

True phone pop-up notifications need a server-side push sender.

The app now has three settings at the top of `app.js`:

```js
const PUSH_ALERT_WEBHOOK_URL = "";
const PUSH_SUBSCRIPTION_WEBHOOK_URL = "";
const PUSH_PUBLIC_VAPID_KEY = "";
const BOAT_STATUS_WEBHOOK_URL = "";
```

What each one does:

- `PUSH_PUBLIC_VAPID_KEY` lets phones subscribe to browser push
- `PUSH_SUBSCRIPTION_WEBHOOK_URL` receives and stores each phone subscription
- `PUSH_ALERT_WEBHOOK_URL` receives overdue crew alerts and sends them to the right phones
- `BOAT_STATUS_WEBHOOK_URL` updates the boat allocation sheet when a boat is signed in with damage

The alert recipients are:

- selected boat captain
- Axel Dickinson
- Allan Luff
- Axel Dickinson as acting safety officer

Duplicate names are removed before sending.

### 4. Phone setup

For best results, members should install the app to their phone home screen and tap **Enable** for notifications.

On iPhones, web push requires iOS 16.4 or newer and the app must be added to the home screen before notification permission works reliably.

## Launch recommendation

Do not launch to all members until shared outing storage and push sending are connected.

Launch order:

1. Host the app on HTTPS.
2. Connect shared outing storage.
3. Connect push subscription storage.
4. Connect overdue push sending.
5. Test with Axel, Allan, and two captains.
6. Run one supervised club session as the official pilot.
