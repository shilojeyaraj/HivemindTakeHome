# Design choices and theming

The screen is read once, on a phone, in the first ninety seconds of being awake, by someone deciding whether to trust what happened without them. Every choice below follows from that.

## Reference

The visual language is borrowed from incident.io, which solves a close cousin of this problem: a person arriving at a situation that unfolded without them, needing to know what is on fire and what is handled. What was taken from it:

| incident.io | Here |
| --- | --- |
| White page, near-black text, no shadows | Same. Cards are a 1px line and a 4px radius, nothing else |
| One vivid orange, used only on the primary action | Orange only on the recommended option's button, the urgency chip, and the "needs you" count |
| Cream secondary surfaces and buttons | Every non-primary button and every raw-text block is cream |
| Deep maroon for severity | Problems, corrections, and "Bends your rules" |
| Editorial serif display headings over a plain sans | Instrument Serif for the greeting and section titles, Geist for everything else |
| Pill buttons, mono severity tags like SEV0 | Pill buttons. The agent's own tags, UPDATE, DECISION, AUTO, ERROR, CORRECTION, in mono pills |
| Warm peach wash behind the hero | A faint warm gradient behind the top of the page, fading to white |

## Tokens

All colour lives in `src/app/globals.css` as CSS variables mapped to Tailwind utilities through `@theme inline`. Components never use raw hex or default Tailwind greys.

| Token | Light | Use |
| --- | --- | --- |
| `bg`, `surface` | white | page and cards |
| `cream`, `cream-2` | #f8f5f0, #f1ebe2 | secondary buttons, raw text, hover |
| `ink`, `ink-2`, `muted` | #161618, #4b4b50, #7d7d84 | three levels of text |
| `line`, `line-strong` | #e8e6e1, ink | borders; strong marks the recommended option |
| `orange`, `orange-soft` | #f25533, #fdece7 | the one attention colour |
| `maroon`, `maroon-soft` | #5a0a17, #f7e9ec | problems and rule warnings |
| `ok`, `ok-soft` | #1d7a4b, #e7f4ec | fits budget, agent confirmed |

Light is the default for everyone regardless of system setting, because the reference is light-first and the Loom and evaluators should see one thing. A dark set of the same tokens exists under `html[data-theme="dark"]` as an opt-in; nothing turns it on.

## Type

- **Instrument Serif** for "Good morning." and section titles only. It is the one decorative choice, and it makes the page read as a morning note rather than an admin panel.
- **Geist** for body, at 14 to 15px. Three text colours do the hierarchy; weights stay at regular and medium.
- **Geist Mono** for timestamps, agent tags, money in option rows, and raw agent text. Mono marks "this is data, not prose".
- Tabular numerals everywhere money or time appears, so columns line up in the log and the brief.

## Layout, top to bottom

The order is the order of need.

1. **Header.** Trip name, route, agent, currency. One line on desktop, three short lines on a phone.
2. **Jump bar** (phone only, sticky). Needs you, Problems, Decided alone, Log, with counts. Orange or maroon when non-zero.
3. **Brief.** Serif greeting, one sentence, one bold money line, then three figures separated by hairlines rather than boxed. The money line is the only large number on the page. The research's advice was one bold element, not five, and this is it.
4. **Needs you.** Full cards, because these are the things to act on. Deadline or urgency chip first, then the title in serif, then "Bends your rules" before any option, then options as rows with the recommended one outlined in ink and its button in orange.
5. **You decided.** Same card width as the queue so the page does not jump when a card moves down here. Status pill, what was chosen, the exact message to the agent.
6. **Problems it hit.** Pulled out of the log at full size. Corrections carry a link back to the message they fix.
7. **Decided on its own.** Reversible auto-actions, each saying what was chosen and that nothing was booked.
8. **The whole night.** A timeline rail: real timestamps down the left, coloured dots by kind, one line per message, native disclosure for the summary and raw text. Nothing here repeats at full size.

## Rules the visuals follow

- **Colour means one thing each.** Orange is "this needs you". Maroon is "this went wrong or bends what you asked". Green is "fits" or "confirmed". Nothing else is coloured.
- **The agent's words are always one tap away and always distinguishable from ours.** Raw text is mono on cream. Summaries are sans on white. Nobody should mistake a paraphrase for evidence.
- **Everything the agent did alone is coloured and named.** AUTO in orange, ERROR in maroon, so they cannot be skimmed past in the rail.
- **No all-caps eyebrow labels, no middle-dot metadata strings, no identical shadowed cards.** These were flagged as templated in the research and removed. The only uppercase on the page is the agent's own tags, which are quotes.
- **Motion is one thing.** New entries rise 4px over 180 ms. Nothing else animates. Reduced motion turns it off.

## Mobile

- Touch targets are at least 44px on phones. Buttons and the redirect field grow to that height below the `sm` breakpoint and shrink on desktop.
- Inputs are 16px on phones so iOS does not zoom the page on focus.
- Safe-area insets are respected on the sides and bottom.
- Long raw text and URLs wrap with `overflow-wrap: anywhere`. Verified no horizontal scroll at 375px.
- A manifest and home-screen icon let it be installed as a standalone app.

## What was tried and dropped

- **Four boxed stats in the brief.** Read as a dashboard. Replaced with one money line and three hairline-separated figures.
- **A dark mode that followed the system.** Half of viewers would see a design the reference does not have. Now opt-in only.
- **Three stacked amber warning bars.** Heavy and repetitive. Now one maroon block with a list.
- **Repeating decisions and problems at full size in the log.** Doubled the page length. The log is now one line per message.
- **A generic zinc palette.** Competent and forgettable. The current tokens are the third pass.
