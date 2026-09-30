# Write-up: the morning-after screen for an overnight trip agent

Shilo Jeyarajasingam, University of Waterloo. Hivemind Winter '27 co-op take-home, September 30, 2026.

- Working demo: https://hivemind-take-home.vercel.app
- Loom walkthrough: (link)
- Repo: https://github.com/shilojeyaraj/HivemindTakeHome

## 1. How it works

### The run

At 5:02 PM on September 29 I told Instinct, a chat-only personal agent that runs over iMessage, to book my reading week trip: Toronto to New York to Boston and back, October 10 to 18, under $1,500, window seats where possible. Before that I had given it my preferences (window seat, no red-eyes, direct worth about $100 extra, central and walkable over nice, budget is a hard cap) and one ground rule: search, compare, and hold, but never buy without my approval. I asked it to tag every message UPDATE, DECISION, AUTO, or ERROR with a timestamp. Then I stopped replying.

Instinct sent 12 messages in 81 minutes and went quiet, because every remaining step needed a purchase. Later that night I answered two of its decisions through this interface, and it sent 5 more messages, including one where the Boston room it had priced sold out. 17 messages total, all real, none edited.

### The screen

The interface is a single page, designed to be read on a phone in the first ninety seconds of being awake. Top to bottom, in the order the user needs it:

1. **Brief.** "Good morning." One sentence on when the agent worked and what it spent. One bold money line: projected trip total against the budget, labelled honestly as "approved, not booked" or "if you approve the agent's picks". Three counts: decisions needing you, problems, things decided alone. If the user trusts the agent, this is the whole morning.
2. **Needs you.** One card per unresolved decision, hard deadlines first, then soft urgency ("rooms are selling fast"), then newest. Each card shows the agent's tag and time, the question, then a "Bends your rules" block listing every way the options compromise what the user asked for, then the options as rows with totals in green or red against the budget and the agent's pick marked. The user can choose an option, deny all, or redirect with a sentence.
3. **You decided.** Resolved decisions with their relay status: sent, agent confirmed, done, or failed. The exact message sent to the agent is shown.
4. **Problems it hit.** Errors and unverified claims pulled out of the log so they cannot be skimmed past. Self-corrections link back to the message they fix.
5. **Decided on its own.** Reversible choices the agent made without asking, each stating what was chosen and that nothing was booked.
6. **The whole night.** Every message as a timeline rail: timestamp, the agent's tag, one line. Each expands to the summary, any rule warnings, links, and the agent's verbatim text.

A sticky bar at the top jumps to any section with its count.

### Steering

Instinct has no API, webhooks, or export. When the user acts on a decision, the interface composes the message to the agent, shows it on the card immediately, records the decision, and moves the card to "You decided" with the status "Sent to agent, waiting for it to confirm". The message is relayed to Instinct's chat by hand. When Instinct replies, the reply is added to the log and the status becomes "Agent confirmed".

This loop closed twice during the build. At 10:02 PM I chose option A in the interface; Instinct confirmed at 10:06 PM. At 10:13 PM I chose a replacement Boston room; Instinct confirmed at 10:43 PM. Both replies are in the log verbatim.

### Data

The transcript is in `data/raw/instinct-transcript.txt`. A normalizer splits it by tag and time into `data/events.json`. Structured fields (option totals, tradeoffs, rule warnings, which message a correction fixes) are hand-written in `data/enrichments.json` and merged on top. The agent's verbatim text is never edited, and the normalizer refuses enrichments that try. Nothing is fabricated.

## 2. Constraints hit, and how each was designed around

**Instinct is chat-only.** No API, no export. Steering is a relay by hand. Rather than hide this, the interface shows the exact message going back on every resolved card, which is what a user would want to see anyway. The relay status is a five-state machine (recorded, sent, acknowledged, applied, failed) so that a future agent with an API drops into the same UI.

**Instinct cannot hold fares, and its deadlines are not timestamps.** The first decision said "no deadline, nothing held". The second said "rooms are selling fast, Medford went in 5 hours". The event model has both a hard `deadline` and a soft `urgencyNote`. The card shows a countdown when there is a time and the agent's own words when there is not, and sorts hard deadlines above soft ones.

**Instinct finished in 81 minutes, not 8 hours.** "Overnight" really means "the user was not watching". The interface does not care how long the agent worked, only what it left behind. The brief says first and last message times rather than pretending it ran all night.

**Instinct buried a decision inside an UPDATE.** At 5:05 PM it priced a later return flight (+$122) and reported it as information, never as a choice, even though I had said I prefer later departures. The interface attaches a "Bends your rules" warning to that update. This is the strongest argument in the project for the interface, not the agent, deciding what needs the user.

**Instinct bent my rules to fit the budget.** The only way under $1,500 was a room in Newark, NJ, 50 minutes from Manhattan. Instinct said so, honestly but 200 words into a message. The "Bends your rules" block pulls that out and puts it above the options.

**Instinct got a commute time wrong, then corrected itself** 43 minutes later. Corrections are tagged CORRECTION rather than ERROR and link back to the message they fix, so the user sees both the fixed version and the fact that the agent was wrong first.

**Instinct got blocked by Amtrak's bot check** and switched to buses without asking. Reasonable fallback, listed under problems so the user knows a train was never priced.

**The Boston room sold out after I approved the trip.** Instinct did not substitute a room. It re-verified everything else, reported the change as an ERROR, and queued a new DECISION with three replacements and full trip totals. The interface shows this as a correction to the original decision plus a new card sorted first by urgency.

**No card was ever on file.** The scenario says the agent has the user's card. Instinct did not, and asked how to pay only after approval. Its default, per-purchase approval from the phone with single-use cards, is stricter than the scenario assumes. Recorded as a corrected assumption below.

**Vercel's filesystem is read-only.** Decisions made on the deployed demo cannot be written to the shared log. The client keeps them in browser storage, so the screen updates instantly and survives a refresh, and the server call is confirmation rather than permission.

## 3. Assumptions

- The user checks the interface once, on a phone, with about 90 seconds of attention. Everything is ordered by what they need first.
- I assumed the agent had a card on file, as the scenario says. It did not. So the "never buy without approval" rule was never tested against a live card. Instinct's own payment flow turned out to be stricter than mine.
- All amounts are CAD, because Instinct reported in CAD without being asked.
- One agent. The event model has fields for cross-checking multiple agents (`crossCheck`), but the comparison view is not built. One solid agent with real data was worth more than two half-connected ones in the time available.
- Reversibility is the right axis for autonomy, not dollar amount. Argued below.
- The interface owns the "needs you" classification. The agent's tags are the input, not the verdict. Two of the three most important moments in this run were things the agent tagged as information.

## 4. The sleeping-user scenario

### 4.1 What can the agent decide alone overnight, and what must wait?

The agent may act alone when the action is **reversible, inside the rules the user stated, and cheap to undo.** Everything else waits, and the interface names the rule it would break.

Alone: search, compare, shortlist, place free holds, choose how to split nights between cities, pick the cheaper of two nearly identical options and say why. In this run Instinct did exactly these: the 4/4 night split at 5:06 PM and the FlixBus at 5:17 PM. Both appear under "Decided on its own", each marked reversible, each with a redirect path.

Waits: any purchase, anything non-refundable, anything that breaks a stated rule (over budget, no window seat, a room 50 minutes from the city when the user said central), and anything the user never priced. This run produced four of those. The Newark room bent "central and walkable". Option A gave up the window seat. The replacement Boston room came after the first one sold out. Payment needed the user's card. Instinct queued all four as decisions instead of taking them.

**Why reversibility and not a dollar threshold?** Because the cost of a wrong hold is zero and the cost of a wrong purchase is real money and a bad trip. A $50 threshold would have let the agent book the $24 bus at 5:17 PM, which is cheap but not what I asked for. Reversibility also matches how people delegate to each other: "look into it and come back to me" is a different grant from "just do it". Budget and preferences are the user's rules, and the agent does not get to reinterpret them at 3 AM. This run showed why: the only way under $1,500 was a room 50 minutes from the city, and the right move was to ask.

There is a third category between notify and review that the run surfaced: **questions** the agent cannot guess the answer to, like "how do you want to pay?" These can never be auto-resolved, no matter how much trust exists. The interface treats them as decision cards without money on the options.

### 4.2 It is 3 AM, and the only routing under budget has a 6-hour layover

The agent should:

1. Hold the layover routing if a free hold exists, so the price does not move while the user sleeps.
2. Not book it. A 6-hour layover is a quality tradeoff the user never priced. "Under $1,500" was a constraint, not permission to accept anything under $1,500.
3. Find the best over-budget direct routing and price the gap, so the user chooses between two real options rather than approving one in the dark.
4. Queue one decision: "Under budget with a 6 h layover in X, or direct for $N more and $M over your cap." Recommendation stated. The hold's expiry as a hard deadline.

**In the morning,** that card is first in "Needs you" because it has the soonest deadline. The chip shows "Expires in 2 h" as a live countdown. If the hold died while the user slept, the chip says "Expired 3 h ago" and the card says what the agent does on approval, which is re-search at today's prices. Both options show their total in green or red against the budget. The "Bends your rules" block above the options says "6-hour layover, you asked for direct" so the user reads the catch before the price. The agent's reasoning and its exact words are one tap away.

This run had the same shape twice. At 5:38 PM the only way under budget was a Newark room. At 10:10 PM the Boston room sold out and every replacement was 38 to 49 minutes out. Instinct did not book either. It priced alternatives, named the rule it was bending, and waited. Its "deadline" was "rooms are selling fast", which is why the card shows the agent's own words when there is no timestamp.

### 4.3 Trip 1 versus trip 10: how does the agent earn autonomy?

**Per action type, from the user's record of approving the agent's recommendation for that type, and always offered rather than taken.**

Trip 1 is this one. Every irreversible action is a decision. The agent recommends, the user approves, and the interface keeps the two separate: "approved, not booked" is its own number in the brief, because approved is not the same as spent.

After the user approves the agent's recommended hotel three times in a row without redirecting, the agent asks: "Next time, can I book hotels under $200 that match your preferences without asking?" The user says yes or no. That becomes a new rule, specific to hotels under $200 matching preferences. It does not spill into flights. If a later booking would break that rule, it shows in the same "Bends your rules" block as any other rule.

A denial or redirect on an action type resets that type. Trust is earned slowly and lost fast, which is how people treat human assistants, and it should be visible: the interface would show "Books hotels under $200 without asking, since trip 4" next to the brief, with a one-tap revoke.

Expanded autonomy never means less reporting. On trip 10 every auto-booking still appears under "Decided on its own", with what was chosen, what was rejected, why, and how to undo it. The difference is that the brief for a routine trip reads "Booked. $1,340 of $1,500. Nothing needs you," and the log is one tap away instead of the whole screen.

Two things never become autonomous: questions the agent cannot guess (payment, login, an unstated preference), and anything that breaks a rule the user has stated. Trust changes the size of the reviews the agent can self-approve. It does not change the rules.

## 5. Trust, delegation, and feeling in control

Delegation works when the person can predict what the delegate will do alone, see what it did, and cheaply correct it. Three things follow, and the interface is built around them in this order.

**Nothing the agent did is hidden.** Every message it sent is in the log. Auto-actions and problems are tagged in colour so they cannot be skimmed past. Every summary expands to the agent's exact words, so if the summary is wrong, the user can see that too. The self-correction at 6:21 PM stays in the log as a correction that links to the message it fixes. An agent that quietly edited its earlier claim would feel less trustworthy than one that says "I was wrong about the Red Line."

**The user's rules are the frame for everything the agent shows them.** "Bends your rules" is the most important element on the page. It turns the agent's honest-but-buried disclosure into the first thing the user reads on a decision. Control is not about approving each click. It is about knowing, before choosing, exactly where the agent had to compromise on what was asked.

**Approving is cheap, and the user can always say something else.** Choose, deny, or type a sentence. The message that goes back to the agent is shown, not hidden behind a spinner, so the user knows what they said. Latency is shown as state, never as a blank screen: "Sent to agent, waiting for it to confirm", then "Agent confirmed" with the agent's reply in the log.

The agent's job overnight is to move the trip as far as it can without crossing the line, and to leave the morning screen so clear that the person's first ninety seconds are spent deciding, not investigating.

## 6. AI tools used

- **Instinct**: the agent under supervision. All trip data comes from it.
- **Claude Code**: scaffolding, the normalizer, the UI, and first drafts of this write-up. The design decisions were mine; I used it to build faster and to argue with.

## Further reading in the repo

- [DESIGN.md](DESIGN.md): the design doc, screen by screen, with what the run taught us.
- [LATENCY.md](LATENCY.md): where latency lives and how each kind is handled.
- [THEME.md](THEME.md): visual choices, tokens, and what was tried and dropped.
- [LOOM-SCRIPT.md](LOOM-SCRIPT.md): the walkthrough script.
