import type { AgentEvent } from "@/lib/types";
import { clock, money } from "@/lib/format";
import { Links, RawEvidence, Tag, Warnings } from "./Evidence";

// Full-size entries for the sections that pull things out of the log.
export function Timeline({ events, all }: { events: AgentEvent[]; all?: AgentEvent[] }) {
  if (events.length === 0) return <p className="text-sm text-muted">Nothing here yet.</p>;
  const byId = new Map((all ?? events).map((e) => [e.id, e]));
  return (
    <ol className="divide-y divide-line rounded-md border border-line bg-surface">
      {events.map((e) => {
        const corrected = e.corrects ? byId.get(e.corrects) : undefined;
        return (
          <li key={e.id} id={e.id} className="px-5 py-4 text-sm">
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
              <Tag event={e} />
              <span className="num">{clock(e.timestamp)}</span>
              {corrected && (
                <a href={`#log-${corrected.id}`} className="underline decoration-line underline-offset-2 hover:decoration-ink">corrects its {clock(corrected.timestamp)} message</a>
              )}
            </div>
            <div className="mt-2 font-medium">{e.title}</div>
            <p className="mt-0.5 text-ink-2">{e.summary}</p>
            {e.spendDelta ? <p className="mt-1 text-xs">Charged or held: {money(e.spendDelta)}</p> : null}
            {e.autoResolved && (
              <p className="mt-2 rounded-md bg-orange-soft px-3 py-2 text-xs text-ink">
                Chose: {e.autoResolved.choice}. {e.autoResolved.reversible ? `Reversible${e.autoResolved.undoBy ? ` until ${clock(e.autoResolved.undoBy)}` : ", nothing was booked"}.` : "Not reversible."}
              </p>
            )}
            <Warnings warnings={e.warnings} />
            <Links links={e.links} />
            <RawEvidence event={e} label="Reasoning and raw message" />
          </li>
        );
      })}
    </ol>
  );
}
