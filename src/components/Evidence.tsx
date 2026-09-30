import type { AgentEvent } from "@/lib/types";

export function Warnings({ warnings }: { warnings?: string[] }) {
  if (!warnings?.length) return null;
  return (
    <div className="mt-3 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-100">
      <div className="text-xs font-semibold uppercase tracking-wide text-amber-800 dark:text-amber-300">Bends your rules</div>
      <ul className="mt-1 list-disc space-y-1 pl-4">
        {warnings.map((w) => <li key={w}>{w}</li>)}
      </ul>
    </div>
  );
}

export function Links({ links }: { links?: string[] }) {
  if (!links?.length) return null;
  return (
    <ul className="mt-2 flex flex-wrap gap-2">
      {links.map((l) => {
        const host = new URL(l).hostname.replace(/^(www|shop)\./, "");
        return (
          <li key={l}>
            <a href={l} target="_blank" rel="noreferrer" className="rounded-md border border-zinc-300 px-2 py-0.5 text-xs text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">
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
      <summary className="cursor-pointer text-zinc-500">{label}</summary>
      {event.reasoning && <p className="mt-2 text-zinc-700 dark:text-zinc-300">{event.reasoning}</p>}
      {event.sourceEvidence && (
        <blockquote className="mt-2 whitespace-pre-wrap border-l-2 border-zinc-300 pl-3 font-mono text-xs text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
          {event.sourceEvidence}
        </blockquote>
      )}
    </details>
  );
}
