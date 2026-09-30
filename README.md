# Overnight Trip Agent: the morning-after screen

A supervision interface for a persistent AI agent that planned a multi-city trip while its user was away. Built for the Hivemind Winter '27 co-op take-home.

- Demo: https://hivemind-take-home.vercel.app
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

After a decision is made it moves to a "You decided" section with its relay status, so the user can see what they told the agent and whether it has confirmed. The deployed demo ships with my two real decisions already confirmed and the payment question still open, so you can act on that one yourself. Choices made in the browser update the screen instantly and persist in that browser; Vercel's filesystem is read-only, so they do not reach the shared log.

This loop closed during the build. At 10:02 PM I chose option A in the interface. I pasted the message it composed into Instinct's chat. At 10:06 PM Instinct replied:

> [10:06 PM] UPDATE: Going with A. I'll re-check each price first. If everything still matches and the total stays under $1,500, I book. If anything moved, you get a DECISION before I spend a cent.

That reply is event 13 in the log, and the decision card now reads "Agent confirmed". Four minutes of latency, one manual paste, and the agent changed what it was doing because of a click in this interface.

Then it got better. At 10:10 PM Instinct reported that the Boston room had sold out in the four hours since it priced the trip. It did not pick a replacement on its own. It re-verified everything else, queued a new decision with three rooms and their trip totals, and flagged the urgency: "rooms are selling fast, Medford went in 5 hours." At 10:11 PM it asked how I wanted to pay, because no card was saved. Both are live decision cards in the demo, with the room decision sorted first because of the urgency.

The loop closed a second time. I chose Winthrop in the interface at 10:13 PM and relayed it. At 10:43 PM Instinct confirmed: "Winthrop is locked in (trip total ~CA$1,463)." The brief now shows "Approved, not booked: $1,463, $37 under", because approved is not the same as bought, and the interface keeps those separate.

### Data

Every event in `data/events.json` comes from the real transcript in `data/raw/instinct-transcript.txt`. The normalizer in `scripts/normalize.ts` does the mechanical split by tag and time. Structured fields like option totals, tradeoffs, and rule warnings are hand-written in `data/enrichments.json` and merged on top. The agent's verbatim text is never edited, and the normalizer refuses enrichments that try. Nothing is fabricated.

## Constraints hit, and what I did about each

- **Instinct is chat-only.** No API, no export. Data is a pasted transcript, steering is a relay. I made the relay visible instead of hiding it: the card shows the exact message going back, which is what a user would want to see anyway.
- **Instinct cannot hold fares, and its deadlines are vibes.** The first decision came with "no deadline, nothing held". The second came with "rooms are selling fast". Neither is a timestamp. The card shows a hard deadline as a countdown when there is one, the agent's own words when there is not, and sorts hard deadlines above soft ones.
- **Instinct finished in 81 minutes, not 8 hours.** "Overnight" really means "the user was not watching". The interface does not care how long the agent worked, only what it left behind.
- **It buried a decision inside an UPDATE.** At 5:05 PM it priced a later return flight (+$122) and reported it as information, never as a choice, even though I said I prefer later departures. The interface attaches a rule warning to that update. This is the strongest argument in this project for the interface deciding what needs the user, not the agent.
- **It bent my rules to fit the budget** by picking a room in Newark, NJ, 50 minutes from Manhattan, and said so honestly in the middle of a long message. The interface pulls that out into the "Bends your rules" block at the top of the decision, above the options.
- **It got a commute time wrong, then corrected itself** 43 minutes later. Corrections link back to the message they fix, so I see both the fix and the fact that the agent was wrong first.
- **It got blocked by Amtrak's bot check** and switched to a bus without asking. Reasonable fallback, listed under problems so I know a train was never priced.

## Assumptions

- The user checks the interface once, on a phone, with about 90 seconds of attention.
- I assumed the agent had a card on file, as the scenario says. It did not. Instinct only asked about payment at 10:11 PM, after I approved the trip. So the "never buy without approval" rule was never tested against a live card, and Instinct's own default, per-purchase approval from the phone, is stricter than the scenario's.
- All amounts are CAD, because Instinct reported in CAD without being asked.
- One agent. The event model has fields for cross-checking multiple agents, but the comparison view is not built. One solid agent with real data was worth more than two half-connected ones in the time available.

## The three questions

### 1. What can the agent decide alone overnight, and what waits?

The agent may act alone when the action is **reversible, inside the rules I stated, and cheap to undo.** Everything else waits, and the interface says which rule it would break.

Alone: search, compare, shortlist, place free holds, choose how to split nights between cities, pick the cheapest of two nearly identical options and say why. All of these cost nothing to reverse. In this run Instinct did exactly these: the 4/4 night split at 5:06 PM, the FlixBus at 5:17 PM. Both show up under "Decided on its own", each marked reversible, each with a redirect path.

Waits: any purchase, anything non-refundable, anything that breaks a stated rule (over budget, no window seat, a room 50 minutes from the city when I said central), and anything the user never priced. This run produced three of those. The Newark room bent "central and walkable". Option A gave up the window seat. The replacement Boston room came after the first one sold out. Instinct queued all three as decisions instead of taking them, which is the boundary holding.

Why reversibility and not, say, a dollar threshold? Because the cost of a wrong hold is zero and the cost of a wrong purchase is real money and a bad trip. A dollar threshold would have let the agent book a $23 bus at 5:17 PM, which is cheap but not what I asked for. Reversibility also matches how people delegate to each other: "look into it and come back to me" is a different grant than "just do it".

### 2. It is 3 AM, and the only routing under budget has a 6 hour layover

The agent should:

1. Hold it, if a free hold exists, so the price does not move while I sleep.
2. Not book it. A 6 hour layover is a quality tradeoff I never priced. "Under $1,500" was a constraint, not permission to accept anything under $1,500.
3. Find the best over-budget direct routing and price the gap, so I am choosing between two real options rather than approving one in the dark.
4. Queue one decision: "Under budget with a 6 h layover in X, or direct for $N more and $M over your cap." Its recommendation stated. The hold's expiry as a hard deadline.

In the morning that card is first in "Needs you" because it has the soonest deadline. The chip shows "Expires in 2 h" as a live countdown. If the hold died while I slept, the chip says "Expired 3 h ago" and the card says what the agent does on approval, which is re-search at today's prices. Both options show their total in green or red against the budget. The "Bends your rules" block above the options says "6 hour layover, you asked for direct" so I read the catch before I read the price.

This run had the same shape twice. At 5:38 PM the only way under budget was a Newark room, and at 10:10 PM the Boston room sold out and the replacements were all 38 to 49 minutes out. Instinct did not book either. It priced the alternatives, named the rule it was bending, and waited. Its "deadline" was "rooms are selling fast" with no time attached, which is why the card shows the agent's own words when there is no timestamp, and sorts soft urgency below hard deadlines.

### 3. Trip 1 versus trip 10: how does the agent earn autonomy?

Per action type, based on my record of approving its recommendation for that type, and always offered rather than taken.

Trip 1 is this one. Every irreversible action is a decision. The agent recommends, I approve, and the interface keeps the two separate: "Approved, not booked" is its own number in the brief, because approved is not the same as spent.

After I approve the agent's recommended hotel three times in a row without redirecting, it asks: "Next time, can I book hotels under $200 that match your preferences without asking?" I say yes or no. That is a new rule, and it shows up in the same "Bends your rules" block if a later booking would break it. The grant is specific: hotels, under $200, matching preferences. It does not spill into flights.

A denial or redirect on an action type resets that type. Trust is earned slowly and lost fast, which is how people treat human assistants, and it should be visible: the interface would show "Books hotels under $200 without asking, since trip 4" next to the brief, with a one-tap revoke.

Expanded autonomy never means less reporting. On trip 10 every auto-booking still appears under "Decided on its own", with what was chosen, what was rejected, why, and how to undo it. The difference is that the brief for a routine trip reads "Booked. $1,340 of $1,500. Nothing needs you," and the log is one tap away instead of the whole screen.

## What a person needs to feel in control

Three things, and the interface is built around them in this order.

**Nothing the agent did is hidden.** Every message it sent is in the log. Auto-actions and problems are pulled out and colored so they cannot be skimmed past. Every summary expands to the agent's exact words, so if the summary is wrong, I can see that too. The self-correction at 6:21 PM stays in the log as a correction that links to the message it fixes. An agent that quietly edited its earlier claim would feel less trustworthy than one that says "I was wrong about the Red Line."

**The rules I set are the frame for everything the agent shows me.** "Bends your rules" is the most important element on the page. It turns the agent's honest-but-buried disclosure ("that bends your central rule, so say if it's a dealbreaker", 200 words into a message) into the first thing I read on a decision. Control is not about approving each click. It is about knowing, before I choose, exactly where the agent had to compromise on what I asked for.

**Approving is cheap, and I can always say something else.** Choose, deny, or type a sentence. The message that goes back to the agent is shown, not hidden behind a spinner, so I know what I said. Latency is visible as state ("Sent to agent, waiting for it to confirm", then "Agent confirmed" with the agent's reply in the log), never as a blank screen.

Delegation works when the person can predict what the delegate will do alone, see what it did, and cheaply correct it. The agent's job overnight is to move the trip as far as it can without crossing the line, and to leave the morning screen so clear that the person's first 90 seconds are spent deciding, not investigating.

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
