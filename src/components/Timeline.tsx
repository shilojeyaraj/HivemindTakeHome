import type { AgentEvent } from "@/lib/types";
import { clock, money } from "@/lib/format";
import { Links, RawEvidence, Warnings } from "./Evidence";

const KIND_LABEL: Record<AgentEvent["kind"], string> = {
  update: "Update",
  decision: "Asked you",
  auto_action: "Decided alone",
  error: "Problem",
};

function label(e: AgentEvent) {
  return e.corrects && e.kind === "error" ? "Correction" : KIND_LABEL[e.kind];
}

export function Timeline({ events, all }: { events: AgentEvent[]; all?: AgentEvent[] }) {
  if (events.length === 0) return <p className="text-sm text-muted">Nothing here yet.</p>;
  const byId = new Map((all ?? events).map((e) => [e.id, e]));
  return (
    <ol className="space-y-3">
      {events.map((e) => {
        const corrected = e.corrects ? byId.get(e.corrects) : undefined;
        const border = e.kind === "error" ? "border-bad-line" : e.kind === "auto_action" ? "border-accent-line" : "border-line";
        const tag = e.kind === "error" ? "text-bad" : e.kind === "auto_action" ? "text-accent" : "text-muted";
        return (
          <li key={e.id} id={e.id} className={`rounded-2xl border bg-surface p-4 text-sm ${border}`}>
            <div className="flex items-baseline justify-between gap-3">
              <span className={`text-[11px] font-medium uppercase tracking-wider ${tag}`}>{label(e)}</span>
              <span className="num font-mono text-xs text-muted">{clock(e.timestamp)}</span>
            </div>
            <div className="mt-1 font-medium">{e.title}</div>
            <p className="text-ink-2">{e.summary}</p>
            {corrected && (
              <p className="mt-1 text-xs text-muted">
                <a href={`#log-${corrected.id}`} className="underline decoration-line underline-offset-2 hover:decoration-ink">Corrects its {clock(corrected.timestamp)} message</a>
              </p>
            )}
            {e.spendDelta ? <p className="mt-1 text-xs">Charged or held: {money(e.spendDelta)}</p> : null}
            {e.autoResolved && (
              <p className="mt-2 rounded-lg bg-accent-bg px-3 py-2 text-xs text-ink">
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
