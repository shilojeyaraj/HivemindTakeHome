# Overnight Trip Agent: the morning-after screen

A supervision interface for a persistent AI agent that planned a multi-city trip while its user was away. Built for the Hivemind Winter '27 co-op take-home.

- **Working demo:** https://hivemind-take-home.vercel.app
- **Loom walkthrough:** https://www.loom.com/share/1ebc729b14af44ccb9f6bbfce3a24399
- **Full write-up:** [docs/WRITEUP.md](docs/WRITEUP.md)

## Documentation map

| Document | What it answers |
| --- | --- |
| [docs/WRITEUP.md](docs/WRITEUP.md) | The submission write-up. How it works, every constraint hit and the design around it, assumptions, the three sleeping-user questions in full, and the trust and delegation reasoning. Start here. |
| [docs/DESIGN.md](docs/DESIGN.md) | The design doc. Priorities, each screen and why it exists, the event model, the notify / question / review taxonomy, and what the overnight run taught us. |
| [docs/LATENCY.md](docs/LATENCY.md) | Where latency lives, what was cut, and how the agent's minutes are shown as state instead of spinners. |
| [docs/THEME.md](docs/THEME.md) | Visual choices: what was taken from incident.io, the colour tokens and what each may mean, type, layout order, mobile, and what was tried and dropped. |
| [docs/LOOM-SCRIPT.md](docs/LOOM-SCRIPT.md) | The three-minute walkthrough script with navigation cues. |
| [docs/YOUR-CHECKLIST.md](docs/YOUR-CHECKLIST.md) | The operator's checklist used to run the agent and collect the data. |
| [data/raw/instinct-transcript.txt](data/raw/instinct-transcript.txt) | The raw Instinct transcript. Every event in the demo comes from here. |
| [data/enrichments.json](data/enrichments.json) | The hand-written structure layered on the transcript: option totals, tradeoffs, rule warnings. |

## What it does

At 5:02 PM on September 29 I told Instinct, a chat-only personal agent, to book my reading week trip: Toronto to New York to Boston, October 10 to 18, under $1,500, window seats where possible. I told it never to buy without my approval, then stopped replying. It sent 17 messages. This interface is what I see when I come back.

Top to bottom: a brief with one money line and three counts; the decisions that need me, most urgent first, each with a "Bends your rules" block above the options; the decisions I already made and whether the agent confirmed them; the problems it hit; what it decided alone; and the whole night as a timeline that expands to the agent's exact words. A sticky bar jumps to any section.

Instinct has no API, so a decision becomes a chat message. The interface composes it, shows it, and tracks the reply. This loop closed twice during the build, with Instinct's confirmations in the log verbatim.

All data is real. Nothing is fabricated. The transcript is in the repo and the normalizer refuses to edit the agent's words.

## The three questions, in short

Full answers with evidence from the run are in [docs/WRITEUP.md, section 4](docs/WRITEUP.md#4-the-sleeping-user-scenario).

**What can the agent decide alone overnight?** Anything reversible, inside the rules I stated, and cheap to undo: search, compare, hold, split nights between cities, pick the cheaper of two near-identical options. Anything else waits, and the interface names the rule it would break. The boundary is reversibility, not dollars, because a wrong hold costs nothing and a wrong purchase costs real money and a bad trip. In this run Instinct held to it: it split the nights and picked a bus alone, and queued the Newark room, the seat tradeoff, the replacement room, and payment as decisions.

**The 3 AM layover.** Hold it if a free hold exists, do not book it, price the best over-budget direct option too, and queue one decision with both totals, the recommendation, and the hold's expiry as a hard deadline. In the morning that card is first because it has the soonest deadline, with a live countdown or "expired 3 h ago", the layover named in "Bends your rules" above the options, and the agent's exact words one tap away. This run had the same shape twice, with a Newark room and a sold-out Boston room, and Instinct asked both times.

**Trip 1 versus trip 10.** Autonomy grows per action type from my record of approving the agent's pick for that type, and it is offered, not taken. After three approved hotel picks, the agent asks "can I book hotels under $200 that match your preferences without asking?" and I say yes or no. A denial resets that type. Every auto-booking still appears in the log with an undo path. Questions the agent cannot guess, like payment, and anything that breaks a stated rule never become autonomous. By trip 10 the brief for a routine trip is "Booked. $1,340 of $1,500. Nothing needs you."

**What a person needs to feel in control.** Nothing the agent did is hidden. The user's rules are the frame for every choice. Approving is cheap and redirecting is one sentence. See [docs/WRITEUP.md, section 5](docs/WRITEUP.md#5-trust-delegation-and-feeling-in-control).

## Running it

```
npm install
npm run dev
```

To rebuild events from a new transcript:

```
npx tsx scripts/normalize.ts
```

## AI tools used

- **Instinct**: the agent under supervision. All trip data comes from it.
- **Claude Code**: scaffolding, the normalizer, the UI, and first drafts of the write-up. The design decisions were mine.
