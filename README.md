# Overnight Trip Agent: the morning-after screen

A supervision interface for a persistent AI agent that planned a multi-city trip while its user was away. Built for the Hivemind Winter '27 co-op take-home.

- Demo: (Vercel link)
- Loom: (link)
- Design doc with the full reasoning: [docs/DESIGN.md](docs/DESIGN.md)

## How it works

At 5:02 PM on September 29 I told Instinct, a chat-only personal agent, to book my reading week trip: Toronto to New York to Boston and back, October 10 to 18, under $1,500, window seats where possible. I had already told it my preferences (window seat, no red-eyes, direct flights worth about $100 extra, central and walkable over nice, budget is a hard cap) and one ground rule: search, compare, and hold, but never buy without my approval. I asked it to tag every message UPDATE, DECISION, AUTO, or ERROR with a timestamp. Then I stopped replying.

Instinct sent 12 messages in 81 minutes and went quiet, because everything left needed a purchase. This interface is what I see when I come back.

Top to bottom, in the order I need it:

1. **Brief.** Spent so far, projected total if I approve the agent's pick, decisions waiting, problems hit. Four numbers, one sentence. For a trip I trust the agent on, this is the whole morning.
2. **Needs you.** One card per unresolved decision, most urgent first. This run produced one: four trip options, two under budget. Each option shows its total in green or red against the budget, the tradeoff in one line, and which one the agent recommends. Above the options, a "Bends your rules" block lists every way the options violate what I asked for. I can choose an option, deny them all, or redirect with a sentence.
3. **Problems it hit.** Errors and unverified claims, pulled out of the log so they are not buried. This run: the budget warning, the Amtrak bot-check block, and the agent's own correction of a commute time it had made up.
4. **Decided on its own.** Reversible choices the agent made without asking, each marked as reversible and why. This run: the 4 night / 4 night split and the FlixBus.
5. **Everything, in order.** All 12 messages. Every entry expands to show the agent's exact words, so I can check any summary against the source.

### Steering

Instinct has no API, no webhooks, and no export. It only talks over iMessage. So when I choose an option, the interface records the decision and composes the message that goes back to the agent, then shows it on the card as "Sent to agent, waiting for it to confirm". In this demo I relay that message to Instinct by hand. With an agent that exposed an API, the same record would be an HTTP call and the card would move to "confirmed" on its own. The UI already carries that state.

(Screenshot of Instinct's reply to the relayed message goes here.)

### Data

Every event in `data/events.json` comes from the real transcript in `data/raw/instinct-transcript.txt`. The normalizer in `scripts/normalize.ts` does the mechanical split by tag and time. Structured fields like option totals, tradeoffs, and rule warnings are hand-written in `data/enrichments.json` and merged on top. The agent's verbatim text is never edited, and the normalizer refuses enrichments that try. Nothing is fabricated.

## Constraints hit, and what I did about each

- **Instinct is chat-only.** No API, no export. Data is a pasted transcript, steering is a relay. I made the relay visible instead of hiding it: the card shows the exact message going back, which is what a user would want to see anyway.
- **Instinct cannot hold fares.** Its decision came with "no deadline, nothing held", so the urgency sort had nothing to sort. The card says so in plain words rather than hiding the deadline chip.
- **Instinct finished in 81 minutes, not 8 hours.** "Overnight" really means "the user was not watching". The interface does not care how long the agent worked, only what it left behind.
- **It buried a decision inside an UPDATE.** At 5:05 PM it priced a later return flight (+$122) and reported it as information, never as a choice, even though I said I prefer later departures. The interface attaches a rule warning to that update. This is the strongest argument in this project for the interface deciding what needs the user, not the agent.
- **It bent my rules to fit the budget** by picking a room in Newark, NJ, 50 minutes from Manhattan, and said so honestly in the middle of a long message. The interface pulls that out into the "Bends your rules" block at the top of the decision, above the options.
- **It got a commute time wrong, then corrected itself** 43 minutes later. Corrections link back to the message they fix, so I see both the fix and the fact that the agent was wrong first.
- **It got blocked by Amtrak's bot check** and switched to a bus without asking. Reasonable fallback, listed under problems so I know a train was never priced.

## Assumptions

- The user checks the interface once, on a phone, with about 90 seconds of attention.
- The agent has a card on file but was told not to purchase without approval. Every design choice about autonomy assumes the agent respects that rule.
- All amounts are CAD, because Instinct reported in CAD without being asked.
- One agent. The event model has fields for cross-checking multiple agents, but the comparison view is not built. One solid agent with real data was worth more than two half-connected ones in the time available.

## The three questions

### Autonomy boundary

The agent may act alone when the action is **reversible, inside the stated rules, and cheap to undo.** Search, compare, shortlist, and free holds are always fine. Choosing how to split nights between cities is fine because it costs nothing to change. Anything that breaks a stated rule waits, and the interface names the rule it breaks. Anything non-refundable waits, on trip 1 without exception.

The boundary sits at reversibility because the cost of a wrong hold is zero and the cost of a wrong purchase is real money and a bad trip. Budget and preferences are the user's rules. The agent does not get to reinterpret them at 3 AM, and this run showed why: the only way under $1,500 was a room 50 minutes from the city, and the agent correctly queued that as a decision instead of taking it.

### The 3 AM layover

The only routing under budget has a six-hour layover. The agent should hold it if a free hold exists, then also find the best over-budget direct option and price the gap, then queue one decision: "Under budget with a 6 h layover, or direct for $N over." Recommendation stated, deadline shown if the hold expires. It should not book, because a six-hour layover is a quality tradeoff the user never priced.

In the morning that card is at the top of "Needs you" because it has a deadline. If the hold expired while the user slept, the chip says "Expired 2 h ago" and the card says what the agent will do on approval (re-search). The user sees the two options, the exact dollar gap, and the reasoning. This run had a close cousin: the only way under budget was a Newark room. Instinct handled it the right way. It did not book, priced the alternatives, and flagged the rule it was bending.

### Trust over time

Autonomy expands per action type, based on the user's history of approving the agent's recommendation for that type. On trip 1 every irreversible action is a decision. After the user approves the agent's recommended hotel three times in a row without redirecting, the agent asks: "Next time, can I book hotels under $200 that match your preferences without asking?" The user says yes or no. Autonomy is offered, not taken.

Expanded autonomy never means less reporting. Every auto-action stays in the log with an undo path. A denial or redirect on an action type resets that type. Trust is earned slowly and lost fast, which is how people treat human assistants too. By trip 10 the brief for a routine trip is "Booked. $1,340 of $1,500. Nothing needs you," with the full log one tap away.

## AI tools used

- **Instinct**: the agent under supervision. All trip data comes from it.
- **Claude Code**: scaffolding, the normalizer, the UI, this write-up's first draft. Design decisions were mine; I used it to build faster and to argue with.

## Running it

```
npm install
npm run dev
```

To rebuild events from a new transcript:

```
npx tsx scripts/normalize.ts
```
