import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { loadEvents, loadSteering } from "@/lib/events";
import type { SteeringAction } from "@/lib/types";

// Instinct has no API. Steering works by recording the decision here and
// relaying it to the agent's chat (iMessage/WhatsApp). This route builds the
// exact message and logs it. See docs/DESIGN.md for the reasoning.

export async function POST(req: Request) {
  const body = (await req.json()) as { eventId: string; action: SteeringAction["action"]; optionId?: string; note?: string };
  const event = loadEvents().find((e) => e.id === body.eventId);
  if (!event) return NextResponse.json({ error: "unknown event" }, { status: 404 });

  const option = event.options?.find((o) => o.id === body.optionId);
  const relayMessage =
    body.action === "approve"
      ? `Re "${event.title}": go with ${option?.label ?? "your recommendation"}.${body.note ? ` ${body.note}` : ""}`
      : body.action === "deny"
        ? `Re "${event.title}": none of those. Do not book any of them.${body.note ? ` ${body.note}` : ""}`
        : `Re "${event.title}": ${body.note}`;

  const record: SteeringAction = {
    eventId: event.id,
    action: body.action,
    optionId: body.optionId,
    note: body.note,
    at: new Date().toISOString(),
    relayMessage,
    relayStatus: "pending",
  };

  // Local dev only. Vercel's filesystem is read-only, so there the log lives in memory for the request.
  try {
    const file = path.join(process.cwd(), "data", "steering-log.json");
    fs.writeFileSync(file, JSON.stringify([...loadSteering(), record], null, 2));
  } catch {
    // ignore on read-only hosts
  }

  return NextResponse.json(record);
}
