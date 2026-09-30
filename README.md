# Overnight Trip Agent: the morning-after screen

A supervision interface for a persistent AI agent that booked a multi-city trip while its user slept. Built for the Hivemind Winter '27 co-op take-home.

- Demo: (Vercel link goes here)
- Loom: (link goes here)
- Design doc: [docs/DESIGN.md](docs/DESIGN.md)

## What it does

Before bed the user told Instinct, a chat-based personal agent, to book a Toronto to New York to Boston reading week trip for under $1,500 with window seats. Instinct worked overnight. This interface is what the user sees when they wake up.

It has three parts, top to bottom in the order the user needs them:

1. **Brief.** Money spent or held against the $1,500 budget, how many decisions are waiting, how many things the agent decided alone, and how many problems it hit. One screen, no scrolling.
2. **Needs you.** Every decision the agent could not make alone, most urgent first. Each shows the options, the price difference, the tradeoff, the agent's recommendation, and the deadline. The user can choose an option, deny all of them, or redirect the agent with a sentence.
3. **Overnight log.** Every message the agent sent, in order. Auto-actions and errors are colored so they cannot be skimmed past. Each entry expands to show the agent's reasoning and the verbatim message it came from.

## How steering works

Instinct has no API, no webhooks, and no export. It only talks over iMessage or WhatsApp. So when the user picks an option, the interface records the decision, writes the exact message that goes back to the agent, and shows it on the card as "Sent to agent". In the demo that message is relayed to Instinct's chat by hand. This is a constraint of the agent, not the design, and the write-up treats it as one. See the design doc for what changes when an agent does expose an API.

## Data

All events in `data/events.json` come from the real Instinct transcript in `data/raw/`. The normalizer in `scripts/normalize.ts` does the mechanical split by message type and time. Structured fields like option prices and deadlines were filled in by hand from the transcript, and every event keeps the verbatim source text it was derived from. Nothing is fabricated.

## Running it

```
npm install
npm run dev
```

To rebuild events from a new transcript:

```
npx tsx scripts/normalize.ts
```

## Write-up

### How it works
(fill in after the overnight run)

### Constraints hit and how each was designed around
- Instinct is chat-only. Steering is a relay, shown transparently as the message that goes back.
- (add what happened overnight)

### Assumptions
- The agent has a card on file but was told not to purchase without approval.
- The user checks the interface once, in the morning, on a phone.
- (add more)

### The three questions

**Autonomy boundary.** (draft in docs/DESIGN.md)

**The 3 AM layover.** (draft in docs/DESIGN.md)

**Trust over time.** (draft in docs/DESIGN.md)

### AI tools used
- Instinct (the agent under supervision)
- Claude Code (scaffolding, normalizer, write-up drafting)
