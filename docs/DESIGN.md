# Design doc

What we are building, why each piece exists, and the current answers to the three write-up questions. This is a working document. Update it as the overnight run changes our minds.

## The problem in one line

A person wakes up, picks up their phone, and has about ninety seconds of attention. In that time they need to know whether the trip is on track, what is about to expire, and whether the agent did anything they would not have done.

## Priorities, in order

1. **Nothing the agent did alone is hidden.** Auto-actions and errors are always visible, colored, and reversible where possible.
2. **Decisions come before information.** Anything that needs the user is above anything that does not.
3. **Urgency sorts the queue.** Expiring fares first, then newest.
4. **Every claim links to evidence.** Each event carries the verbatim agent message it came from. If the agent said something dumb, the user can see exactly what it said.
5. **Waiting looks like progress.** After the user acts, the card shows the decision being recorded and the message being sent. It never goes blank.

## Screens

### Brief
Four numbers: spent or held, decisions waiting, decided alone, problems. Plus a one-line warning if approving every recommended option would break the budget. This is the whole morning for a user who trusts the agent.

### Needs you
One card per unresolved decision. Options are rows with label, price delta, tradeoff, and the agent's pick marked. Three ways out: choose an option, deny all, or redirect with free text. A deadline chip shows time left, or "expired" if the user slept through it.

### Check these
Errors and irreversible auto-actions, pulled out of the log so they are not buried under routine updates. Shown only when there is something in it.

### Overnight log
Everything, chronological. Same cards as the timeline, with reasoning and raw text behind a disclosure.

## Event model

See `src/lib/types.ts`. The important fields:

- `kind`: update, decision, auto_action, error. This is the whole "FYI vs needs you" split.
- `options[]` with `costDelta` and `tradeoff`: decisions are always framed as money and a consequence, not prose.
- `deadline`: drives urgency sorting and the expiry chip.
- `autoResolved.reversible` and `undoBy`: the difference between "the agent held a fare" and "the agent bought a non-refundable ticket".
- `sourceEvidence`: verbatim agent text. Never edited.
- `spendDelta`: what this event committed, summed into the brief.

## Steering

Instinct exposes no API. The steering path is:

1. User acts on a card.
2. POST /api/steer records a SteeringAction and composes a short message addressed to the decision by title.
3. The card shows that message as "Sent to agent".
4. The message is relayed to Instinct's chat.

With an agent that had an API, step 4 would be an HTTP call and `relayStatus` would move from pending to acknowledged automatically. The UI already has that field. Everything above it stays the same.

## The three questions (current draft)

### 1. Autonomy boundary

The agent may act alone when the action is **reversible, inside the stated rules, and cheap to undo**. Concretely:

- Search, compare, shortlist: always.
- Hold a fare or a refundable room: always, and report it as an auto-action.
- Book something non-refundable under budget that matches every stated preference: only after trust has been earned (see question 3). On trip 1, never.
- Anything that breaks a stated rule (over budget, no window seat, red-eye when the user said no red-eyes): never. Queue it as a decision with the rule it breaks named.
- Anything that spends more than a small threshold irreversibly: never.

The boundary sits at reversibility because the cost of a wrong hold is zero and the cost of a wrong purchase is real money and a bad trip. Budget and preferences are the user's rules; the agent does not get to reinterpret them at 3 AM.

### 2. The 3 AM layover

The only routing under budget has a six-hour layover. The agent should:

1. Hold it if a free hold exists, so the price does not move.
2. Not book it. A six-hour layover is a quality tradeoff the user never priced, so it is outside the rules.
3. Also find the best over-budget direct option and price the difference.
4. Queue a decision: "Under budget with a 6 h layover in X, or direct for +$N and $M over budget." Recommendation stated. Deadline shown if the hold expires.

In the morning the card is at the top of "Needs you" because it has a deadline. The user sees the two options, the exact dollar gap, and the agent's reasoning for not booking. If the hold expired while they slept, the chip says so and the card says what the agent will do next (re-search on approval).

### 3. Trust over time

Autonomy expands per action type, based on the user's history of approving the agent's recommendation for that type.

- Trip 1: everything irreversible is a decision. The agent recommends, the user approves.
- After the user has approved the agent's recommended option for, say, three hotel bookings in a row without redirecting, the agent proposes: "Next time, can I book hotels under $200 that match your preferences without asking?" The user says yes or no. Autonomy is offered, not taken.
- Every auto-action stays visible in the log with an undo path. Expanded autonomy never means less reporting.
- A denial or redirect on an action type resets that type. Trust is earned slowly and lost fast, which is how people treat human assistants too.

By trip 10 the morning brief for a routine trip is "Booked. $1,340 of $1,500. Nothing needs you." with the full log one tap away.

## What actually happened (run of Sept 29, 5:02 PM to 6:23 PM)

Twelve messages in 81 minutes, then silence because every remaining step needed a purchase. Observations that shaped the interface:

- **The agent bought nothing and held nothing.** Correct under the rules we gave it, but it means the morning brief shows $0 spent and one big decision, not a half-booked trip. The brief now leads with "If you approve" projected total, because that is the number that matters when nothing is committed yet.
- **It bent the "central and walkable" rule to fit the budget** by picking a Newark, NJ room, and said so. The interface flags this as "Bends your rules" on the decision card, above the options, so the user reads it before choosing.
- **It buried a tradeoff inside an UPDATE.** The 9:40 AM versus 12:45 PM return (+$122) was reported as information at 5:05 PM, and never became a DECISION, even though the user said they prefer later departures. The update carries a rule warning so it is not lost, and this is the strongest argument in the write-up for the interface, not the agent, deciding what needs the user.
- **It corrected itself.** At 6:21 PM it retracted an unverified "15 min on the Red Line" claim and verified real commute times at 6:23 PM (30 min Boston, 50 min Newark). Corrections link back to the message they fix, so the user sees the fixed version and the fact that the agent got it wrong first.
- **It got blocked by Amtrak's bot check** and fell back to a bus without asking. Reported as an ERROR, listed under "Problems it hit". Reasonable fallback, but the user should know a train was never priced.
- **Both hostels were sold out**, which is why the budget got tight. Routine UPDATEs, but they explain the decision, so they stay in the log.
- **It reported in CAD without being told.** All amounts in the interface are CAD.
- **The Google Flights link preview said "Trip from Birmingham to anywhere".** A generic share card, not a wrong search, but on a phone it looks like a mistake. Links are shown as "Open on google.com" next to the agent's own words rather than as previews.

### Second act (10:02 PM to 10:11 PM, after the user chose option A in the interface)

- **Steering worked.** The relay message was pasted into Instinct at 10:02 PM. Instinct acknowledged at 10:06 PM and said it would re-check prices before booking.
- **The Boston room had sold out.** Instinct reported it as an ERROR, re-verified the other three components, and queued a DECISION with three replacement rooms and full trip totals. It did not substitute on its own. This is the cleanest real example in the run of the autonomy boundary holding under pressure.
- **Soft urgency.** "Rooms are selling fast (Medford went in 5 hours)" is a deadline without a time. Added `urgencyNote` to the event model, shown in the chip and sorted above decisions with no urgency but below hard deadlines.
- **No card was ever saved.** The scenario says the agent has a card on file. Instinct did not, and asked how to pay only after approval. Its default, per-purchase phone approval with single-use cards, is stricter than what the assessment assumes. Recorded as a corrected assumption.
- **The payment decision touches credentials.** The interface presents the choice but the card and Airbnb login go through Instinct's secure link, never through chat or this page. The card carries a warning saying exactly that.

## Constraints hit so far

- Instinct is chat-only, no API or export. Steering is a relay. Data is a pasted transcript, normalized by `scripts/normalize.ts` with hand-written enrichments in `data/enrichments.json`. Source text is never edited.
- Instinct cannot hold fares. Its options came with "deadline: none held", so the urgency sort had nothing to sort. The UI shows "Nothing held" on the card instead of hiding the chip.
- Instinct finished in 81 minutes. "Overnight" was really "the user was away". The interface does not care how long the agent worked, only what it left behind.

## Open questions

- Will Instinct follow the UPDATE/DECISION/AUTO/ERROR format, or reply in one burst?
- Does Instinct offer free fare holds, or will it need to be told to skip booking entirely?
- If a second agent is added, the cross-check field on events is ready but the comparison view is not built.
