import type { AgentEvent, SteeringAction } from "@/lib/types";
import { clock } from "@/lib/format";

const STATUS: Record<SteeringAction["relayStatus"], { label: string; cls: string }> = {
  pending: { label: "Recorded, not yet sent", cls: "bg-surface-2 text-muted" },
  sent: { label: "Sent to agent, waiting for it to confirm", cls: "bg-accent-bg text-accent" },
  acknowledged: { label: "Agent confirmed", cls: "bg-ok-bg text-ok" },
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
          <li key={s.eventId + s.at} className="rise rounded-2xl border border-line bg-surface p-5">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
              <span>{clock(s.at)}</span>
              <span className={`rounded-full px-2 py-0.5 font-medium ${status.cls}`}>{status.label}</span>
            </div>
            <h3 className="mt-2 font-semibold tracking-tight">
              {verb}{option ? ` ${option.label}` : ""}
            </h3>
            {event && <p className="mt-1 text-sm text-ink-2">{event.title}, asked at {clock(event.timestamp)}</p>}
            {s.note && <p className="mt-1 text-sm">&ldquo;{s.note}&rdquo;</p>}
            <div className="mt-3 rounded-lg bg-surface-2 p-3">
              <div className="text-[11px] font-medium uppercase tracking-wider text-muted">Message to agent</div>
              <pre className="mt-1 whitespace-pre-wrap font-mono text-xs leading-relaxed">{s.relayMessage}</pre>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
