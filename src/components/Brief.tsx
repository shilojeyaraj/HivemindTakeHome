import type { TripBrief } from "@/lib/types";
import { clock, money } from "@/lib/format";

export function Brief({ brief }: { brief: TripBrief }) {
  const projected = brief.pending > 0 ? brief.pending : brief.committed;
  const overBudget = projected > brief.budget;
  const projectedLabel =
    brief.pendingSource === "approved" ? "Approved, not booked" : brief.pendingSource === "recommended" ? "If you approve" : "Trip total";
  return (
    <section className="rounded-2xl border border-line bg-surface p-5 shadow-[0_1px_0_rgba(0,0,0,0.03)]">
      <h1 className="text-2xl font-semibold tracking-tight">Good morning</h1>
      <p className="mt-1 text-sm text-ink-2">
        {brief.firstEventAt
          ? `First message ${clock(brief.firstEventAt)}, last ${clock(brief.lastEventAt)}. ${brief.committed === 0 ? "Bought nothing." : `Spent ${money(brief.committed)}.`}`
          : "No agent activity recorded yet."}
      </p>
      <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-4">
        <Stat label="Spent so far" value={money(brief.committed)} sub={`of ${money(brief.budget)} budget`} />
        <Stat label={projectedLabel} value={money(projected)} sub={overBudget ? `${money(projected - brief.budget)} over` : `${money(brief.budget - projected)} under`} tone={overBudget ? "bad" : "ok"} />
        <Stat label="Needs you" value={String(brief.decisionsWaiting)} sub={brief.urgentDecisions ? `${brief.urgentDecisions} expiring soon` : brief.decisionsWaiting ? "no hard deadline" : "nothing waiting"} tone={brief.decisionsWaiting ? "accent" : undefined} />
        <Stat label="Problems" value={String(brief.errors)} sub={brief.errors ? "read before deciding" : "none reported"} tone={brief.errors ? "bad" : undefined} />
      </dl>
    </section>
  );
}

function Stat({ label, value, sub, tone }: { label: string; value: string; sub: string; tone?: "ok" | "bad" | "accent" }) {
  const color = tone === "bad" ? "text-bad" : tone === "accent" ? "text-accent" : tone === "ok" ? "text-ink" : "text-ink";
  return (
    <div>
      <dt className="text-[11px] font-medium uppercase tracking-wider text-muted">{label}</dt>
      <dd className={`num mt-0.5 text-[28px] font-semibold leading-none tracking-tight ${color}`}>{value}</dd>
      <dd className="mt-1 text-xs text-muted">{sub}</dd>
    </div>
  );
}
