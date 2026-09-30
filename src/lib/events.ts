import fs from "node:fs";
import path from "node:path";
import type { AgentEvent, SteeringAction, TripBrief } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
export const BUDGET = 1500;

export function loadEvents(): AgentEvent[] {
  const file = path.join(DATA_DIR, "events.json");
  if (!fs.existsSync(file)) return [];
  const events = JSON.parse(fs.readFileSync(file, "utf8")) as AgentEvent[];
  return events.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}

export function loadSteering(): SteeringAction[] {
  const file = path.join(DATA_DIR, "steering-log.json");
  if (!fs.existsSync(file)) return [];
  try {
    return JSON.parse(fs.readFileSync(file, "utf8")) as SteeringAction[];
  } catch {
    return [];
  }
}

export function pendingDecisions(
  events: AgentEvent[],
  steering: SteeringAction[],
): AgentEvent[] {
  const resolved = new Set(steering.map((s) => s.eventId));
  return events
    .filter((e) => e.kind === "decision" && !resolved.has(e.id))
    .sort((a, b) => {
      // Deadlines first, soonest first. Then newest.
      if (a.deadline && !b.deadline) return -1;
      if (!a.deadline && b.deadline) return 1;
      if (a.deadline && b.deadline) return a.deadline.localeCompare(b.deadline);
      return b.timestamp.localeCompare(a.timestamp);
    });
}

export function buildBrief(
  events: AgentEvent[],
  steering: SteeringAction[],
  now = new Date(),
): TripBrief {
  const decisions = pendingDecisions(events, steering);
  const twoHours = now.getTime() + 2 * 60 * 60 * 1000;
  const committed = events.reduce((sum, e) => sum + (e.spendDelta ?? 0), 0);
  // Projected spend if the user approves every recommended option.
  const pending = decisions.reduce((sum, e) => {
    const rec = e.options?.find((o) => o.recommended);
    if (!rec) return sum;
    return sum + (rec.total ?? rec.costDelta ?? 0);
  }, 0);
  return {
    budget: BUDGET,
    committed,
    pending,
    decisionsWaiting: decisions.length,
    urgentDecisions: decisions.filter(
      (d) => d.deadline && new Date(d.deadline).getTime() < twoHours,
    ).length,
    errors: events.filter((e) => e.kind === "error").length,
    autoActions: events.filter((e) => e.kind === "auto_action").length,
    firstEventAt: events[0]?.timestamp,
    lastEventAt: events[events.length - 1]?.timestamp,
  };
}
