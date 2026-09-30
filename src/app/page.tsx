import { Brief } from "@/components/Brief";
import { DecisionCard } from "@/components/DecisionCard";
import { Timeline } from "@/components/Timeline";
import { BUDGET, buildBrief, loadEvents, loadSteering, pendingDecisions } from "@/lib/events";

export const dynamic = "force-dynamic";

export default function Home() {
  const events = loadEvents();
  const steering = loadSteering();
  const brief = buildBrief(events, steering);
  const decisions = pendingDecisions(events, steering);
  const problems = events.filter(
    (e) => e.kind === "error" || (e.kind === "auto_action" && e.autoResolved && !e.autoResolved.reversible),
  );
  const autos = events.filter((e) => e.kind === "auto_action" && e.autoResolved?.reversible);

  return (
    <main className="mx-auto w-full max-w-3xl space-y-8 px-4 py-8">
      <Brief brief={brief} />

      <section>
        <h2 className="mb-3 text-lg font-semibold">Needs you ({decisions.length})</h2>
        {decisions.length === 0 ? (
          <p className="text-sm text-zinc-500">Nothing waiting on you.</p>
        ) : (
          <div className="space-y-4">{decisions.map((d) => <DecisionCard key={d.id} event={d} budget={BUDGET} />)}</div>
        )}
      </section>

      {problems.length > 0 && (
        <section>
          <h2 className="mb-1 text-lg font-semibold">Problems it hit ({problems.length})</h2>
          <p className="mb-3 text-sm text-zinc-500">Things that went wrong or that the agent could not verify. Worth reading before you choose.</p>
          <Timeline events={problems} all={events} />
        </section>
      )}

      {autos.length > 0 && (
        <section>
          <h2 className="mb-1 text-lg font-semibold">Decided on its own ({autos.length})</h2>
          <p className="mb-3 text-sm text-zinc-500">Reversible choices the agent made without asking. Redirect any of them from the decision above.</p>
          <Timeline events={autos} all={events} />
        </section>
      )}

      <section>
        <h2 className="mb-1 text-lg font-semibold">Everything, in order ({events.length})</h2>
        <p className="mb-3 text-sm text-zinc-500">The full log. Expand any entry for the agent&apos;s exact words.</p>
        <Timeline events={events} all={events} />
      </section>
    </main>
  );
}
