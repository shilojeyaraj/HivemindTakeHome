// Turns data/raw/instinct-transcript.txt into data/events.json.
//
// Transcript format (what we asked Instinct to produce, and what it sent):
//   [5:38 PM] DECISION: Full trip is priced ...
//   A. CA$1,429 (fits): ...            <- continuation lines stay with the event
//   https://www.airbnb.ca/rooms/...     <- URL lines become event.links
//
// The mechanical part is here. The judgment part (options, prices, deadlines,
// which rule an option bends) lives in data/enrichments.json keyed by event id,
// and is merged on top. sourceEvidence is always the verbatim transcript text.
//
// Run: npx tsx scripts/normalize.ts

import fs from "node:fs";
import path from "node:path";
import type { AgentEvent, EventKind } from "../src/lib/types";

const RAW = path.join(process.cwd(), "data", "raw", "instinct-transcript.txt");
const ENRICH = path.join(process.cwd(), "data", "enrichments.json");
const OUT = path.join(process.cwd(), "data", "events.json");
const RUN_DATE = "2026-09-29"; // night the scenario ran; messages after midnight roll to the next day
const TZ_OFFSET = "-04:00"; // America/Toronto, EDT

const KIND: Record<string, EventKind> = { UPDATE: "update", DECISION: "decision", AUTO: "auto_action", ERROR: "error" };
const LINE = /^\[(\d{1,2}):(\d{2})\s*(AM|PM)\]\s*(UPDATE|DECISION|AUTO|ERROR):\s*(.*)$/i;

function toIso(h12: number, m: number, ampm: string, rolled: boolean): string {
  const hour = (h12 % 12) + (ampm.toUpperCase() === "PM" ? 12 : 0);
  const d = new Date(`${RUN_DATE}T00:00:00${TZ_OFFSET}`);
  if (rolled) d.setUTCDate(d.getUTCDate() + 1);
  d.setUTCHours(d.getUTCHours() + hour, m, 0, 0);
  return d.toISOString();
}

if (!fs.existsSync(RAW)) {
  console.error(`No transcript at ${RAW}. Paste it there first.`);
  process.exit(1);
}

const events: AgentEvent[] = [];
let rolled = false;
let lastHour = 0;
let current: AgentEvent | null = null;

for (const rawLine of fs.readFileSync(RAW, "utf8").split("\n")) {
  const line = rawLine.replace(/\r$/, "");
  const m = line.match(LINE);
  if (!m) {
    if (!current || !line.trim()) continue;
    if (/^https?:\/\//.test(line.trim())) {
      (current.links ??= []).push(line.trim());
    } else {
      current.sourceEvidence += "\n" + line;
    }
    continue;
  }
  const [, hh, mm, ampm, tag, rest] = m;
  const hour24 = (parseInt(hh, 10) % 12) + (ampm.toUpperCase() === "PM" ? 12 : 0);
  if (hour24 < lastHour) rolled = true;
  lastHour = hour24;
  current = {
    id: `instinct-${String(events.length + 1).padStart(3, "0")}`,
    agent: "instinct",
    timestamp: toIso(parseInt(hh, 10), parseInt(mm, 10), ampm, rolled),
    kind: KIND[tag.toUpperCase()],
    title: rest.split(/[.;:]/)[0].slice(0, 80),
    summary: rest,
    sourceEvidence: line,
  };
  events.push(current);
}

const enrichments: Record<string, Partial<AgentEvent>> = fs.existsSync(ENRICH)
  ? JSON.parse(fs.readFileSync(ENRICH, "utf8"))
  : {};

const merged = events.map((e) => {
  const extra = enrichments[e.id];
  if (!extra) return e;
  if (extra.sourceEvidence) throw new Error(`${e.id}: sourceEvidence must stay verbatim, remove it from enrichments`);
  return { ...e, ...extra };
});

fs.writeFileSync(OUT, JSON.stringify(merged, null, 2));
const unenriched = merged.filter((e) => e.kind === "decision" && !e.options).map((e) => e.id);
console.log(`Wrote ${merged.length} events to ${OUT}.`);
if (unenriched.length) console.log(`Decisions without options yet: ${unenriched.join(", ")}`);
