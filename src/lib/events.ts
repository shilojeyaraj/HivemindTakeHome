import fs from "node:fs";
import path from "node:path";
import type { AgentEvent, SteeringAction } from "./types";

export { BUDGET, buildBrief, pendingDecisions, composeRelay } from "./brief";

const DATA_DIR = path.join(process.cwd(), "data");

export function loadEvents(): AgentEvent[] {
  const file = path.join(DATA_DIR, "events.json");
  if (!fs.existsSync(file)) return [];
  const events = JSON.parse(fs.readFileSync(file, "utf8")) as AgentEvent[];
  return events.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}

export function loadSteering(): SteeringAction[] {
  const file = path.join(DATA_DIR, "steering-log.json");
  if (!fs.existsSync(file)) return [];
  try {
    return JSON.parse(fs.readFileSync(file, "utf8")) as SteeringAction[];
  } catch {
    return [];
  }
}
