import type { TripBrief } from "@/lib/types";
import { clock, money } from "@/lib/format";

export function Brief({ brief }: { brief: TripBrief }) {
  const projected = brief.pending > 0 ? brief.pending : brief.committed;
  const overBudget = projected > brief.budget;
  const projectedLabel = brief.pendingSource === "approved" ? "Approved, not booked" : brief.pendingSource === "recommended" ? "If you approve" : "Trip total";
  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <h1 className="text-xl font-semibold">Good morning</h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        {brief.firstEventAt
          ? `First message ${clock(brief.firstEventAt)}, last ${clock(brief.lastEventAt)}. ${brief.committed === 0 ? "Bought nothing." : `Spent ${money(brief.committed)}.`}`
          : "No agent activity recorded yet."}
      </p>
      <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Spent so far" value={money(brief.committed)} sub={`of ${money(brief.budget)} budget`} />
        <Stat label={projectedLabel} value={money(projected)} sub={overBudget ? `${money(projected - brief.budget)} over` : `${money(brief.budget - projected)} under`} warn={overBudget} />
        <Stat label="Needs you" value={String(brief.decisionsWaiting)} sub={brief.urgentDecisions ? `${brief.urgentDecisions} expiring soon` : "nothing expiring"} warn={brief.urgentDecisions > 0} />
        <Stat label="Problems" value={String(brief.errors)} sub={brief.errors ? "read before deciding" : "none reported"} warn={brief.errors > 0} />
      </dl>
    </section>
  );
}

function Stat({ label, value, sub, warn }: { label: string; value: string; sub: string; warn?: boolean }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-zinc-500">{label}</dt>
      <dd className={`text-2xl font-semibold ${warn ? "text-amber-600 dark:text-amber-400" : ""}`}>{value}</dd>
      <dd className="text-xs text-zinc-500">{sub}</dd>
    </div>
  );
}
