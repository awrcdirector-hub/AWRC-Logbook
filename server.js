const http = require("http");
const fs = require("fs");
const path = require("path");
const { randomUUID } = require("crypto");

const port = process.env.PORT || 4173;
const dataDir = path.join(__dirname, "data");
const stateFile = path.join(dataDir, "stress-test-state.json");
const overdueGraceMs = 30 * 60 * 1000;

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
  return { outings: [], alerts: [] };
}

function readState() {
  try {
    return { ...defaultState(), ...JSON.parse(fs.readFileSync(stateFile, "utf8")) };
  } catch {
    return defaultState();
  }
}

function writeState(state) {
  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));
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
  state.alerts.push({
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    ...alert
  });
  state.alerts = state.alerts.slice(-200);
}

function checkOverdueCrews() {
  const state = readState();
  const now = Date.now();
  let changed = false;

  state.outings.forEach((outing) => {
    if (outing.inAt || outing.overdueNotified) return;
    if (now <= new Date(outing.dueAt).getTime() + overdueGraceMs) return;

    outing.overdueNotified = true;
    addAlert(state, {
      key: `overdue-${outing.id}`,
      type: "overdue",
      title: "Boat overdue",
      message: `${outing.boatName || "A boat"} was due back at ${time(outing.dueAt)}. The 30-minute grace period has passed.`,
      recipients: alertRecipients(outing),
      outingId: outing.id,
      requireInteraction: true
    });
    changed = true;
  });

  if (changed) writeState(state);
}

function alertRecipients(outing) {
  return [...new Set([outing.captain?.name, "Axel Dickinson", "Allan Luff"].filter(Boolean))];
}

function time(value) {
  return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

async function handleApi(request, response, url) {
  const state = readState();

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
        outingId: outing.id
      });
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
    outing.maintenanceIssue = Boolean(body.maintenanceIssue);
    if (outing.maintenanceIssue) {
      addAlert(state, {
        key: `damage-${outing.id}`,
        type: "damage",
        title: "Boat damage reported",
        message: `${outing.boatName || "A boat"} has been signed in with damage: ${outing.damageNote || "Needs checking"}. It has been marked for repair.`,
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

http
  .createServer((request, response) => {
    const url = new URL(request.url, `http://localhost:${port}`);
    if (url.pathname.startsWith("/api/")) {
      handleApi(request, response, url).catch((error) => {
        console.error(error);
        sendJson(response, 500, { error: "Server error" });
      });
      return;
    }
    serveStatic(request, response, url);
  })
  .listen(port, () => {
    console.log(`Aramoho-Whanganui RC Water Log running at http://localhost:${port}`);
  });

setInterval(checkOverdueCrews, 15_000);
