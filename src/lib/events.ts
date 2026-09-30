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
      // Hard deadlines first, soonest first. Then "hurry" without a time. Then newest.
      if (a.deadline && !b.deadline) return -1;
      if (!a.deadline && b.deadline) return 1;
      if (a.deadline && b.deadline) return a.deadline.localeCompare(b.deadline);
      if (a.urgencyNote && !b.urgencyNote) return -1;
      if (!a.urgencyNote && b.urgencyNote) return 1;
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
  // Projected trip total. Option totals are absolute, so take the most recent
  // one we know about: an option the user approved, or the agent's current
  // recommendation on an open decision, whichever is later.
  const byId = new Map(events.map((e) => [e.id, e]));
  type Candidate = { at: string; total: number; source: "approved" | "recommended" };
  const candidates: Candidate[] = [];
  for (const s of steering) {
    if (s.action !== "approve") continue;
    const opt = byId.get(s.eventId)?.options?.find((o) => o.id === s.optionId);
    if (opt?.total !== undefined) candidates.push({ at: s.at, total: opt.total, source: "approved" });
  }
  for (const d of decisions) {
    const rec = d.options?.find((o) => o.recommended);
    if (rec?.total !== undefined) candidates.push({ at: d.timestamp, total: rec.total, source: "recommended" });
  }
  candidates.sort((a, b) => b.at.localeCompare(a.at));
  const latest = candidates[0];
  const pending = latest?.total ?? 0;
  return {
    budget: BUDGET,
    committed,
    pending,
    pendingSource: latest?.source,
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
