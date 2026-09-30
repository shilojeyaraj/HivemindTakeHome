"use client";

import { useState } from "react";
import type { AgentEvent, SteeringAction } from "@/lib/types";
import { clock, money, relative } from "@/lib/format";
import { Links, RawEvidence, Tag, Warnings } from "./Evidence";

type Props = {
  event: AgentEvent;
  budget: number;
  onAct: (action: SteeringAction["action"], optionId?: string, note?: string) => void;
};

export function DecisionCard({ event, budget, onAct }: Props) {
  const [note, setNote] = useState("");
  const expired = event.deadline ? new Date(event.deadline) < new Date() : false;
  const urgency = event.deadline
    ? expired ? `Expired ${relative(event.deadline)}` : `Expires ${relative(event.deadline)}`
    : event.urgencyNote ?? null;

  return (
    <article className="rise rounded-md border border-line bg-surface">
      <header className="px-5 pt-4">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
          <Tag event={event} />
          <span>{clock(event.timestamp)}</span>
          {urgency && (
            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${expired ? "bg-cream text-muted" : "bg-orange-soft text-orange"}`}>{urgency}</span>
          )}
          {!urgency && <span className="rounded-full bg-cream px-2.5 py-1 text-xs text-muted">No deadline, nothing held</span>}
        </div>
        <h3 className="serif mt-3 text-[26px] leading-tight">{event.title}</h3>
        <p className="mt-1.5 text-sm text-ink-2">{event.summary}</p>
        <Warnings warnings={event.warnings} />
      </header>

      {event.options && (
        <ul className="mt-4 divide-y divide-line border-t border-line">
          {event.options.map((o) => (
            <li key={o.id} className="px-5 py-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <span className="font-medium">{o.label}</span>
                    {o.recommended && <span className="text-xs text-muted">agent&apos;s pick</span>}
                  </div>
                  {o.total !== undefined && (
                    <div className={`num mt-1 text-sm ${o.fitsBudget === false ? "text-maroon" : "text-ok"}`}>
                      {money(o.total)} total{o.fitsBudget === false ? `, ${money(o.total - budget)} over` : ", fits"}
                    </div>
                  )}
                  <div className="mt-1 text-sm text-ink-2">{o.tradeoff}</div>
                </div>
                <button
                  onClick={() => onAct("approve", o.id, note || undefined)}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition active:scale-[0.98] ${o.recommended ? "bg-orange text-orange-ink hover:brightness-95" : "bg-cream text-ink hover:bg-cream-2"}`}
                >
                  Choose {o.id}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="border-t border-line px-5 py-4">
        <Links links={event.links} />
        <div className={`flex flex-col gap-2 sm:flex-row ${event.links?.length ? "mt-3" : ""}`}>
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Or tell the agent something else" className="min-w-0 flex-1 rounded-full border border-line bg-transparent px-4 py-2 text-sm placeholder:text-muted focus:border-line-strong focus:outline-none" />
          <div className="flex gap-2">
            <button disabled={!note} onClick={() => onAct("redirect", undefined, note)} className="flex-1 rounded-full bg-cream px-4 py-2 text-sm font-medium hover:bg-cream-2 disabled:opacity-40 sm:flex-none">Redirect</button>
            <button onClick={() => onAct("deny", undefined, note || undefined)} className="flex-1 rounded-full bg-cream px-4 py-2 text-sm font-medium hover:bg-cream-2 sm:flex-none">Deny all</button>
          </div>
        </div>
        <RawEvidence event={event} label="Why the agent asked, and what it actually said" />
      </div>
    </article>
  );
}
