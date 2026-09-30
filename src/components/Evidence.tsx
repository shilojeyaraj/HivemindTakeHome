import type { AgentEvent } from "@/lib/types";

export function Warnings({ warnings }: { warnings?: string[] }) {
  if (!warnings?.length) return null;
  return (
    <ul className="mt-3 space-y-1">
      {warnings.map((w) => (
        <li key={w} className="rounded-md bg-amber-50 px-3 py-1.5 text-xs text-amber-900 dark:bg-amber-950 dark:text-amber-200">
          Bends your rules: {w}
        </li>
      ))}
    </ul>
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
