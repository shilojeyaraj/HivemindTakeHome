import type { AgentEvent, SteeringAction } from "@/lib/types";
import { clock } from "@/lib/format";

const STATUS: Record<SteeringAction["relayStatus"], { label: string; cls: string }> = {
  pending: { label: "Sent to agent, waiting for it to confirm", cls: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200" },
  sent: { label: "Sent to agent, waiting for it to confirm", cls: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200" },
  acknowledged: { label: "Agent confirmed", cls: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200" },
};

export function Decided({ events, steering }: { events: AgentEvent[]; steering: SteeringAction[] }) {
  const byId = new Map(events.map((e) => [e.id, e]));
  const rows = [...steering].sort((a, b) => b.at.localeCompare(a.at));
  return (
    <ul className="space-y-3">
      {rows.map((s) => {
        const event = byId.get(s.eventId);
        const option = event?.options?.find((o) => o.id === s.optionId);
        const status = STATUS[s.relayStatus];
        const verb = s.action === "approve" ? "You chose" : s.action === "deny" ? "You denied all options for" : "You redirected";
        return (
          <li key={s.eventId + s.at} className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500">
              <span>{clock(s.at)}</span>
              <span className={`rounded-full px-2 py-0.5 ${status.cls}`}>{status.label}</span>
            </div>
            <h3 className="mt-2 font-semibold">
              {verb}{option ? ` ${option.label}` : ""}
            </h3>
            {event && <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{event.title}, asked at {clock(event.timestamp)}</p>}
            {s.note && <p className="mt-1 text-sm">&ldquo;{s.note}&rdquo;</p>}
            <div className="mt-3 rounded-md bg-zinc-100 p-3 dark:bg-zinc-800">
              <div className="text-xs uppercase tracking-wide text-zinc-500">Message to agent</div>
              <pre className="mt-1 whitespace-pre-wrap font-mono text-xs">{s.relayMessage}</pre>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
