import type { AgentEvent } from "@/lib/types";
import { clock, money } from "@/lib/format";
import { Links, RawEvidence, Warnings } from "./Evidence";

const KIND_LABEL: Record<AgentEvent["kind"], string> = {
  update: "Update",
  decision: "Asked you",
  auto_action: "Decided alone",
  error: "Problem",
};

export function Timeline({ events, all }: { events: AgentEvent[]; all?: AgentEvent[] }) {
  if (events.length === 0) {
    return <p className="text-sm text-zinc-500">Nothing here yet.</p>;
  }
  const byId = new Map((all ?? events).map((e) => [e.id, e]));
  return (
    <ol className="space-y-3">
      {events.map((e) => {
        const corrected = e.corrects ? byId.get(e.corrects) : undefined;
        return (
          <li key={e.id} id={e.id} className={`rounded-lg border p-4 text-sm ${e.kind === "error" ? "border-red-300 dark:border-red-900" : e.kind === "auto_action" ? "border-amber-300 dark:border-amber-900" : "border-zinc-200 dark:border-zinc-800"}`}>
            <div className="flex items-baseline justify-between gap-3">
              <span className={`text-xs uppercase tracking-wide ${e.kind === "error" ? "text-red-600 dark:text-red-400" : e.kind === "auto_action" ? "text-amber-700 dark:text-amber-400" : "text-zinc-500"}`}>{KIND_LABEL[e.kind]}</span>
              <span className="font-mono text-xs text-zinc-500">{clock(e.timestamp)}</span>
            </div>
            <div className="mt-1 font-medium">{e.title}</div>
            <p className="text-zinc-600 dark:text-zinc-400">{e.summary}</p>
            {corrected && (
              <p className="mt-1 text-xs text-zinc-500">
                Corrects <a href={`#${corrected.id}`} className="underline">{corrected.title}</a> ({clock(corrected.timestamp)})
              </p>
            )}
            {e.spendDelta ? <p className="mt-1 text-xs">Charged or held: {money(e.spendDelta)}</p> : null}
            {e.autoResolved && (
              <p className="mt-2 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:bg-amber-950 dark:text-amber-200">
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
