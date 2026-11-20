# Profe reliability review — v241–v242 (2026-11-20)

Scope: the existing app, Profe's whole pipeline (mic → recognition → turn → AI → actions → voice → avatar), storage,
and the build pipeline that embeds tools/ into index.html. Method: the real page + the real Android bridge.js with the
phone's Java side simulated (tools/profe-tests/h.js), soak runs, fault injection, resource baselines. **Not tested on a
real phone**; the items marked "device" below still need a check on the learner's Samsung.

Checkpoint before changes: git tag `checkpoint-v241` (pushed). Rollback: `git checkout checkpoint-v241 -- index.html sw.js`.

## Baseline (before v241/v242 fixes)
- Every existing suite passed (sMIC 44, sVC 43, sACC 40, sPH 20, sP 27, sPW 23, sMG 7, sNAT 5, sLR 7, sIDLE 3 …): the clean
  paths worked. The failures were in what those suites never exercised: a model that hangs, a full store, two listeners,
  and stale build sources.
- 6 soak rounds of navigation + every practice icon + chat + mic + call: 0 page errors, 0 unhandled rejections,
  intervals flat (9 → 9), DOM flat, no timers or animation loops left after 10 calls.

## Issue register

| # | Issue | Reproduction | User impact | Severity | Root cause / confidence | Fix | Validation | Status |
|---|---|---|---|---|---|---|---|---|
| 1 | Profe stuck on «Thinking…», refuses every message | On-device AI hangs (model reload, memory pressure, app backgrounded) → send a message | Profe unusable until the app restarts | Critical | `natRun` waited up to 3 min for a first word, had no mid-reply timeout, and a cancel waited for the phone's «done», which a hung model never sends, so `tBusy` stayed true. High | v241: first word ≤60 s loaded / 150 s loading; 15 s silence mid-reply keeps the text; abort rejects at once; resetChat after a stall; app's own answer (`expertAnswer`) as fallback | sSTALL (7) | Fixed |
| 2 | «Thinking… 6 s» bubble left in history | New message while the AI hangs | Confusing chat | Low | the timer placeholder was kept as the cancelled reply's text. High | placeholder ≠ answer | sSTALL | Fixed |
| 3 | Progress/settings silently stop saving | Heavy Profe use: 200 conversations × 80 messages ≈ 5.3 MB | Progress «not sticking», settings reverting, lost work | Critical | Profe history capped by count (200) but not size; one 5 MB store shared with progress; every `setItem` swallowed QuotaExceeded. High | v242 storage guard `lsSet()` for every save (30 call sites + tool sources): clears caches, then trims Profe history (`__tsTrim`), retries, warns once (`#ls-full`) with a backup link. Profe history budget 1.5 MB (older chats keep last 40 messages; notes kept). Backup restore goes through the guard | sSTORE (7) | Fixed |
| 4 | «Ok Profe» and the call both listening | Hands-free on → start a video call | On a phone: dropped words, «mic busy», cut turns in calls | High | `hfReconcile` (the single wake decider) didn't know about the call; it restarted the wake listener between turns (overlap 141/283 samples). High | v242: `hfBusy()` stands down while `__vcOn` or while the mic guard has an owner (`window.__micOwned`) — the mic guard is the one owner | sOWN (7): overlap 0 in call, chat and practice; wake returns after the call | Fixed |
| 5 | Re-embedding reverted newer work | `python3 tools/patch_adaptive.py index.html` (also m2m3, plan, profebg, skill) | Any future fix that re-embeds would silently remove word of the day, Survival Kit practice, plan, Profe backgrounds… | High (latent) | Five source files under tools/ were older than the page (edits made in index.html only); patch_profebg moved its CSS block on every run. High | sources back-synced from the page; profebg replaces in place; check `sSRC` (every patch_*.py is a no-op) | sSRC (53) | Fixed |
| 6 | Selection fights the page | Drag selection handles in page view | Page turns / sheets pop mid-selection | Medium | swipe handler ignored selections; pop-ups on every selectionchange. High | v241 (`__touching`, swipe ignores selections, one helper per screen) | sSEL (7) | Fixed |
| 7 | Practice screens with different exits | Translate / Survival Kit / Verbs vs Vocabulary | Learner hunts for the way back | Low | two practice shells (adaptive.js vs prHTML). High | «‹ All practice» on every drill | soak trace | Fixed |
| 8 | Mic error 11 / busy on first try | S24 | Start of sentence lost | Medium (device) | native: handled in APK v222/v226 (3 native retries + one page retry) | — | sMIC, sMG (simulated) | Watch on device |
| 9 | Voices without word events | Some network voices | Highlight / lip-sync drift | Medium (device) | v237/v240 learned pace | — | sLIP, sSYNC | Watch on device |

| 10 | Profe keeps steering to the study plan | Start plan setup once, then talk about anything else (even days later, even in a call) | Profe «stuck» on the plan | High | `S.plan.chat.on` was saved and `pvRoute` sent every message to `planChatTurn` unless it was one of 6 exact commands. High | v244: plan mode only for plan answers (`pcAbout`), off in calls and after 15 min, pauses with a note, draft kept | sPLAN (9), sN (29) | Fixed |
| 11 | Mouth stops after a sentence or two while the voice continues (phone) | Samsung engine in a call | Avatar looks broken | High (device) | the mouth trusted the engine's events; engines that report words while synthesising (all at once) or skip «start» left it at rest (old code: 6 % / 0 % open). Medium–high (reproduced in simulation, not yet on the S24) | v244: `AndroidTTS.speaking()` is the authority; early word events ignored; missing start recovered; clock waits for sound | sLIP 7 modes | Fixed, confirm on device |

| 12 | v244 made lip truncation worse at the ends of sentences | Samsung engine; the last part of each sentence | Voice heard, lips still | High (device) | v244 closed the mouth when `AndroidTTS.speaking()` (isSpeaking) said false, but isSpeaking turns false once audio is queued to the mixer, before it has played (reproduced: last third 0 % open). High | v245: sound only as a YES; start/onDone bound the mouth; per-sentence telemetry in the diagnostics | sLIP «queued» | Fixed, confirm on device with the diagnostics |

| 13 | Lips still for about half of each sentence | S24 log 2026-11-20 (LIPS STILL ≈ ½ duration on most sentences) | Avatar looks broken | Critical | Google online voices send word events ~2.2× faster than playback; the mouth followed them to the end and rested; the pace learned from those events made later estimates too fast; the «sound» rescue started the LAST queued sentence, so its own start was ignored and it never moved. High (log + replay) | v247: early events by real pace, pace learned from start→end, FIFO rescue, own start always wins | sLIP2 (log replay), sLIP 10 modes | Fixed; confirm with the next call report |
| 14 | Slow replies (25 s), empty replies → «Useful word…» filler | Same log: g21 35 s / 613 chars alongside a reply; g28/g29/g31 empty in 0.0 s | Profe slow, then off-topic | High | background AI jobs ran at the same time as replies; the chat session overflowed the model's 2,048 tokens (the call prompt alone was ~8,700 chars). High | v247 queue + compact call prompt + session rotation with recap + empty→retry; APK cap fix | sAIQ (6) | Fixed |
| 15 | Voice changed mid-call (sfb → esf) | Same log, after returning to the app | Jarring | Medium | voice list refresh on resume re-ranked voices | v247 voice kept for the call | — | Fixed |

| 16 | Mistakes repeated back as if correct («¡Te quiero pan con queso!»), few corrections | 2nd S24 log | Learner not corrected | High | default call mode corrected only big/repeated mistakes; the small model echoes the learner | v249 «every» mode, «Se dice» from the app's checker before the AI, echo dropped, brief rules | sTEACH | Fixed |
| 17 | Drill confusing in calls | same log | English labels in a Spanish voice, 15–30 s feedback, «puedes repetir» replayed everything, «otro verbo» ignored, no understanding check | High | drill built for the chat | v249 Spanish prompts, pronoun + form, hint, «¿Está claro?» + table, repeat/stop/other verb | sTEACH | Fixed |
| 18 | «…ahor» / «a?» spoken as two pieces | same log | Broken speech | Medium | streaming speaker counted characters; the final reply is tidied | v249 sentence tracking | sTEACH | Fixed |
| 19 | tools/pvoice.js 600 lines behind the page | found while fixing 17 | Next sync would have undone v242–v248 voice fixes | High (latent) | edits went into index.html only | back-synced; sSRC checks it | sSRC (54) | Fixed |

| 20 | App restarted twice in the first 15 s of a call | 3rd S24 log 15:34–15:35 | Call unusable | Critical (device) | Most likely memory: the ~2 GB AI model loaded at call start alongside the animated scene and the greeting (no Android memory signal to prove it; the heartbeat now records call + model state) | v250: model loads after the greeting; safe mode for a day after a crash in a call | sSAFE | Fixed; confirm with the next report |
| 21 | Lips still for the last half of the greeting | same log (3,687 ms of 7.8 s) | Looks broken | High | first sentence, nothing learned; events at ~40–55 ms/letter not flagged early; the estimate «stretch» parked the mouth | v250 loop over the last words until the end event | sLIP3 (fails on v249 at 55 ms) | Fixed |

## One owner per resource (the rule going forward)
- **Microphone**: the mic guard (`micGuard`, `MICG.cur`). Anything that listens goes through it; the wake listener asks
  `window.__micOwned()` and `__vcOn` via `hfBusy()` before it listens.
- **Voice**: `utter()`; read-aloud owns its utterances (`raGuard`); the call watches speak/cancel (`hookSpeech`, guarded
  `__vcHooked`, installs once).
- **AI turn**: `tSend` / `tBusy` / `tCtl`; any new message aborts the old one and the abort ends it at once.
- **Storage**: `lsSet()`; never call `localStorage.setItem` directly.
- **Build**: tools/ sources are the truth; edit the source, then embed. `sSRC` fails if they drift.

## Still needs a real phone
Mic first-try behaviour on the S24; audio focus when another app plays; Samsung voices' word events during a long call;
the on-device model under memory pressure (how often issue 1's limits fire: `NAT.stalls`, `NAT.lastStall`).
