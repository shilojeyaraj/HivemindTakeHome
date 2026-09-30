"use client";

import { useState } from "react";
import type { AgentEvent, SteeringAction } from "@/lib/types";
import { clock, money, relative } from "@/lib/format";
import { Links, RawEvidence, Warnings } from "./Evidence";

type Props = {
  event: AgentEvent;
  budget: number;
  onAct: (action: SteeringAction["action"], optionId?: string, note?: string) => void;
};

export function DecisionCard({ event, budget, onAct }: Props) {
  const [note, setNote] = useState("");
  const expired = event.deadline ? new Date(event.deadline) < new Date() : false;
  const chip = event.deadline
    ? expired ? `Expired ${relative(event.deadline)}` : `Expires ${relative(event.deadline)}`
    : event.urgencyNote ?? "No deadline, nothing held";
  const chipTone = expired ? "bg-surface-2 text-muted" : event.deadline || event.urgencyNote ? "bg-accent-bg text-accent" : "bg-surface-2 text-muted";

  return (
    <article className="rise rounded-2xl border border-line bg-surface p-5">
      <header>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
          <span>Asked at {clock(event.timestamp)}</span>
          <span className={`rounded-full px-2 py-0.5 font-medium ${chipTone}`}>{chip}</span>
        </div>
        <h3 className="mt-2 text-lg font-semibold leading-snug tracking-tight">{event.title}</h3>
        <p className="mt-1 text-sm text-ink-2">{event.summary}</p>
      </header>

      <Warnings warnings={event.warnings} />

      {event.options && (
        <ul className="mt-4 space-y-2">
          {event.options.map((o) => (
            <li key={o.id} className={`rounded-xl border p-3 text-sm ${o.recommended ? "border-line-strong" : "border-line"}`}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{o.label}</div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                    {o.total !== undefined && (
                      <span className={`num rounded px-1.5 py-0.5 font-mono ${o.fitsBudget === false ? "bg-bad-bg text-bad" : "bg-ok-bg text-ok"}`}>
                        {money(o.total)} total{o.fitsBudget === false ? `, ${money(o.total - budget)} over` : ""}
                      </span>
                    )}
                    {o.recommended && <span className="text-muted">agent&apos;s pick</span>}
                  </div>
                  <div className="mt-1 text-ink-2">{o.tradeoff}</div>
                </div>
                <button onClick={() => onAct("approve", o.id, note || undefined)} className="shrink-0 rounded-lg bg-ink px-3 py-2 text-sm font-medium text-bg hover:opacity-90 active:scale-[0.98] sm:py-1.5">
                  Choose {o.id}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Links links={event.links} />

      <div className="mt-4 flex flex-col gap-2">
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Or tell the agent something else" className="w-full rounded-lg border border-line bg-transparent px-3 py-2 text-sm placeholder:text-muted focus:border-line-strong focus:outline-none" />
        <div className="flex gap-2">
          <button disabled={!note} onClick={() => onAct("redirect", undefined, note)} className="flex-1 rounded-lg border border-line px-3 py-2 text-sm hover:border-line-strong disabled:opacity-40">Redirect</button>
          <button onClick={() => onAct("deny", undefined, note || undefined)} className="flex-1 rounded-lg border border-line px-3 py-2 text-sm hover:border-line-strong">Deny all</button>
        </div>
      </div>

      <RawEvidence event={event} label="Why the agent asked, and what it actually said" />
    </article>
  );
}
