import type { AgentEvent } from "@/lib/types";
import { clock } from "@/lib/format";
import { Links, Warnings } from "./Evidence";

const KIND_LABEL: Record<AgentEvent["kind"], string> = {
  update: "Update",
  decision: "Asked you",
  auto_action: "Decided alone",
  error: "Problem",
};

const KIND_COLOR: Record<AgentEvent["kind"], string> = {
  update: "text-muted",
  decision: "text-ink",
  auto_action: "text-accent",
  error: "text-bad",
};

// Compact, one line per message. Everything is here, but nothing is repeated
// at full size, since decisions, problems, and auto-actions have their own
// sections above.
export function LogList({ events }: { events: AgentEvent[] }) {
  return (
    <ol className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
      {events.map((e) => (
        <li key={e.id} id={`log-${e.id}`} className="scroll-mt-20">
          <details className="group">
            <summary className="flex cursor-pointer items-baseline gap-3 px-4 py-3 text-sm hover:bg-surface-2">
              <span className="num w-16 shrink-0 font-mono text-xs text-muted">{clock(e.timestamp)}</span>
              <span className={`hidden w-28 shrink-0 text-[11px] font-medium uppercase tracking-wider sm:inline ${KIND_COLOR[e.kind]}`}>
                {e.corrects && e.kind === "error" ? "Correction" : KIND_LABEL[e.kind]}
              </span>
              <span className="min-w-0 flex-1 truncate group-open:whitespace-normal">
                <span className={`mr-2 inline-block h-1.5 w-1.5 rounded-full align-middle sm:hidden ${e.kind === "error" ? "bg-bad" : e.kind === "auto_action" ? "bg-accent" : e.kind === "decision" ? "bg-ink" : "bg-line"}`} />
                {e.title}
              </span>
            </summary>
            <div className="px-4 pb-4 text-sm sm:pl-[calc(4rem+7rem+2.5rem)]">
              <p className="text-ink-2">{e.summary}</p>
              {e.autoResolved && (
                <p className="mt-2 text-xs text-accent">
                  Chose: {e.autoResolved.choice}. {e.autoResolved.reversible ? "Reversible." : "Not reversible."}
                </p>
              )}
              <Warnings warnings={e.warnings} />
              <Links links={e.links} />
              {e.reasoning && <p className="mt-3 text-ink-2">{e.reasoning}</p>}
              {e.sourceEvidence && (
                <blockquote className="mt-2 whitespace-pre-wrap rounded-md bg-surface-2 px-3 py-2 font-mono text-xs leading-relaxed text-ink-2">
                  {e.sourceEvidence}
                </blockquote>
              )}
            </div>
          </details>
        </li>
      ))}
    </ol>
  );
}
