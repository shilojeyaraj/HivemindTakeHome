# What you need to do (the parts I cannot)

## Tonight, in Instinct

1. Card safety. Remove the real card or use a virtual card with a low limit. Tell Instinct in plain words: "Do not purchase anything without my approval. You may search, compare, and place free holds."
2. Seed preferences over a few messages: window seats, no red-eyes, direct preferred and worth about $100 extra, $1,500 hard cap, prefer a well-located hotel over a nicer one. Ask it to repeat back what it knows about you. Screenshot that.
3. Send the reporting format:

   When you work on my trip, message me updates as you go. Format every message as one of:
   UPDATE: what you did, no action needed
   DECISION: what you need me to choose, with each option, its price difference, the tradeoff, your recommendation, and any deadline
   AUTO: something you decided yourself, why, and how to undo it
   ERROR: anything that went wrong
   Start each message with the time in [10:42 PM] format.

4. Send the scenario, verbatim from the assessment, plus "message me every step, I will read it in the morning."
5. Go to sleep.

## Tomorrow morning

1. Copy the entire thread into `data/raw/instinct-transcript.txt`. Screenshots into `data/raw/screenshots/`.
2. Run `npx tsx scripts/normalize.ts`, then open `data/events.json` and fill in options, costDelta, deadline, spendDelta where the transcript gives them. Keep sourceEvidence verbatim.
3. Run `npm run dev` and look at it on your phone.
4. Pick one or two decisions, act on them in the UI, and paste the "Sent to agent" text into Instinct. Screenshot Instinct's reply. That is the working steering proof for the Loom.
5. Fill in the write-up sections in README.md from what actually happened.
6. Deploy to Vercel, record the Loom, email Maggie and Jason.

## Things only you know

- Confirm the final deadline from Maggie's reply and update CLAUDE.md.
- Whether you want to try a second agent for the stretch goal. Only if the Instinct run is solid first.
