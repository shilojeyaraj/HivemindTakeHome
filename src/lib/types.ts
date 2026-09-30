// Common event model. Every agent's raw output gets normalized into this shape
// so the UI never depends on a specific agent's message format.

export type AgentName = "instinct" | "muse" | "grok";

export type EventKind = "update" | "decision" | "error" | "auto_action";

export type DecisionOption = {
  id: string;
  label: string;
  costDelta?: number; // dollars relative to the cheapest option, positive = more expensive
  tradeoff: string;
  recommended?: boolean;
  total?: number; // absolute trip total if this option is chosen
  fitsBudget?: boolean;
};

export type AutoResolved = {
  choice: string;
  reversible: boolean;
  undoBy?: string; // ISO timestamp after which undo is no longer possible
};

export type CrossCheck = {
  agreesWith: AgentName[];
  conflictsWith: { agent: AgentName; detail: string }[];
};

export type AgentEvent = {
  id: string;
  agent: AgentName;
  timestamp: string; // ISO 8601
  kind: EventKind;
  title: string;
  summary: string;
  reasoning?: string;
  sourceEvidence?: string; // verbatim excerpt from the agent transcript
  options?: DecisionOption[];
  deadline?: string; // ISO 8601, e.g. fare expiry
  autoResolved?: AutoResolved;
  spendDelta?: number; // dollars committed by this event, if any
  confidence?: "high" | "medium" | "low";
  crossCheck?: CrossCheck;
  links?: string[]; // URLs the agent sent with this message
  warnings?: string[]; // user rules this bends or breaks, in plain words
  corrects?: string; // id of an earlier event this one corrects
};

// What the user did about a decision. Stored separately from events so the
// agent log stays untouched.
export type SteeringAction = {
  eventId: string;
  action: "approve" | "deny" | "redirect";
  optionId?: string;
  note?: string;
  at: string; // ISO 8601
  relayMessage: string; // exact text sent back to the agent's chat
  relayStatus: "pending" | "sent" | "acknowledged";
};

export type TripBrief = {
  budget: number;
  committed: number; // dollars already spent or held
  pending: number; // dollars that would be spent if recommended options are approved
  decisionsWaiting: number;
  urgentDecisions: number; // decisions with a deadline in the next 2 hours
  errors: number;
  autoActions: number;
  firstEventAt?: string;
  lastEventAt?: string;
};
