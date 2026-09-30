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
      <header className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">{event.title}</h3>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{event.summary}</p>
        </div>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${expired ? "bg-zinc-200 text-zinc-600 dark:bg-zinc-800" : event.deadline ? "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200" : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"}`}>
          {event.deadline ? (expired ? `Expired ${relative(event.deadline)}` : `Expires ${relative(event.deadline)}`) : "Nothing held"}
        </span>
      </header>

      <Warnings warnings={event.warnings} />

      {event.options && (
        <ul className="mt-4 space-y-2">
          {event.options.map((o) => (
            <li key={o.id} className={`rounded-lg border p-3 text-sm ${o.recommended ? "border-zinc-900 dark:border-zinc-100" : "border-zinc-200 dark:border-zinc-800"}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
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
                <button disabled={status !== "idle" || pending} onClick={() => act("approve", o.id)} className="shrink-0 rounded-md bg-zinc-900 px-3 py-1.5 text-white disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900">
                  Choose
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Links links={event.links} />

      {status === "idle" && (
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Or redirect, e.g. Newark is a dealbreaker, find a Manhattan room even if it means a dorm in Boston" className="flex-1 rounded-md border border-zinc-300 bg-transparent px-3 py-1.5 text-sm dark:border-zinc-700" />
          <button disabled={!note} onClick={() => act("redirect")} className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm disabled:opacity-40 dark:border-zinc-700">Redirect</button>
          <button onClick={() => act("deny")} className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700">Deny all</button>
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
      <footer className="mt-3 text-xs text-zinc-500">Asked at {clock(event.timestamp)}</footer>
    </article>
  );
}
