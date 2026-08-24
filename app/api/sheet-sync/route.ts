type SheetRow = Array<string | number>;

type SheetSyncPayload = {
  attendingRows?: SheetRow[];
  detailRows?: SheetRow[];
  rows?: Array<Record<string, string>>;
  targetSheet?: string;
};

type ServiceAccount = {
  client_email: string;
  private_key: string;
  token_uri?: string;
};

type SheetSyncResult = {
  configured: boolean;
  message: string;
  rowCount: number;
  status: "queued" | "synced" | "not-synced";
  targetSheet: string;
};

const attendingSheetName = "Attending";
const detailSheetName = "Signup Log";
const sheetsScope = "https://www.googleapis.com/auth/spreadsheets";
const backendSheetId = "1K6APM8cVQMW3_oTneRyjDy7H8VRYOpyDPWMjpJKjpaw";

function base64Url(input: string | ArrayBuffer) {
  const bytes = typeof input === "string" ? new TextEncoder().encode(input) : new Uint8Array(input);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function privateKeyToArrayBuffer(privateKey: string) {
  const pem = privateKey
    .replace(/\\n/g, "\n")
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\s/g, "");
  const binary = atob(pem);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes.buffer;
}

async function createAccessToken(serviceAccountJson: string) {
  const serviceAccount = JSON.parse(serviceAccountJson) as ServiceAccount;
  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = base64Url(
    JSON.stringify({
      iss: serviceAccount.client_email,
      scope: sheetsScope,
      aud: serviceAccount.token_uri ?? "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now,
    }),
  );
  const unsignedToken = `${header}.${claim}`;
  const key = await crypto.subtle.importKey(
    "pkcs8",
    privateKeyToArrayBuffer(serviceAccount.private_key),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(unsignedToken));
  const jwt = `${unsignedToken}.${base64Url(signature)}`;
  const response = await fetch(serviceAccount.token_uri ?? "https://oauth2.googleapis.com/token", {
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
    headers: { "content-type": "application/x-www-form-urlencoded" },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(`Google auth failed: ${response.status}`);
  }

  const token = (await response.json()) as { access_token?: string };
  if (!token.access_token) throw new Error("Google auth did not return an access token");
  return token.access_token;
}

async function sheetsFetch(sheetId: string, accessToken: string, path: string, init: RequestInit = {}) {
  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}${path}`, {
    ...init,
    headers: {
      authorization: `Bearer ${accessToken}`,
      "content-type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Google Sheets request failed: ${response.status} ${message}`);
  }

  return response;
}

async function ensureSheets(sheetId: string, accessToken: string) {
  const response = await sheetsFetch(sheetId, accessToken, "?fields=sheets.properties.title");
  const spreadsheet = (await response.json()) as { sheets?: Array<{ properties?: { title?: string } }> };
  const existingTitles = new Set(spreadsheet.sheets?.map((sheet) => sheet.properties?.title).filter(Boolean));
  const missingTitles = [attendingSheetName, detailSheetName].filter((title) => !existingTitles.has(title));

  if (missingTitles.length === 0) return;

  await sheetsFetch(sheetId, accessToken, ":batchUpdate", {
    body: JSON.stringify({
      requests: missingTitles.map((title) => ({
        addSheet: {
          properties: { title },
        },
      })),
    }),
    method: "POST",
  });
}

async function getSheetIds(sheetId: string, accessToken: string) {
  const response = await sheetsFetch(sheetId, accessToken, "?fields=sheets.properties(sheetId,title)");
  const spreadsheet = (await response.json()) as {
    sheets?: Array<{ properties?: { sheetId?: number; title?: string } }>;
  };
  return new Map(
    spreadsheet.sheets
      ?.map((sheet) => sheet.properties)
      .filter((properties): properties is { sheetId: number; title: string } => (
        typeof properties?.sheetId === "number" && typeof properties.title === "string"
      ))
      .map((properties) => [properties.title, properties.sheetId]) ?? [],
  );
}

async function updateSheetValues(sheetId: string, accessToken: string, sheetName: string, rows: SheetRow[]) {
  const safeSheetName = sheetName.replace(/'/g, "''");
  const range = encodeURIComponent(`'${safeSheetName}'!A:ZZ`);
  await sheetsFetch(sheetId, accessToken, `/values/${range}:clear`, {
    body: JSON.stringify({}),
    method: "POST",
  });
  await sheetsFetch(sheetId, accessToken, `/values/${encodeURIComponent(`'${safeSheetName}'!A1`)}?valueInputOption=USER_ENTERED`, {
    body: JSON.stringify({ values: rows }),
    method: "PUT",
  });
}

async function formatSheet(sheetId: string, accessToken: string, googleSheetId: number, rows: SheetRow[]) {
  const rowCount = Math.max(rows.length, 1);
  const columnCount = Math.min(Math.max(rows[0]?.length ?? 1, 1), 30);

  await sheetsFetch(sheetId, accessToken, ":batchUpdate", {
    body: JSON.stringify({
      requests: [
        {
          repeatCell: {
            range: {
              sheetId: googleSheetId,
              startRowIndex: 0,
              endRowIndex: rowCount,
              startColumnIndex: 0,
              endColumnIndex: columnCount,
            },
            cell: {
              userEnteredFormat: {
                textFormat: { fontFamily: "Nunito" },
                verticalAlignment: "MIDDLE",
                wrapStrategy: "OVERFLOW_CELL",
              },
            },
            fields: "userEnteredFormat(textFormat.fontFamily,verticalAlignment,wrapStrategy)",
          },
        },
        {
          repeatCell: {
            range: {
              sheetId: googleSheetId,
              startRowIndex: 0,
              endRowIndex: 1,
              startColumnIndex: 0,
              endColumnIndex: columnCount,
            },
            cell: {
              userEnteredFormat: {
                backgroundColor: { red: 0.039, green: 0.298, blue: 0.337 },
                textFormat: {
                  bold: true,
                  foregroundColor: { red: 1, green: 1, blue: 1 },
                  fontFamily: "Nunito",
                },
              },
            },
            fields: "userEnteredFormat(backgroundColor,textFormat)",
          },
        },
        {
          autoResizeDimensions: {
            dimensions: {
              sheetId: googleSheetId,
              dimension: "COLUMNS",
              startIndex: 0,
              endIndex: columnCount,
            },
          },
        },
        {
          updateDimensionProperties: {
            range: {
              sheetId: googleSheetId,
              dimension: "ROWS",
              startIndex: 0,
              endIndex: rowCount,
            },
            properties: { pixelSize: 24 },
            fields: "pixelSize",
          },
        },
      ],
    }),
    method: "POST",
  });
}

function normalizeRows(payload: SheetSyncPayload) {
  const attendingRows = payload.attendingRows ?? [
    ["Session", "Athlete", "Group", "Status"],
    ...(payload.rows ?? []).map((row) => [row.session ?? "", row.athlete ?? "", row.group ?? "", row.status ?? ""]),
  ];
  const detailRows = payload.detailRows && payload.detailRows.length > 0 ? payload.detailRows : [["No signup log rows yet"]];

  return { attendingRows, detailRows };
}

function rowCount(rows: ReturnType<typeof normalizeRows>) {
  return rows.attendingRows.length + rows.detailRows.length;
}

async function syncViaAppsScript(webhookUrl: string, rows: ReturnType<typeof normalizeRows>): Promise<SheetSyncResult> {
  const response = await fetch(webhookUrl, {
    body: JSON.stringify({
      sheets: [
        { name: attendingSheetName, rows: rows.attendingRows },
        { name: detailSheetName, rows: rows.detailRows },
      ],
    }),
    headers: { "content-type": "text/plain;charset=utf-8" },
    method: "POST",
  });

  const message = await response.text();
  if (!response.ok) {
    throw new Error(`Google Apps Script sync failed: ${response.status} ${message}`);
  }

  return {
    configured: true,
    message: "AWRC Training Signup Backend updated.",
    rowCount: rowCount(rows),
    status: "synced",
    targetSheet: `${attendingSheetName} + ${detailSheetName}`,
  };
}

async function syncViaServiceAccount(sheetId: string, serviceAccount: string, rows: ReturnType<typeof normalizeRows>): Promise<SheetSyncResult> {
  const accessToken = await createAccessToken(serviceAccount);
  await ensureSheets(sheetId, accessToken);
  const sheetIds = await getSheetIds(sheetId, accessToken);
  await updateSheetValues(sheetId, accessToken, attendingSheetName, rows.attendingRows);
  await updateSheetValues(sheetId, accessToken, detailSheetName, rows.detailRows);

  const attendingSheetId = sheetIds.get(attendingSheetName);
  const detailSheetId = sheetIds.get(detailSheetName);
  if (typeof attendingSheetId === "number") {
    await formatSheet(sheetId, accessToken, attendingSheetId, rows.attendingRows);
  }
  if (typeof detailSheetId === "number") {
    await formatSheet(sheetId, accessToken, detailSheetId, rows.detailRows);
  }

  return {
    configured: true,
    message: "AWRC Training Signup Backend updated.",
    rowCount: rowCount(rows),
    status: "synced",
    targetSheet: `${attendingSheetName} + ${detailSheetName}`,
  };
}

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => ({}))) as SheetSyncPayload;
  const rows = normalizeRows(payload);
  const sheetId = process.env.GOOGLE_SHEET_ID || backendSheetId;
  const serviceAccount = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  const webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;

  if (!serviceAccount && !webhookUrl) {
    return Response.json(
      {
        status: "queued",
        configured: false,
        message:
          "Google Sheets write access is not connected yet. Add GOOGLE_SHEET_WEBHOOK_URL in Render so signups can write to AWRC Training Signup Backend.",
        targetSheet: payload.targetSheet ?? "AWRC Training Signup Backend",
        rowCount: rowCount(rows),
      },
      { status: 202 },
    );
  }

  try {
    const result = webhookUrl
      ? await syncViaAppsScript(webhookUrl, rows)
      : await syncViaServiceAccount(sheetId, serviceAccount as string, rows);

    return Response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Google Sheet sync failed";
    return Response.json(
      {
        status: "not-synced",
        configured: true,
        message,
        targetSheet: `${attendingSheetName} + ${detailSheetName}`,
        rowCount: rowCount(rows),
      },
      { status: 202 },
    );
  }
}
