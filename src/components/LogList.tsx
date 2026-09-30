import type { AgentEvent } from "@/lib/types";
import { clock } from "@/lib/format";
import { Links, Tag, Warnings } from "./Evidence";

const DOT: Record<AgentEvent["kind"], string> = {
  update: "bg-line",
  decision: "bg-ink",
  auto_action: "bg-orange",
  error: "bg-maroon",
};

// The whole night as a timeline rail: real timestamps down the left, one line
// per message, expand for the agent's exact words. Nothing is repeated at
// full size here; the sections above already did that.
export function LogList({ events }: { events: AgentEvent[] }) {
  return (
    <ol className="relative ml-[4.25rem] border-l border-line sm:ml-20">
      {events.map((e) => (
        <li key={e.id} id={`log-${e.id}`} className="relative scroll-mt-20 pb-5 pl-5 last:pb-0">
          <span className={`absolute -left-[5px] top-[7px] h-[9px] w-[9px] rounded-full ring-4 ring-bg ${DOT[e.kind]}`} />
          <span className="num absolute -left-[4.25rem] top-0 w-14 text-right font-mono text-[11px] text-muted sm:-left-20 sm:w-16">{clock(e.timestamp)}</span>
          <details className="group">
            <summary className="cursor-pointer py-0.5 text-sm leading-6">
              <span className="mr-2 inline-block align-middle"><Tag event={e} /></span>
              <span className="font-medium group-hover:underline group-hover:decoration-line group-hover:underline-offset-2">{e.title}</span>
            </summary>
            <div className="mt-2 text-sm">
              <p className="text-ink-2">{e.summary}</p>
              {e.autoResolved && (
                <p className="mt-2 text-xs text-orange">Chose: {e.autoResolved.choice}. {e.autoResolved.reversible ? "Reversible." : "Not reversible."}</p>
              )}
              <Warnings warnings={e.warnings} />
              <Links links={e.links} />
              {e.reasoning && <p className="mt-3 text-ink-2">{e.reasoning}</p>}
              {e.sourceEvidence && (
                <blockquote className="mt-2 whitespace-pre-wrap rounded-md bg-cream px-3 py-2 font-mono text-xs leading-relaxed text-ink-2">{e.sourceEvidence}</blockquote>
              )}
            </div>
          </details>
        </li>
      ))}
    </ol>
  );
}
