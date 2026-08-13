const http = require("http");
const fs = require("fs");
const path = require("path");
const { randomUUID } = require("crypto");
let webPush = null;
try {
  webPush = require("web-push");
} catch {
  webPush = null;
}

const port = process.env.PORT || 4173;
const dataDir = path.join(__dirname, "data");
const stateFile = path.join(dataDir, "stress-test-state.json");
const stateStoreUrl = process.env.STATE_STORE_URL || "";
const stateStoreToken = process.env.STATE_STORE_TOKEN || "";
const overdueGraceMs = 30 * 60 * 1000;
const overdueRepeatMs = 10 * 60 * 1000;
const alwaysNotify = ["Axel Dickinson", "Tiffany Davies"];
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || "";
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || "";
const vapidSubject = process.env.VAPID_SUBJECT || "mailto:admin@awrc.local";

if (webPush && vapidPublicKey && vapidPrivateKey) {
  webPush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
}

const types = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon"
};

function defaultState() {
  return { outings: [], alerts: [], subscriptions: [], config: { members: [], plant: [], boatOverrides: {}, removedMembers: [] } };
}

let serverState = defaultState();

function normalizeState(state = {}) {
  const base = defaultState();
  return {
    ...base,
    ...state,
    outings: Array.isArray(state.outings) ? state.outings : [],
    alerts: Array.isArray(state.alerts) ? state.alerts : [],
    subscriptions: Array.isArray(state.subscriptions) ? state.subscriptions : [],
    config: {
      ...base.config,
      ...(state.config || {}),
      members: Array.isArray(state.config?.members) ? state.config.members : [],
      plant: Array.isArray(state.config?.plant) ? state.config.plant : [],
      boatOverrides: state.config?.boatOverrides && typeof state.config.boatOverrides === "object" ? state.config.boatOverrides : {},
      removedMembers: Array.isArray(state.config?.removedMembers) ? state.config.removedMembers : []
    }
  };
}

function readLocalState() {
  try {
    return normalizeState(JSON.parse(fs.readFileSync(stateFile, "utf8")));
  } catch {
    return defaultState();
  }
}

function writeLocalState(state) {
  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));
}

function readState() {
  return serverState;
}

function writeState(state) {
  serverState = normalizeState(state);
  writeLocalState(serverState);
  saveRemoteState(serverState);
}

function stateStoreRequestUrl() {
  if (!stateStoreUrl || !stateStoreToken) return stateStoreUrl;
  const separator = stateStoreUrl.includes("?") ? "&" : "?";
  return `${stateStoreUrl}${separator}token=${encodeURIComponent(stateStoreToken)}`;
}

async function loadRemoteState() {
  if (!stateStoreUrl) return null;
  try {
    const response = await fetch(stateStoreRequestUrl(), { cache: "no-store" });
    if (!response.ok) throw new Error(`State store returned ${response.status}`);
    const payload = await response.json();
    return normalizeState(payload.state || payload);
  } catch (error) {
    console.warn("Persistent state load failed; using local fallback", error.message);
    return null;
  }
}

async function saveRemoteState(state) {
  if (!stateStoreUrl) return;
  try {
    const response = await fetch(stateStoreRequestUrl(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state })
    });
    if (!response.ok) throw new Error(`State store returned ${response.status}`);
  } catch (error) {
    console.warn("Persistent state save failed; local file still updated", error.message);
  }
}

function mergeState(localState, remoteState) {
  const merged = normalizeState(localState);
  const remote = normalizeState(remoteState);
  merged.outings = mergeByKey(merged.outings, remote.outings, (outing) => outing.id, newestOuting);
  merged.alerts = mergeByKey(merged.alerts, remote.alerts, (alert) => alert.key || alert.id, newestAlert).slice(-200);
  merged.subscriptions = mergeByKey(merged.subscriptions, remote.subscriptions, subscriptionKey, newestAlert);
  merged.config = mergeConfig(merged.config, remote.config);
  return merged;
}

function mergeByKey(localItems = [], remoteItems = [], getKey, pickWinner = (_a, b) => b) {
  const byKey = new Map();
  [...localItems, ...remoteItems].forEach((item) => {
    const key = getKey(item);
    if (!key) return;
    byKey.set(key, byKey.has(key) ? pickWinner(byKey.get(key), item) : item);
  });
  return [...byKey.values()];
}

function newestOuting(a, b) {
  if (b.inAt && !a.inAt) return b;
  if (a.inAt && !b.inAt) return a;
  return newestAlert(a, b);
}

function newestAlert(a, b) {
  const aTime = new Date(a.updatedAt || a.createdAt || a.inAt || a.outAt || 0).getTime();
  const bTime = new Date(b.updatedAt || b.createdAt || b.inAt || b.outAt || 0).getTime();
  return bTime >= aTime ? { ...a, ...b } : { ...b, ...a };
}

function subscriptionKey(subscription) {
  return subscription?.subscription?.endpoint || `${subscription?.userName || ""}-${subscription?.id || ""}`;
}

function sendJson(response, status, payload) {
  response.writeHead(status, {
    "Content-Type": "application/json",
    "Cache-Control": "no-store"
  });
  response.end(JSON.stringify(payload));
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) request.destroy();
    });
    request.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
  });
}

function addAlert(state, alert) {
  if (alert.key && state.alerts.some((item) => item.key === alert.key)) return;
  const storedAlert = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    ...alert
  };
  state.alerts.push(storedAlert);
  state.alerts = state.alerts.slice(-200);
  sendWebPushAlert(state, storedAlert);
}

function sendWebPushAlert(state, alert) {
  if (!webPush || !vapidPublicKey || !vapidPrivateKey) return;
  const recipients = new Set((alert.recipients || []).filter(Boolean));
  if (!recipients.size) return;

  const expiredEndpoints = new Set();
  const latestByRecipient = new Map();
  (state.subscriptions || [])
    .filter((item) => recipients.has(item.userName) && item.subscription?.endpoint)
    .forEach((item) => {
      const existing = latestByRecipient.get(item.userName);
      const existingTime = existing ? new Date(existing.updatedAt || existing.createdAt || 0).getTime() : 0;
      const itemTime = new Date(item.updatedAt || item.createdAt || 0).getTime();
      if (!existing || itemTime >= existingTime) latestByRecipient.set(item.userName, item);
    });

  const deliveries = [...latestByRecipient.values()]
    .map((item) =>
      webPush
        .sendNotification(item.subscription, JSON.stringify(alert))
        .catch((error) => {
          if (error.statusCode === 404 || error.statusCode === 410) {
            expiredEndpoints.add(item.subscription?.endpoint);
          }
          console.warn("Web push failed", item.userName, error.statusCode || error.message);
        })
    );

  if (deliveries.length) {
    Promise.allSettled(deliveries).then(() => {
      if (!expiredEndpoints.size) return;
      state.subscriptions = (state.subscriptions || []).filter((item) => !expiredEndpoints.has(item.subscription?.endpoint));
      writeState(state);
    });
  }
}

function overdueMinutes(now, dueAt) {
  const dueTime = new Date(dueAt).getTime();
  const minutes = Math.floor((now - dueTime) / 60000);
  return Math.max(30, Math.floor(minutes / 10) * 10);
}

function mergeConfig(currentConfig = {}, incomingConfig = {}) {
  const removedMembers = [...new Set([...(currentConfig.removedMembers || []), ...(incomingConfig.removedMembers || [])])];
  const removedMemberSet = new Set(removedMembers);
  const membersByName = new Map();
  [...(currentConfig.members || []), ...(incomingConfig.members || [])].forEach((member) => {
    if (!member?.name || removedMemberSet.has(member.name)) return;
    membersByName.set(member.name, member);
  });

  const boatOverrides = { ...(currentConfig.boatOverrides || {}), ...(incomingConfig.boatOverrides || {}) };
  const plantById = new Map();
  [...(currentConfig.plant || []), ...(incomingConfig.plant || [])].forEach((boat) => {
    if (!boat?.id || boatOverrides[boat.id]?.removed) return;
    plantById.set(boat.id, { ...plantById.get(boat.id), ...boat, ...(boatOverrides[boat.id] || {}) });
  });

  return {
    members: [...membersByName.values()],
    plant: [...plantById.values()],
    boatOverrides,
    removedMembers
  };
}

function checkOverdueCrews() {
  const state = readState();
  const now = Date.now();
  let changed = false;

  state.outings.forEach((outing) => {
    if (outing.inAt) return;
    if (now <= new Date(outing.dueAt).getTime() + overdueGraceMs) return;
    const lastSent = new Date(outing.overdueAlertLastSentAt || 0).getTime();
    if (lastSent && now - lastSent < overdueRepeatMs) return;

    const alertCount = Number(outing.overdueAlertCount || 0) + 1;
    const minutesLate = overdueMinutes(now, outing.dueAt);
    outing.overdueNotified = true;
    outing.overdueAlertCount = alertCount;
    outing.overdueAlertLastSentAt = new Date(now).toISOString();
    addAlert(state, {
      key: `overdue-${outing.id}-${alertCount}`,
      type: "overdue",
      title: "Boat overdue",
      message: `${outing.boatName || "A boat"} is over ${minutesLate} minutes late getting off the water.`,
      recipients: alertRecipients(outing),
      outingId: outing.id,
      minutesLate,
      repeat: alertCount,
      requireInteraction: true
    });
    changed = true;
  });

  if (changed) writeState(state);
}

function alertRecipients(outing) {
  return [...new Set([outing.captain?.name, "Allan Luff", ...alwaysNotify].filter(Boolean))];
}

function captainRecipients(outing) {
  return [...new Set([outing.captain?.name].filter(Boolean))];
}

function time(value) {
  return new Date(value).toLocaleTimeString("en-NZ", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Pacific/Auckland"
  });
}

async function handleApi(request, response, url) {
  const state = readState();

  if (request.method === "GET" && url.pathname === "/api/config") {
    sendJson(response, 200, state.config || defaultState().config);
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/config") {
    state.config = mergeConfig(state.config || defaultState().config, await readBody(request));
    writeState(state);
    sendJson(response, 200, { ok: true, config: state.config });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/push/public-key") {
    sendJson(response, 200, { publicKey: vapidPublicKey, configured: Boolean(vapidPublicKey && vapidPrivateKey) });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/push/subscribe") {
    const body = await readBody(request);
    if (!body.userName || !body.subscription) {
      sendJson(response, 400, { error: "Missing userName or subscription" });
      return;
    }
    const endpoint = body.subscription?.endpoint;
    state.subscriptions = (state.subscriptions || []).filter(
      (item) => item.subscription?.endpoint !== endpoint && item.userName !== body.userName
    );
    state.subscriptions.push({
      id: randomUUID(),
      userName: body.userName,
      subscription: body.subscription,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    writeState(state);
    sendJson(response, 200, { ok: true });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/outings") {
    checkOverdueCrews();
    sendJson(response, 200, { outings: readState().outings });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/outings") {
    const outing = await readBody(request);
    const existing = state.outings.find((item) => item.id === outing.id);
    if (!existing) {
      state.outings.unshift(outing);
      addAlert(state, {
        key: `signed-out-${outing.id}`,
        type: "signed_out",
        title: "Boat signed out",
        message: `${outing.boatName || "A boat"} is due back at ${time(outing.dueAt)}.`,
        recipients: captainRecipients(outing),
        outingId: outing.id
      });
    } else {
      Object.assign(existing, { ...existing, ...outing });
    }
    writeState(state);
    sendJson(response, 200, { ok: true, outings: state.outings });
    return;
  }

  const signInMatch = url.pathname.match(/^\/api\/outings\/([^/]+)\/sign-in$/);
  if (request.method === "POST" && signInMatch) {
    const body = await readBody(request);
    const outing = state.outings.find((item) => item.id === signInMatch[1]);
    if (!outing) {
      sendJson(response, 404, { error: "Outing not found" });
      return;
    }

    outing.inAt = body.inAt || new Date().toISOString();
    outing.returnNotes = body.returnNotes || "";
    outing.damageNote = body.damageNote || "";
    outing.maintenanceNote = body.maintenanceNote || "";
    outing.issueType = body.issueType || (body.maintenanceIssue ? "damage" : "normal");
    outing.damageIssue = Boolean(body.damageIssue || outing.issueType === "damage");
    outing.maintenanceIssue = Boolean(body.maintenanceIssue);
    if (outing.issueType === "damage") {
      addAlert(state, {
        key: `damage-${outing.id}`,
        type: "damage",
        title: "Boat damage reported",
        message: `${outing.boatName || "A boat"} has been signed in with damage: ${outing.damageNote || "Needs checking"}. It is unavailable until checked.`,
        recipients: alertRecipients(outing),
        outingId: outing.id,
        requireInteraction: true
      });
    } else if (outing.issueType === "maintenance") {
      addAlert(state, {
        key: `maintenance-${outing.id}`,
        type: "maintenance",
        title: "Boat maintenance note",
        message: `${outing.boatName || "A boat"} has a maintenance note: ${outing.maintenanceNote || outing.returnNotes || "Maintenance suggested"}. The boat has not been marked unavailable.`,
        recipients: alertRecipients(outing),
        outingId: outing.id,
        requireInteraction: true
      });
    } else {
      addAlert(state, {
        key: `signed-in-${outing.id}`,
        type: "signed_in",
        title: "Boat signed in",
        message: `${outing.boatName || "A boat"} returned at ${time(outing.inAt)}.`,
        recipients: captainRecipients(outing),
        outingId: outing.id
      });
    }
    writeState(state);
    sendJson(response, 200, { ok: true, outing });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/alerts") {
    checkOverdueCrews();
    const after = url.searchParams.get("after");
    const alerts = readState().alerts.filter((alert) => !after || new Date(alert.createdAt) > new Date(after));
    sendJson(response, 200, { alerts });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/alerts") {
    addAlert(state, await readBody(request));
    writeState(state);
    sendJson(response, 200, { ok: true });
    return;
  }

  sendJson(response, 404, { error: "Not found" });
}

function serveStatic(request, response, url) {
  const requestedPath = url.pathname === "/" ? "index.html" : decodeURIComponent(url.pathname.slice(1));
  const filePath = path.normalize(path.join(__dirname, requestedPath));

  if (!filePath.startsWith(__dirname)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }

    response.writeHead(200, {
      "Content-Type": types[path.extname(filePath)] || "text/plain"
    });
    response.end(data);
  });
}

const server = http.createServer((request, response) => {
    const url = new URL(request.url, `http://localhost:${port}`);
    if (url.pathname.startsWith("/api/")) {
      handleApi(request, response, url).catch((error) => {
        console.error(error);
        sendJson(response, 500, { error: "Server error" });
      });
      return;
    }
    serveStatic(request, response, url);
  });

async function startServer() {
  serverState = readLocalState();
  const remoteState = await loadRemoteState();
  if (remoteState) {
    serverState = mergeState(serverState, remoteState);
    writeLocalState(serverState);
  }

  server.listen(port, () => {
    console.log(`Aramoho-Whanganui RC Outing Logbook running at http://localhost:${port}`);
    if (stateStoreUrl) console.log("Persistent state store enabled");
  });
}

startServer();
setInterval(checkOverdueCrews, 15_000);
