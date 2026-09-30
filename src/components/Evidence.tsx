import type { AgentEvent } from "@/lib/types";

export function Warnings({ warnings }: { warnings?: string[] }) {
  if (!warnings?.length) return null;
  return (
    <div className="mt-3 rounded-lg border border-accent-line bg-accent-bg px-3 py-2 text-sm">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-accent">Bends your rules</div>
      <ul className="mt-1 list-disc space-y-1 pl-4 text-ink">
        {warnings.map((w) => <li key={w}>{w}</li>)}
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
            <a href={l} target="_blank" rel="noreferrer" className="rounded-md border border-line bg-surface px-2 py-1 text-xs text-ink-2 hover:border-line-strong">
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
    <details className="mt-3 text-sm">
      <summary className="cursor-pointer text-muted hover:text-ink">{label}</summary>
      {event.reasoning && <p className="mt-2 text-ink-2">{event.reasoning}</p>}
      {event.sourceEvidence && (
        <blockquote className="mt-2 whitespace-pre-wrap rounded-md bg-surface-2 px-3 py-2 font-mono text-xs leading-relaxed text-ink-2">
          {event.sourceEvidence}
        </blockquote>
      )}
    </details>
  );
}
