import type { AgentEvent, SteeringAction } from "@/lib/types";
import { clock } from "@/lib/format";

const STATUS: Record<SteeringAction["relayStatus"], { label: string; cls: string }> = {
  pending: { label: "Recorded, not yet sent", cls: "bg-cream text-muted" },
  sent: { label: "Sent to agent, waiting for it to confirm", cls: "bg-orange-soft text-orange" },
  acknowledged: { label: "Agent confirmed", cls: "bg-ok-soft text-ok" },
  applied: { label: "Done by agent", cls: "bg-ok-soft text-ok" },
  failed: { label: "Agent could not do this", cls: "bg-maroon-soft text-maroon" },
};

export function Decided({ events, steering }: { events: AgentEvent[]; steering: SteeringAction[] }) {
  const byId = new Map(events.map((e) => [e.id, e]));
  const rows = [...steering].sort((a, b) => b.at.localeCompare(a.at));
  return (
    <ul className="divide-y divide-line rounded-md border border-line bg-surface">
      {rows.map((s) => {
        const event = byId.get(s.eventId);
        const option = event?.options?.find((o) => o.id === s.optionId);
        const status = STATUS[s.relayStatus];
        const verb = s.action === "approve" ? "You chose" : s.action === "deny" ? "You denied all options for" : "You redirected";
        return (
          <li key={s.eventId + s.at} className="rise px-5 py-4">
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
              <span className={`rounded-full px-2.5 py-1 font-medium ${status.cls}`}>{status.label}</span>
              <span className="num">{clock(s.at)}</span>
            </div>
            <h3 className="mt-2 font-medium">
              {verb}{option ? ` ${option.label}` : ""}
            </h3>
            {event && <p className="mt-0.5 text-sm text-ink-2">{event.title}, asked at {clock(event.timestamp)}</p>}
            {s.note && <p className="mt-1 text-sm">&ldquo;{s.note}&rdquo;</p>}
            <pre className="mt-3 whitespace-pre-wrap rounded-md bg-cream px-3 py-2 font-mono text-xs leading-relaxed text-ink-2">{s.relayMessage}</pre>
          </li>
        );
      })}
    </ul>
  );
}
