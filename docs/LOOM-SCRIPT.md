# Loom script (target 2:45, hard cap 3:00)

Read the **Say** lines. Do the **Do** lines as you say them. Timings are cumulative and generous; if you run long, cut the section marked "skippable".

## Before you hit record

- Open the deployed URL in a browser window resized to about 400px wide, so it looks like a phone. In Chrome: open DevTools, press the device toolbar icon, pick iPhone 14 Pro. Then close the DevTools panel itself so only the phone frame shows. Or record on your actual phone via QuickTime mirroring.
- Hard refresh once so it is at the top.
- Have this script on a second screen or printed.
- Do not paste the demo choice into Instinct during the recording. The relay is shown on screen; that is enough.

---

## 0:00 to 0:20. Setup

**Do:** Page at the top. Do not scroll yet.

**Say:** Last night at 5 PM I told Instinct, a chat-only personal agent, to book my reading week trip: Toronto, New York, Boston, under fifteen hundred dollars, window seats. I told it never to buy without my approval, and then I stopped replying. It sent seventeen messages. This is what I see when I come back. Everything on this screen is real. Nothing is mocked.

## 0:20 to 0:45. The brief

**Do:** Stay at the top. Point the cursor at the money line, then the three numbers.

**Say:** The first ninety seconds are the whole design. One money line: fourteen sixty-three of fifteen hundred, approved but not booked. Approved and spent are different numbers, and the interface never confuses them. Then three counts: one decision needs me, four problems, two things it decided alone. If I trust the agent, I can stop reading here.

## 0:45 to 1:25. The open decision

**Do:** Scroll to "Needs you". Pause on the "Bends your rules" block. Then the two options.

**Say:** Here is the one open question. Instinct wants to know how to pay, because it turns out there was never a card on file. Above the options is the most important element on the page: "Bends your rules". Every way an option compromises what I asked for, pulled out of the agent's message and put in front of the choice. Here it warns me that card and login details go through a secure link, never chat.

**Do:** Type into the redirect field: `Stop here for now, do not set up payment.` Tap Redirect.

**Say:** I can choose an option, deny all, or just tell it something. I'll redirect. The screen updates immediately, and it shows me the exact message going back to the agent. Instinct has no API, so this is relayed through its chat. The state is honest: sent, waiting for it to confirm.

## 1:25 to 1:50. Decisions that already closed

**Do:** Scroll to "You decided". Point at the two "Agent confirmed" pills.

**Say:** This loop closed twice last night. At ten oh two I chose option A in this interface and relayed it. Four minutes later Instinct confirmed. Then the Boston room sold out, and instead of quietly swapping rooms, the agent stopped and asked again. I picked Winthrop, and it confirmed at ten forty-three. That is the autonomy boundary holding under pressure: reversible things it does alone, anything I never priced waits for me.

## 1:50 to 2:15. Problems and the self-correction

**Do:** Scroll to "Problems it hit". Tap open the CORRECTION at 6:21 PM. Point at "corrects its 5:38 PM message".

**Say:** Mistakes are never hidden. Amtrak blocked it with a bot check, so it priced buses and said so. And at six twenty-one it corrected itself: it had claimed the Boston room was fifteen minutes on the Red Line, then admitted it never verified that. The correction links back to the message it fixes. I would rather see the agent be wrong out loud than have it quietly edit history.

## 2:15 to 2:35. Decided alone, and the log (skippable if long)

**Do:** Scroll past "Decided on its own" to "The whole night". Tap open one log entry to show the raw message.

**Say:** Below that, the two choices it made on its own, both marked reversible. And the whole night as a timeline: every message, one line each, and every summary expands to the agent's exact words. If my summary is wrong, you can see that too.

## 2:35 to 2:55. Close

**Do:** Scroll back to the top. Rest on the money line.

**Say:** Trip one looks like this: the agent recommends, I approve, and every rule it bends is named before I choose. By trip ten, after I've approved its hotel picks a few times, it asks to book hotels under two hundred without asking, and I say yes or no. Autonomy is offered, not taken. The write-up and the design doc are in the repo. Thanks for watching.

---

## If something goes wrong mid-recording

- Redirect did not appear to send: the message still shows on the card. Say "it's queued for relay" and move on.
- You scrolled past a section: the sticky bar at the top of the phone view jumps to Needs you, Problems, Decided alone, Log.
- Over three minutes: cut the "Decided alone and the log" section entirely and go straight to the close.
