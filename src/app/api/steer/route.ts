import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { composeRelay, loadEvents, loadSteering } from "@/lib/events";
import type { SteeringAction } from "@/lib/types";

// Instinct has no API. Steering works by recording the decision here and
// relaying it to the agent's chat (iMessage/WhatsApp). This route records the
// decision and returns the message. See docs/DESIGN.md for the reasoning.

export async function POST(req: Request) {
  const body = (await req.json()) as { eventId: string; action: SteeringAction["action"]; optionId?: string; note?: string; at?: string };
  const event = loadEvents().find((e) => e.id === body.eventId);
  if (!event) return NextResponse.json({ error: "unknown event" }, { status: 404 });

  const record: SteeringAction = {
    eventId: event.id,
    action: body.action,
    optionId: body.optionId,
    note: body.note,
    at: body.at ?? new Date().toISOString(),
    relayMessage: composeRelay(event, body.action, body.optionId, body.note),
    relayStatus: "sent",
  };

  // Local dev only. Vercel's filesystem is read-only; there the client keeps the record.
  let persisted = false;
  try {
    const file = path.join(process.cwd(), "data", "steering-log.json");
    fs.writeFileSync(file, JSON.stringify([...loadSteering(), record], null, 2));
    persisted = true;
  } catch {
    // read-only host
  }

  return NextResponse.json({ ...record, persisted });
}
