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
  update: "text-zinc-500",
  decision: "text-zinc-900 dark:text-zinc-100",
  auto_action: "text-amber-700 dark:text-amber-400",
  error: "text-red-600 dark:text-red-400",
};

// Compact, one line per message. Everything is here, but nothing is repeated
// at full size, since decisions, problems, and auto-actions already have
// their own sections above.
export function LogList({ events }: { events: AgentEvent[] }) {
  return (
    <ol className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
      {events.map((e) => (
        <li key={e.id} id={`log-${e.id}`}>
          <details className="group">
            <summary className="flex cursor-pointer items-baseline gap-3 px-4 py-2.5 text-sm">
              <span className="w-16 shrink-0 font-mono text-xs text-zinc-500">{clock(e.timestamp)}</span>
              <span className={`w-28 shrink-0 text-xs uppercase tracking-wide ${KIND_COLOR[e.kind]}`}>{KIND_LABEL[e.kind]}</span>
              <span className="min-w-0 flex-1 truncate group-open:whitespace-normal">{e.title}</span>
            </summary>
            <div className="px-4 pb-4 pl-4 text-sm sm:pl-[calc(4rem+7rem+1.5rem)]">
              <p className="text-zinc-600 dark:text-zinc-400">{e.summary}</p>
              {e.autoResolved && (
                <p className="mt-2 text-xs text-amber-800 dark:text-amber-300">
                  Chose: {e.autoResolved.choice}. {e.autoResolved.reversible ? "Reversible." : "Not reversible."}
                </p>
              )}
              <Warnings warnings={e.warnings} />
              <Links links={e.links} />
              {e.reasoning && <p className="mt-3 text-zinc-700 dark:text-zinc-300">{e.reasoning}</p>}
              {e.sourceEvidence && (
                <blockquote className="mt-2 whitespace-pre-wrap border-l-2 border-zinc-300 pl-3 font-mono text-xs text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
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
