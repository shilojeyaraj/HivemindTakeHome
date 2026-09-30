"use client";

import { useMemo, useSyncExternalStore } from "react";
import type { AgentEvent, SteeringAction } from "@/lib/types";
import { BUDGET, buildBrief, composeRelay, pendingDecisions } from "@/lib/brief";
import { Brief } from "./Brief";
import { DecisionCard } from "./DecisionCard";
import { Decided } from "./Decided";
import { Timeline } from "./Timeline";
import { LogList } from "./LogList";

const STORAGE_KEY = "trip-agent-steering-v1";

// A tiny external store over localStorage, so React can subscribe to it
// without a hydration mismatch. Falls back to memory when storage is blocked.
const EMPTY: SteeringAction[] = [];
let memory: SteeringAction[] = EMPTY;
let cachedRaw: string | null = null;
let cachedRows: SteeringAction[] = EMPTY;
const listeners = new Set<() => void>();

function readLocal(): SteeringAction[] {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    return memory;
  }
  if (raw === cachedRaw) return cachedRows;
  cachedRaw = raw;
  try {
    cachedRows = raw ? (JSON.parse(raw) as SteeringAction[]) : EMPTY;
  } catch {
    cachedRows = EMPTY;
  }
  return cachedRows;
}

function writeLocal(rows: SteeringAction[]) {
  memory = rows;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  } catch {
    // private mode or blocked storage; memory still works for this visit
  }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

// The whole morning screen. Server gives it events and any steering recorded
// on disk; the client merges in decisions made in this browser so the screen
// updates instantly and survives a reload even where the server cannot write.
export function Morning({ events, serverSteering }: { events: AgentEvent[]; serverSteering: SteeringAction[] }) {
  const local = useSyncExternalStore(subscribe, readLocal, () => EMPTY);

  const steering = useMemo(() => {
    const seen = new Set(serverSteering.map((s) => s.eventId));
    return [...serverSteering, ...local.filter((s) => !seen.has(s.eventId))];
  }, [serverSteering, local]);

  const brief = useMemo(() => buildBrief(events, steering), [events, steering]);
  const decisions = useMemo(() => pendingDecisions(events, steering), [events, steering]);
  const problems = events.filter((e) => e.kind === "error" || (e.kind === "auto_action" && e.autoResolved && !e.autoResolved.reversible));
  const autos = events.filter((e) => e.kind === "auto_action" && e.autoResolved?.reversible);

  function act(event: AgentEvent, action: SteeringAction["action"], optionId?: string, note?: string) {
    const record: SteeringAction = {
      eventId: event.id,
      action,
      optionId,
      note,
      at: new Date().toISOString(),
      relayMessage: composeRelay(event, action, optionId, note),
      relayStatus: "sent",
    };
    // Optimistic: the screen changes now. The server call only confirms.
    const next = [...local.filter((s) => s.eventId !== event.id), record];
    writeLocal(next);
    fetch("/api/steer", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ eventId: event.id, action, optionId, note, at: record.at }),
    })
      .then((r) => r.json())
      .catch(() => {
        // Keep the optimistic record; the message is still shown for manual relay.
      });
  }

  return (
    <>
      <nav className="sticky top-0 z-10 -mx-4 flex gap-2 overflow-x-auto bg-bg/90 px-4 py-2 text-xs backdrop-blur [scrollbar-width:none] sm:hidden [&::-webkit-scrollbar]:hidden">
        <Jump href="#needs-you" label="Needs you" count={decisions.length} tone={decisions.length ? "orange" : undefined} />
        <Jump href="#problems" label="Problems" count={problems.length} tone={problems.length ? "maroon" : undefined} />
        <Jump href="#alone" label="Decided alone" count={autos.length} />
        <Jump href="#log" label="Log" count={events.length} />
      </nav>

      <Brief brief={brief} />

      <Section id="needs-you" title="Needs you" count={decisions.length}>
        {decisions.length === 0 ? (
          <p className="rounded-md border border-dashed border-line px-4 py-6 text-center text-sm text-muted">Nothing waiting on you.</p>
        ) : (
          <div className="space-y-4">
            {decisions.map((d) => (
              <DecisionCard key={d.id} event={d} budget={BUDGET} onAct={(a, o, n) => act(d, a, o, n)} />
            ))}
          </div>
        )}
      </Section>

      {steering.length > 0 && (
        <Section title="You decided" count={steering.length} sub="Instinct has no API, so each decision becomes a chat message. Status updates when the agent replies.">
          <Decided events={events} steering={steering} />
        </Section>
      )}

      {problems.length > 0 && (
        <Section id="problems" title="Problems it hit" count={problems.length} sub="Things that went wrong or that the agent could not verify. Worth reading before you choose.">
          <Timeline events={problems} all={events} />
        </Section>
      )}

      {autos.length > 0 && (
        <Section id="alone" title="Decided on its own" count={autos.length} sub="Reversible choices the agent made without asking. Redirect any of them from a decision above.">
          <Timeline events={autos} all={events} />
        </Section>
      )}

      <Section id="log" title="The whole night" count={events.length} sub="Every message in order. Tap one for the agent's exact words.">
        <LogList events={events} />
      </Section>
    </>
  );
}

function Section({ id, title, count, sub, children }: { id?: string; title: string; count: number; sub?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-12">
      <h2 className="serif text-[28px] leading-none">
        {title} <span className="num text-muted">{count}</span>
      </h2>
      {sub && <p className="mt-1.5 text-sm text-muted">{sub}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Jump({ href, label, count, tone }: { href: string; label: string; count: number; tone?: "orange" | "maroon" }) {
  const cls = tone === "orange" ? "bg-orange-soft text-orange" : tone === "maroon" ? "bg-maroon-soft text-maroon" : "bg-cream text-ink-2";
  return (
    <a href={href} className={`inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 font-medium ${cls}`}>
      {label} <span className="num">{count}</span>
    </a>
  );
}
