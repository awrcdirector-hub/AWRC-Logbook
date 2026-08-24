const stateKey = "training-signup-state";
const nodeStateFile = process.env.TRAINING_STATE_FILE ?? "/tmp/awrc-training-state.json";

type TrainingStatePayload = {
  athletes: unknown[];
  sessions: unknown[];
  signups: Record<string, unknown>;
  auditEvents: unknown[];
};

const fallbackState: TrainingStatePayload = {
  athletes: [],
  sessions: [],
  signups: {},
  auditEvents: [],
};

function routeError(error: unknown) {
  const message = error instanceof Error ? error.message : "Unexpected error";
  return Response.json(
    {
      state: fallbackState,
      configured: false,
      message:
        message.includes("D1 binding") || message.includes("no such table")
          ? "Server database is not ready yet. The app can still run locally, but shared state needs the deployed D1 database and migration."
          : message,
    },
    { status: 200 },
  );
}

function stripPasswordFields(state: TrainingStatePayload): TrainingStatePayload {
  return {
    ...state,
    athletes: Array.isArray(state.athletes)
      ? state.athletes.map((athlete) => {
          if (!athlete || typeof athlete !== "object") return athlete;
          const { passwordHash, passwordSalt, ...safeAthlete } = athlete as Record<string, unknown>;
          void passwordHash;
          void passwordSalt;
          return safeAthlete;
        })
      : [],
  };
}

function isNodeRuntime() {
  return typeof process !== "undefined" && Boolean(process.versions?.node);
}

async function loadNodeState() {
  const fs = await import("node:fs/promises");
  try {
    const raw = await fs.readFile(nodeStateFile, "utf8");
    return { state: stripPasswordFields(JSON.parse(raw) as TrainingStatePayload), configured: true };
  } catch {
    return { state: fallbackState, configured: false };
  }
}

async function saveNodeState(state: TrainingStatePayload) {
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  await fs.mkdir(path.dirname(nodeStateFile), { recursive: true });
  await fs.writeFile(nodeStateFile, JSON.stringify(stripPasswordFields(state), null, 2), "utf8");
}

async function loadCloudflareState() {
  const [{ getDb }, { appState }, { eq }] = await Promise.all([
    import("../../../db"),
    import("../../../db/schema"),
    import("drizzle-orm"),
  ]);
  const db = getDb();
  const rows = await db.select().from(appState).where(eq(appState.key, stateKey)).limit(1);
  return {
    state: rows[0]?.valueJson ? stripPasswordFields(JSON.parse(rows[0].valueJson) as TrainingStatePayload) : fallbackState,
    configured: Boolean(rows[0]),
  };
}

async function saveCloudflareState(state: TrainingStatePayload) {
  const [{ getDb }, { appState }] = await Promise.all([import("../../../db"), import("../../../db/schema")]);
  const payload = stripPasswordFields(state);
  const db = getDb();
  await db
    .insert(appState)
    .values({
      key: stateKey,
      valueJson: JSON.stringify(payload),
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: appState.key,
      set: {
        valueJson: JSON.stringify(payload),
        updatedAt: new Date(),
      },
    });
}

export async function GET() {
  try {
    const { state, configured } = isNodeRuntime() ? await loadNodeState() : await loadCloudflareState();
    return Response.json({
      state,
      configured,
      message: configured ? "Loaded shared training signup state." : "No saved training state yet.",
    });
  } catch (error) {
    return routeError(error);
  }
}

export async function POST(request: Request) {
  try {
    const payload = stripPasswordFields((await request.json()) as TrainingStatePayload);
    if (isNodeRuntime()) {
      await saveNodeState(payload);
    } else {
      await saveCloudflareState(payload);
    }

    return Response.json({ status: "saved", configured: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return Response.json({ status: "not-saved", configured: false, message }, { status: 202 });
  }
}
