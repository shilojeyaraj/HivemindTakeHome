import type { AgentEvent } from "@/lib/types";

// The agent's own tag, shown as the agent wrote it. Mono, like a severity label.
export function Tag({ event }: { event: AgentEvent }) {
  const isCorrection = event.corrects && event.kind === "error";
  const text = isCorrection ? "CORRECTION" : event.kind === "update" ? "UPDATE" : event.kind === "decision" ? "DECISION" : event.kind === "auto_action" ? "AUTO" : "ERROR";
  const cls =
    event.kind === "error" ? "bg-maroon-soft text-maroon" : event.kind === "auto_action" ? "bg-orange-soft text-orange" : event.kind === "decision" ? "bg-ink text-bg" : "bg-cream text-ink-2";
  return <span className={`tag ${cls}`}>{text}</span>;
}

export function Warnings({ warnings }: { warnings?: string[] }) {
  if (!warnings?.length) return null;
  return (
    <div className="mt-3 rounded-md bg-maroon-soft px-3 py-2.5 text-sm text-ink">
      <div className="text-xs font-semibold text-maroon">Bends your rules</div>
      <ul className="mt-1 space-y-1">
        {warnings.map((w) => (
          <li key={w} className="flex gap-2"><span className="text-maroon">&bull;</span><span>{w}</span></li>
        ))}
      </ul>
    </div>
  );
}

export function Links({ links }: { links?: string[] }) {
  if (!links?.length) return null;
  return (
    <ul className="mt-3 flex flex-wrap gap-2">
      {links.map((l) => {
        const host = new URL(l).hostname.replace(/^(www|shop)\./, "");
        return (
          <li key={l}>
            <a href={l} target="_blank" rel="noreferrer" className="rounded-full bg-cream px-3 py-1 text-xs font-medium text-ink hover:bg-cream-2">
              Open on {host}
            </a>
          </li>
        );
      })}
    </ul>
  );
}

export function RawEvidence({ event, label = "What the agent actually said" }: { event: AgentEvent; label?: string }) {
  if (!event.reasoning && !event.sourceEvidence) return null;
  return (
    <details className="group mt-3 text-sm">
      <summary className="inline-flex cursor-pointer items-center gap-1.5 text-muted hover:text-ink">
        <span className="inline-block w-3 text-center group-open:hidden">+</span>
        <span className="hidden w-3 text-center group-open:inline-block">&ndash;</span>
        {label}
      </summary>
      {event.reasoning && <p className="mt-2 text-ink-2">{event.reasoning}</p>}
      {event.sourceEvidence && (
        <blockquote className="mt-2 whitespace-pre-wrap rounded-md bg-cream px-3 py-2 font-mono text-xs leading-relaxed text-ink-2">
          {event.sourceEvidence}
        </blockquote>
      )}
    </details>
  );
}
