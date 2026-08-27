const http = require("http");
const fs = require("fs");
const path = require("path");
const { createHmac, pbkdf2Sync, randomBytes, randomUUID, timingSafeEqual } = require("crypto");
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
const defaultAlertAdmins = ["Axel Dickinson", "Allan Luff", "Tiffany Davies"];
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || "";
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || "";
const vapidSubject = process.env.VAPID_SUBJECT || "mailto:admin@awrc.local";
const hubNotifyUrl = process.env.HUB_NOTIFY_URL || "https://awrc-hub.onrender.com/api/notifications/send";
const hubNotifySecret = process.env.HUB_NOTIFY_SECRET || "";
const hubBaseUrl = (process.env.HUB_BASE_URL || "https://awrc-hub.onrender.com").replace(/\/$/, "");
const logbookPublicUrl = process.env.LOGBOOK_PUBLIC_URL || "https://awrc-logbook.onrender.com/";
const adminRecoveryEmail = "awrcdirector@gmail.com";
const adminCredentialFile = process.env.ADMIN_CREDENTIAL_FILE || path.join(dataDir, "logbook-admin-credentials.json");
const adminCredentialKey = "logbook-admin";

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

function requiredEnv(name) {
  const value = (process.env[name] || "").trim();
  if (!value) throw new Error(`${name} is not configured.`);
  return value;
}

function hashPassword(password, salt = randomBytes(16).toString("hex")) {
  return {
    hash: pbkdf2Sync(password, salt, 210000, 32, "sha256").toString("hex"),
    salt
  };
}

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(String(left || ""));
  const rightBuffer = Buffer.from(String(right || ""));
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function readAdminCredentials() {
  try {
    const parsed = JSON.parse(fs.readFileSync(adminCredentialFile, "utf8"));
    if (parsed.passwordHash && parsed.passwordSalt) return parsed;
  } catch {}
  return {
    passwordHash: requiredEnv("ADMIN_PASSWORD_HASH"),
    passwordSalt: requiredEnv("ADMIN_PASSWORD_SALT")
  };
}

function verifyAdminPassword(password) {
  const credential = readAdminCredentials();
  const { hash } = hashPassword(password, credential.passwordSalt);
  return safeEqual(hash, credential.passwordHash);
}

function issueAdminToken() {
  const expires = Date.now() + 1000 * 60 * 60 * 12;
  const payload = `${expires}`;
  const signature = createHmac("sha256", requiredEnv("ADMIN_SESSION_SECRET")).update(payload).digest("hex");
  return `${payload}.${signature}`;
}

function adminAuthorised(request) {
  const header = request.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice("Bearer ".length) : "";
  const [expires, signature] = token.split(".");
  const expiresAt = Number(expires);
  if (!expires || !signature || !Number.isFinite(expiresAt) || expiresAt < Date.now()) return false;
  const expected = createHmac("sha256", requiredEnv("ADMIN_SESSION_SECRET")).update(expires).digest("hex");
  return safeEqual(signature, expected);
}

function requireAdmin(request, response) {
  if (adminAuthorised(request)) return true;
  sendJson(response, 401, { error: "Admin login required" });
  return false;
}

function resetAdminPassword(resetToken, nextPassword) {
  if (!safeEqual(resetToken, requiredEnv("ADMIN_RESET_TOKEN"))) return false;
  if (!String(nextPassword || "").trim() || String(nextPassword).trim().length < 4) {
    throw new Error("Password must be at least 4 characters.");
  }
  const { hash, salt } = hashPassword(String(nextPassword).trim());
  fs.mkdirSync(path.dirname(adminCredentialFile), { recursive: true });
  fs.writeFileSync(adminCredentialFile, JSON.stringify({ key: adminCredentialKey, passwordHash: hash, passwordSalt: salt }, null, 2));
  return true;
}

async function hubAdminToken() {
  const password = (process.env.HUB_ADMIN_PASSWORD || "").trim();
  if (!password) throw new Error("HUB_ADMIN_PASSWORD is not configured.");
  const response = await fetch(`${hubBaseUrl}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password })
  });
  if (!response.ok) throw new Error("Hub admin login failed.");
  const payload = await response.json();
  if (!payload.token) throw new Error("Hub admin token was not returned.");
  return payload.token;
}

function defaultState() {
  return { outings: [], alerts: [], subscriptions: [], config: { members: [], plant: [], boatOverrides: {}, removedMembers: [], alertAdmins: defaultAlertAdmins } };
}

let serverState = defaultState();
let remoteSaveQueue = Promise.resolve();
const stateStoreStatus = {
  configured: Boolean(stateStoreUrl),
  pending: false,
  lastLoadAt: "",
  lastLoadOk: null,
  lastSaveAt: "",
  lastSaveOk: null,
  lastError: ""
};

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
      removedMembers: Array.isArray(state.config?.removedMembers) ? state.config.removedMembers : [],
      alertAdmins: normaliseNameList(state.config?.alertAdmins?.length ? state.config.alertAdmins : defaultAlertAdmins)
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
  queueRemoteStateSave(serverState);
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
    const payload = await parseStateStoreResponse(response);
    stateStoreStatus.lastLoadAt = new Date().toISOString();
    stateStoreStatus.lastLoadOk = true;
    stateStoreStatus.lastError = "";
    return normalizeState(payload.state || payload);
  } catch (error) {
    stateStoreStatus.lastLoadAt = new Date().toISOString();
    stateStoreStatus.lastLoadOk = false;
    stateStoreStatus.lastError = error.message;
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
    await parseStateStoreResponse(response);
    stateStoreStatus.lastSaveAt = new Date().toISOString();
    stateStoreStatus.lastSaveOk = true;
    stateStoreStatus.lastError = "";
  } catch (error) {
    stateStoreStatus.lastSaveAt = new Date().toISOString();
    stateStoreStatus.lastSaveOk = false;
    stateStoreStatus.lastError = error.message;
    console.warn("Persistent state save failed; local file still updated", error.message);
  }
}

function queueRemoteStateSave(state) {
  if (!stateStoreUrl) {
    stateStoreStatus.configured = false;
    return;
  }

  const snapshot = normalizeState(JSON.parse(JSON.stringify(state)));
  stateStoreStatus.configured = true;
  stateStoreStatus.pending = true;
  remoteSaveQueue = remoteSaveQueue
    .catch(() => {})
    .then(() => saveRemoteState(snapshot))
    .finally(() => {
      stateStoreStatus.pending = false;
    });
}

async function parseStateStoreResponse(response) {
  const text = await response.text();
  if (!response.ok) throw new Error(`State store returned ${response.status}`);

  let payload = {};
  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`State store did not return JSON: ${text.slice(0, 80)}`);
  }

  if (payload.error) throw new Error(`State store error: ${payload.error}`);
  return payload;
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
  sendHubPushAlert(storedAlert);
}

function sendHubPushAlert(alert) {
  const recipients = (alert.recipients || []).filter(Boolean);
  if (!hubNotifyUrl || !recipients.length || typeof fetch !== "function") return;

  const headers = { "Content-Type": "application/json" };
  if (hubNotifySecret) headers["X-Hub-Notify-Secret"] = hubNotifySecret;

  fetch(hubNotifyUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({
      app: "logbook",
      recipients,
      title: alert.title || "Outing Logbook alert",
      body: alert.message || "Open Outing Logbook for details.",
      url: logbookPublicUrl,
      tag: alert.key || alert.id || alert.type || "awrc-logbook",
      requireInteraction: Boolean(alert.requireInteraction)
    })
  }).catch((error) => {
    console.warn("Hub notification forward failed", error.message);
  });
}

function sendWebPushAlert(state, alert) {
  void state;
  void alert;
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
    removedMembers,
    alertAdmins: normaliseNameList(incomingConfig.alertAdmins?.length ? incomingConfig.alertAdmins : currentConfig.alertAdmins?.length ? currentConfig.alertAdmins : defaultAlertAdmins)
  };
}

function normaliseNameList(names = []) {
  const byName = new Map();
  names
    .map((name) => String(name || "").trim())
    .filter(Boolean)
    .forEach((name) => byName.set(name.toLowerCase(), name));
  return [...byName.values()].sort((a, b) => a.localeCompare(b));
}

function notificationAdmins(config = readState().config) {
  return normaliseNameList(config?.alertAdmins?.length ? config.alertAdmins : defaultAlertAdmins);
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
  return [...new Set([outing.captain?.name, ...notificationAdmins()].filter(Boolean))];
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

  if (request.method === "POST" && url.pathname === "/api/admin/login") {
    const body = await readBody(request);
    if (!verifyAdminPassword(body.password || "")) {
      sendJson(response, 401, { error: "Incorrect admin password." });
      return;
    }
    sendJson(response, 200, { token: issueAdminToken() });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/admin/reset-password") {
    const body = await readBody(request);
    if (String(body.email || "").trim().toLowerCase() !== adminRecoveryEmail) {
      sendJson(response, 403, { error: `Password recovery is only available for ${adminRecoveryEmail}.` });
      return;
    }
    try {
      if (!resetAdminPassword(body.resetToken || "", body.nextPassword || "")) {
        sendJson(response, 401, { error: "Reset token is incorrect." });
        return;
      }
      sendJson(response, 200, { ok: true });
    } catch (error) {
      sendJson(response, 400, { error: error.message || "Password could not be reset." });
    }
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/config") {
    sendJson(response, 200, state.config || defaultState().config);
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/state-store/status") {
    sendJson(response, 200, stateStoreStatus);
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/config") {
    if (!requireAdmin(request, response)) return;
    state.config = mergeConfig(state.config || defaultState().config, await readBody(request));
    writeState(state);
    sendJson(response, 200, { ok: true, config: state.config });
    return;
  }

  if ((request.method === "POST" || request.method === "DELETE") && url.pathname === "/api/hub-members") {
    if (!requireAdmin(request, response)) return;
    try {
      const hubResponse = await fetch(`${hubBaseUrl}/api/members`, {
        method: request.method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${await hubAdminToken()}` },
        body: JSON.stringify(await readBody(request))
      });
      sendJson(response, hubResponse.status, await hubResponse.json());
    } catch (error) {
      sendJson(response, 500, { error: error.message || "Hub member sync failed." });
    }
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/push/public-key") {
    sendJson(response, 200, { publicKey: "", configured: false, hubOnly: true });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/push/status") {
    const subscriptions = state.subscriptions || [];
    const userName = url.searchParams.get("userName") || "";
    sendJson(response, 200, {
      configured: false,
      hubOnly: true,
      subscriptionCount: subscriptions.length,
      users: [...new Set(subscriptions.map((item) => item.userName).filter(Boolean))].sort(),
      userRegistered: userName ? subscriptions.some((item) => item.userName === userName && item.subscription?.endpoint) : null
    });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/push/subscribe") {
    sendJson(response, 409, { error: "Phone notifications are managed through AWRC Hub.", hubOnly: true });
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
    console.log(`AWRC Outing Logbook running at http://localhost:${port}`);
    if (stateStoreUrl) console.log("Persistent state store enabled");
  });
}

startServer();
setInterval(checkOverdueCrews, 15_000);
