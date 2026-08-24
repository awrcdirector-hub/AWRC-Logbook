type ReminderPayload = {
  jobs?: Array<{
    kind?: "athlete-reminder" | "coach-health-alert";
    athleteName: string;
    sessionTitle: string;
    cutoffAt: string;
    reason?: string;
  }>;
};

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => ({}))) as ReminderPayload;
  const provider = process.env.NOTIFICATION_PROVIDER;
  const apiKey = process.env.NOTIFICATION_API_KEY;

  if (!provider || !apiKey) {
    return Response.json(
      {
        status: "queued",
        configured: false,
        message:
          "Notification provider credentials are not configured yet. Set NOTIFICATION_PROVIDER and NOTIFICATION_API_KEY as server-side secrets to send reminders.",
        jobCount: payload.jobs?.length ?? 0,
        athleteReminderCount: payload.jobs?.filter((job) => job.kind !== "coach-health-alert").length ?? 0,
        coachHealthAlertCount: payload.jobs?.filter((job) => job.kind === "coach-health-alert").length ?? 0,
      },
      { status: 202 },
    );
  }

  return Response.json({
    status: "ready",
    configured: true,
    provider,
    message: "Notification credentials are present. The production sender can dispatch these reminder jobs.",
    jobCount: payload.jobs?.length ?? 0,
    athleteReminderCount: payload.jobs?.filter((job) => job.kind !== "coach-health-alert").length ?? 0,
    coachHealthAlertCount: payload.jobs?.filter((job) => job.kind === "coach-health-alert").length ?? 0,
  });
}
