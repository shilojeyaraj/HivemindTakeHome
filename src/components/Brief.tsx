import type { TripBrief } from "@/lib/types";
import { clock, money } from "@/lib/format";

// One editorial headline, one sentence, one row of figures. The boldest thing
// on the page is the money line, because that is what the user asked about.
export function Brief({ brief }: { brief: TripBrief }) {
  const projected = brief.pending > 0 ? brief.pending : brief.committed;
  const over = projected - brief.budget;
  const projectedLabel =
    brief.pendingSource === "approved" ? "approved, not booked" : brief.pendingSource === "recommended" ? "if you approve the agent's picks" : "trip total";

  return (
    <section className="pt-2">
      <h1 className="serif text-[44px] leading-none tracking-tight sm:text-[56px]">Good morning.</h1>
      <p className="mt-3 max-w-xl text-[15px] text-ink-2">
        {brief.firstEventAt
          ? <>Your agent sent its first message at {clock(brief.firstEventAt)} and its last at {clock(brief.lastEventAt)}. {brief.committed === 0 ? "It bought nothing." : `It spent ${money(brief.committed)}.`}</>
          : "No agent activity recorded yet."}
      </p>

      <p className="num mt-6 text-[34px] font-medium leading-none tracking-tight sm:text-[40px]">
        {money(projected)} <span className="text-muted">of {money(brief.budget)}</span>
      </p>
      <p className={`mt-1.5 text-sm ${over > 0 ? "font-medium text-maroon" : "text-ink-2"}`}>
        {over > 0 ? `${money(over)} over budget, ` : `${money(-over)} under budget, `}{projectedLabel}.
      </p>

      <dl className="mt-6 grid grid-cols-3 divide-x divide-line border-y border-line">
        <Stat value={String(brief.decisionsWaiting)} label={brief.decisionsWaiting === 1 ? "decision needs you" : "decisions need you"} sub={brief.urgentDecisions ? `${brief.urgentDecisions} expiring soon` : brief.decisionsWaiting ? "no hard deadline" : "nothing waiting"} hot={brief.decisionsWaiting > 0} />
        <Stat value={String(brief.errors)} label={brief.errors === 1 ? "problem" : "problems"} sub={brief.errors ? "read before deciding" : "none reported"} />
        <Stat value={String(brief.autoActions)} label="decided alone" sub="all reversible" />
      </dl>
    </section>
  );
}

function Stat({ value, label, sub, hot }: { value: string; label: string; sub: string; hot?: boolean }) {
  return (
    <div className="px-3 py-3 first:pl-0 last:pr-0">
      <dd className={`num text-2xl font-medium leading-none ${hot ? "text-orange" : ""}`}>{value}</dd>
      <dt className="mt-1 text-sm text-ink">{label}</dt>
      <dd className="text-xs text-muted">{sub}</dd>
    </div>
  );
}
