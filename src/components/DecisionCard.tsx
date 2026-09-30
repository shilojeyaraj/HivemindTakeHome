"use client";

import { useState, useTransition } from "react";
import type { AgentEvent } from "@/lib/types";
import { clock, money, relative } from "@/lib/format";
import { Links, RawEvidence, Warnings } from "./Evidence";

type Status = "idle" | "sending" | "sent";

export function DecisionCard({ event, budget }: { event: AgentEvent; budget: number }) {
  const [status, setStatus] = useState<Status>("idle");
  const [relay, setRelay] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [pending, start] = useTransition();
  const expired = event.deadline ? new Date(event.deadline) < new Date() : false;

  function act(action: "approve" | "deny" | "redirect", optionId?: string) {
    setStatus("sending");
    start(async () => {
      const res = await fetch("/api/steer", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ eventId: event.id, action, optionId, note: note || undefined }),
      });
      const data = await res.json();
      setRelay(data.relayMessage);
      setStatus("sent");
    });
  }

  return (
    <article className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <header>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500">
          <span>Asked at {clock(event.timestamp)}</span>
          <span className={`rounded-full px-2 py-0.5 ${expired ? "bg-zinc-200 text-zinc-600 dark:bg-zinc-800" : event.deadline || event.urgencyNote ? "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200" : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"}`}>
            {event.deadline
              ? expired ? `Expired ${relative(event.deadline)}` : `Expires ${relative(event.deadline)}`
              : event.urgencyNote ?? "No deadline, nothing held"}
          </span>
        </div>
        <h3 className="mt-2 text-base font-semibold leading-snug">{event.title}</h3>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{event.summary}</p>
      </header>

      <Warnings warnings={event.warnings} />

      {event.options && (
        <ul className="mt-4 space-y-2">
          {event.options.map((o) => (
            <li key={o.id} className={`rounded-lg border p-3 text-sm ${o.recommended ? "border-zinc-900 dark:border-zinc-100" : "border-zinc-200 dark:border-zinc-800"}`}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{o.label}</div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs">
                    {o.total !== undefined && (
                      <span className={`rounded px-1.5 py-0.5 font-mono ${o.fitsBudget === false ? "bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-200" : "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"}`}>
                        {money(o.total)} total{o.fitsBudget === false ? `, ${money(o.total - budget)} over` : ""}
                      </span>
                    )}
                    {o.recommended && <span className="text-zinc-500">agent&apos;s pick</span>}
                  </div>
                  <div className="mt-1 text-zinc-600 dark:text-zinc-400">{o.tradeoff}</div>
                </div>
                <button disabled={status !== "idle" || pending} onClick={() => act("approve", o.id)} className="shrink-0 rounded-md bg-zinc-900 px-3 py-2 text-white disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 sm:py-1.5">
                  Choose {o.id}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Links links={event.links} />

      {status === "idle" && (
        <div className="mt-4 flex flex-col gap-2">
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Or tell the agent something else" className="w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700" />
          <div className="flex gap-2">
            <button disabled={!note} onClick={() => act("redirect")} className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm disabled:opacity-40 dark:border-zinc-700">Redirect</button>
            <button onClick={() => act("deny")} className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700">Deny all</button>
          </div>
        </div>
      )}
      {status === "sending" && <p className="mt-4 text-sm text-zinc-500">Recording your decision and writing the message to the agent...</p>}
      {status === "sent" && relay && (
        <div className="mt-4 rounded-md bg-zinc-100 p-3 text-sm dark:bg-zinc-800">
          <div className="text-xs uppercase tracking-wide text-zinc-500">Sent to agent, waiting for it to confirm</div>
          <pre className="mt-1 whitespace-pre-wrap font-mono text-xs">{relay}</pre>
        </div>
      )}

      <RawEvidence event={event} label="Why the agent asked, and what it actually said" />
    </article>
  );
}
