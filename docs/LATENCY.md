# Latency: where it is, what was cut, and how the rest is shown

There are three kinds of latency in this product, and they need different answers.

| Kind | Where it lives | Typical size | Answer |
| --- | --- | --- | --- |
| Page load | Server reading the event log and rendering | Tens of milliseconds | Make it not exist: server-render complete HTML from local JSON |
| Acting on a decision | Client to server round trip | 100 to 500 ms | Make it invisible: update the screen before the server replies |
| The agent responding | Instinct reading a chat message and working | Minutes | Cannot be cut. Show it honestly as state, never as a spinner |

## 1. Page load: render complete on first paint

The event log is a JSON file next to the code. There is no database, no fetch, no client-side data loading.

- `src/app/page.tsx` reads `data/events.json` and `data/steering-log.json` on the server and renders the full page as HTML. The first byte the browser gets already contains every decision, every problem, and the whole log.
- Next.js file tracing is told to include `data/**/*.json` in the serverless bundle (`next.config.ts`), so the Vercel deploy has the same data on disk and does not fall back to an empty page.
- `loading.tsx` exists as a skeleton in the same shape as the page, but on a normal load it never appears, because there is nothing to wait for. It is there for the case where a cold serverless start is slow, so the user sees the page's silhouette instead of white.
- Fonts are self-hosted through `next/font` and preloaded, so the serif headline does not flash from a fallback.
- The full log is 17 entries collapsed to one line each. Expanded content is in the HTML already, hidden behind native `<details>`, so opening an entry is instant and needs no JavaScript.

Measured from a cold curl of the live deploy: about 0.5 s total for 80 KB of HTML, most of which is the raw agent text embedded for the disclosure blocks.

## 2. Acting on a decision: optimistic, deterministic, local

When the user taps Choose, Redirect, or Deny all, three things need to happen: the card moves to "You decided", the counts and projected total change, and the message that goes to the agent appears. All three happen before any network call.

- **The relay message is deterministic.** `composeRelay()` in `src/lib/brief.ts` builds the exact text from the event and the option. The client runs the same function the server does, so the text on screen is the text that gets sent. There is nothing to wait for.
- **The whole morning view is one client component** (`src/components/Morning.tsx`) holding the steering state. A decision is written to that state first, so the brief, the queue, and the "You decided" section re-render together in one frame.
- **The server call is confirmation, not permission.** The POST to `/api/steer` fires after the screen has updated. If it fails, the record stays and the message is still shown for manual relay. Nothing rolls back, because the user's intent is the source of truth and the relay is by hand anyway.
- **State survives a reload without the server.** Decisions are kept in the browser through a small `useSyncExternalStore` wrapper over localStorage. On Vercel, where the filesystem is read-only and `/api/steer` cannot persist, this is what makes a choice still be there after refresh. It is read once per render with a cached parse, so there is no flicker between server HTML and client state.
- **No layout shift on action.** The decision card and the "You decided" entry are the same width and padding, so the page does not jump when one becomes the other. A 180 ms fade-and-rise on the new entry is the only motion, and it is disabled under `prefers-reduced-motion`.

## 3. The agent: minutes, shown as state

Instinct has no API. A decision becomes a chat message, and the reply comes back minutes later in the transcript. In this run the two real round trips took 4 minutes and 30 minutes.

That cannot be hidden, so it is shown as a state machine on each decision:

| State | Label on the card | Set by |
| --- | --- | --- |
| pending | Recorded, not yet sent | Never on the happy path; only if the client could not compose |
| sent | Sent to agent, waiting for it to confirm | The moment the user acts |
| acknowledged | Agent confirmed | When the agent's reply is added to the log |
| applied | Done by agent | When the agent reports the action complete |
| failed | Agent could not do this | When the agent says no or errors |

The rule from the research that shaped this: be optimistic about the receipt, pessimistic about the outcome. "Sent, waiting to confirm" is instant and honest. "Booked" only appears when the agent says so.

## What was deliberately not done

- **No polling or streaming.** The agent's replies arrive through a transcript paste, not a socket. Building a live channel would have been fake latency work on top of a manual relay.
- **No skeleton for data that is already there.** The research made this point directly, and it is right. Skeletons on a server-rendered page only add a flash.
- **No spinners.** Every waiting state has words: what was sent, when, and what happens next.
