# Loom script (about 2:40 spoken, hard cap 3:00)

Read the **Say** lines. Do the **Do** lines as you say them. Timings are cumulative and generous; if you run long, cut the section marked "skippable".

## Before you hit record

- Open the deployed URL in a browser window resized to about 400px wide, so it looks like a phone. In Chrome: open DevTools, press the device toolbar icon, pick iPhone 14 Pro. Then close the DevTools panel itself so only the phone frame shows. Or record on your actual phone via QuickTime mirroring.
- Hard refresh once so it is at the top.
- Have this script on a second screen or printed.
- Do not paste the demo choice into Instinct during the recording. The relay is shown on screen; that is enough.

---

## 0:00 to 0:20. Setup

**Do:** Page at the top. Do not scroll yet.

**Say:** Last night I told Instinct, a chat-only agent, to book my reading week trip: Toronto, New York, Boston, under fifteen hundred dollars. Never buy without my approval. Then I stopped replying. It sent seventeen messages. This is what I see when I come back. All of it is real.

## 0:20 to 0:45. The brief

**Do:** Stay at the top. Point the cursor at the money line, then the three numbers.

**Say:** The first ninety seconds are the whole design. One money line: fourteen sixty-three of fifteen hundred, approved but not booked. Approved and spent are different numbers. Then three counts: one decision needs me, four problems, two things it decided alone. If I trust the agent, I stop here.

## 0:45 to 1:25. The open decision

**Do:** Scroll to "Needs you". Pause on the "Bends your rules" block. Then the two options.

**Say:** The one open question: how to pay, because it turns out there was never a card on file. Above the options is the most important element on the page, "Bends your rules": every way an option compromises what I asked for, pulled out of the agent's message and put in front of the choice.

**Do:** Type into the redirect field: `Stop here for now, do not set up payment.` Tap Redirect.

**Say:** I can choose, deny all, or just tell it something. I'll redirect. The screen updates instantly and shows the exact message going back. Instinct has no API, so this relays through its chat. The state is honest: sent, waiting to confirm.

## 1:25 to 1:50. Decisions that already closed

**Do:** Scroll to "You decided". Point at the two "Agent confirmed" pills.

**Say:** This loop closed twice last night. I chose option A here, relayed it, and Instinct confirmed four minutes later. Then the Boston room sold out. Instead of quietly swapping rooms, the agent stopped and asked again. That is the autonomy boundary holding: reversible things it does alone, anything I never priced waits for me.

## 1:50 to 2:15. Problems and the self-correction

**Do:** Scroll to "Problems it hit". Tap open the CORRECTION at 6:21 PM. Point at "corrects its 5:38 PM message".

**Say:** Mistakes are never hidden. Amtrak blocked it, so it priced buses and said so. At six twenty-one it corrected itself: it had claimed fifteen minutes on the Red Line, then admitted it never checked. The correction links back to the message it fixes. I'd rather see the agent wrong out loud than quietly editing history.

## 2:15 to 2:35. Decided alone, and the log (skippable if long)

**Do:** Scroll past "Decided on its own" to "The whole night". Tap open one log entry to show the raw message.

**Say:** Below that, the two choices it made alone, both reversible. And the whole night as a timeline, one line per message, each expanding to the agent's exact words. If my summary is wrong, you can see that too.

## 2:35 to 2:55. Close

**Do:** Scroll back to the top. Rest on the money line.

**Say:** Trip one looks like this: the agent recommends, I approve, and every rule it bends is named before I choose. By trip ten, after a few approved hotel picks, it asks to book hotels under two hundred on its own, and I say yes or no. Autonomy is offered, not taken. Write-up is in the repo. Thanks.

---

## If something goes wrong mid-recording

- Redirect did not appear to send: the message still shows on the card. Say "it's queued for relay" and move on.
- You scrolled past a section: the sticky bar at the top of the phone view jumps to Needs you, Problems, Decided alone, Log.
- Over three minutes: cut the "Decided alone and the log" section entirely and go straight to the close.
