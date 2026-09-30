// Pure functions shared by the server and the client. No filesystem here.
import type { AgentEvent, SteeringAction, TripBrief } from "./types";

export const BUDGET = 1500;

export function pendingDecisions(events: AgentEvent[], steering: SteeringAction[]): AgentEvent[] {
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

export function buildBrief(events: AgentEvent[], steering: SteeringAction[], now = new Date()): TripBrief {
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

  return {
    budget: BUDGET,
    committed,
    pending: latest?.total ?? 0,
    pendingSource: latest?.source,
    decisionsWaiting: decisions.length,
    urgentDecisions: decisions.filter((d) => d.deadline && new Date(d.deadline).getTime() < twoHours).length,
    errors: events.filter((e) => e.kind === "error").length,
    autoActions: events.filter((e) => e.kind === "auto_action").length,
    firstEventAt: events[0]?.timestamp,
    lastEventAt: events[events.length - 1]?.timestamp,
  };
}

// The exact text relayed to the agent's chat. Deterministic, so the client can
// show it before the server has recorded anything.
export function composeRelay(event: AgentEvent, action: SteeringAction["action"], optionId?: string, note?: string): string {
  const option = event.options?.find((o) => o.id === optionId);
  const tail = note ? ` ${note}` : "";
  if (action === "approve") return `Re "${event.title}": go with ${option?.label ?? "your recommendation"}.${tail}`;
  if (action === "deny") return `Re "${event.title}": none of those. Do not book any of them.${tail}`;
  return `Re "${event.title}": ${note ?? ""}`.trim();
}
