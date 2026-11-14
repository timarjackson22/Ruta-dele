# Profe: hands-free ("Ok Profe"), app control, and the Speak tile

Extends the existing Profe (same panel, chat history, memory, voices, teaching rules). Nothing is duplicated: voice commands call the same routes and the same buttons as touch.

## 0. What exists today (studied)
- **Profe panel** (`tOpen`, `tRender`, `tSend`).
  - `tSend` runs `localTurn` first (handles "más despacio" and "repite" locally), then the AI (`ask`: Claude, the on-device LLM, or WebGPU).
  - Practice mode (`PR`) runs role-plays and drills without the AI.
- **Voice in** (`listen` → `listen0`).
  - One recogniser session at a time, with a pause-based end of turn (`endWait`, which allows longer pauses for unfinished phrases).
  - In the Android app this goes through the SttBridge, via the SpeechRecognition shim in `bridge.js`, with session ids.
- **Voice out** (`speakMixed`, `streamSpeaker`).
  - The reply is split into segments, each read by the Spanish or English voice.
  - `SPK_GEN` cancels queued speech; an interruption marks the old reply as superseded.
- **The harness** (`tools/profe-tests/h.js`): the real web app and the real `bridge.js`, with the Android code simulated (TTS, recogniser, LLM). Suites sA–sL cover:
  - interruptions
  - voice routing
  - conversation state
  - corrections
  - latency
- **The gap: Profe can't do anything in the app.** No command reaches navigation or the on-screen controls. The only local commands are "slower" and "repeat". There is no wake phrase and no hands-free state.

**App inventory (from the route table and data-act handlers)**
- About 40 routes:
  - home / today
  - course, levels A1–C2, units, unit vocab / cards / exam guide / mock / full exams (lectura, auditiva, escritura, oral)
  - practice hub
  - listening and reading, with each text
  - writing, with each task
  - verbs and each verb
  - grammar and each topic
  - guides
  - words and each word
  - review (flashcards) and mistakes
  - placement test
  - videos and each video
  - library, progress, settings, resources
- 222 on-screen actions, among them:
  - the lesson question runner (`px-pick`, `px-submit`, `px-next`, `px-prev`, `px-skip`, `px-dunno`, `px-restart`, `px-go`)
  - the reading/listening player (`pl-play`, rate, English, hide text)
  - the read-aloud lesson (`RA`)
  - the exam papers (`ex-*`)
  - the video player
  - Profe's own buttons

## 1. Speak tile (Practice › Speak): "opens, mic dead"
- **Reproduction:** the tile opens Profe and the mic works in the browser and in the harness (real bridge.js). So the failure is on the phone's recogniser.
- **Likely causes:**
  1. Another feature still holds the recogniser, and the phone answers "busy". Candidates: video audio captions, the card pronunciation check, an exam recording.
  2. On Samsung, starting right after a cancel gives `ERROR_RECOGNIZER_BUSY` or `ERROR_CLIENT`. That reaches the page as `aborted`, which Profe ignored silently, so the mic button looked on but heard nothing.
- **Fixes:**
  - Before Profe listens, stop every other recogniser user: video audio captions, the pronunciation check, exam recording, the wake listener.
  - `aborted`/`busy` with nothing heard: retry once after 400 ms. If it fails again, show "The microphone is busy…" with a retry, never a silent dead mic.
  - Android `SttBridge`: on BUSY or CLIENT errors at start, destroy and recreate the recogniser and retry once.
  - Mic diagnostics: the last 30 recogniser events, shown in Profe › History & settings so a failure can be reported.
  - The Speak tile opens Profe straight into **voice chat**, already listening, because "Speak" means speaking.

## 2. Capability registry (one source of truth)
- **Declared as JSON** (`<script type="application/json" id="pv-registry">`), so CI can check it without running the app.
- **Each action records:**
  - `id`, `feature`, `purpose`
  - `en` and `es` example commands
  - `params` and the context it needs (`when`: a screen or state)
  - `confirm` (consequential actions)
  - `route` or `act`: the real route pattern or data-act it uses
  - `verify`: how success is checked
  - `test`: the test that covers it
  - `voice`: complete | pending | unsuitable
- **Handlers:**
  - Handlers live in `PVH[id]`.
  - Every handler uses the app's own routes and button clicks, then **verifies** the outcome (the hash changed and the page rendered, the answer was registered, playback state changed) before Profe confirms.
  - A failed check makes Profe say what went wrong.
- **Routes and actions without voice support** are listed with `voice: "pending"` or `"unsuitable"` and a reason. CI fails on anything undeclared.
- **"What can you do?" and "What can I do here?"** are built from the registry, filtered by the current screen's context.

## 3. Understanding commands (English and Spanish)
- Normalise the text (case, accents, "por favor/please", a leading "Ok Profe").
- Match each action's patterns, with number parsing:
  - ordinals and letters (second, segunda, la b, number 3)
  - levels (A1–C2, "a dos")
  - unit numbers
  - exam number and paper
  - grammar topics by name ("past tense" → preterite, "subjuntivo")
  - verbs and words
- **References:**
  - "this lesson", "this unit" → the current level/unit
  - "that" → Profe's last reply or the current question
  - "the previous question" → `px-prev`
- **Command, answer or conversation:**
  - While a lesson question or a Profe drill waits for an answer, a bare Spanish word ("volver", "siguiente") is the **answer**.
  - Commands then need command framing: English phrasing ("go back"), "Profe, …", or the wake phrase.
  - If a phrase could be either, Profe asks: "Is «volver» your answer, or should I go back?"
- **Ambiguous or incomplete requests** get one short clarifying question ("Which level: A1 or A2?").
- **Unsupported requests** fall through to Profe's normal tutoring answer, never a fake action.
- **Confirmation** for resets and deletions: "Clear the results of Examen 3? Say yes to confirm." The confirmation expires after 20 s.
- **Duplicates:** the same command from repeated recognition events within 2 s runs once.

## 4. "Ok Profe" and hands-free
- **States:** off · waiting for "Ok Profe" · listening · thinking · speaking · paused. Shown in an always-visible pill with Pause and Off; also in Profe settings and the Profe button.
- **Android app:**
  - Wake listening runs **on the phone** (`WakeBridge`: Android's on-device recogniser, partial results, no audio sent anywhere).
  - Matching allows variations: ok/okay/oye/hola/hey + profe/profesor, including common mishearings ("o que profe", "ok prof").
  - Text after the wake phrase in the same breath is the command ("Ok Profe, open my next lesson").
  - With nothing after it: a short beep, then "What would you like to do?", then listening with the usual pauses.
  - If on-device recognition isn't installed, hands-free explains how to add it (Settings › Google › Voice › Offline speech) and falls back to tap-to-talk. It never silently uses a cloud recogniser for ambient listening.
- **Browser and iPhone:**
  - Chrome's and Safari's web speech send audio to their servers, so ambient wake listening isn't offered there.
  - Fallback: **tap-to-talk**. One tap on the pill starts a hands-free exchange, which then continues without touching (follow-ups, auto-listen for answers).
- **Follow-ups:**
  - After each answer, Profe listens again for 8 s with no wake phrase needed.
  - Silence, "stop", "that's all" or "eso es todo" return it to waiting for "Ok Profe".
- **Echo and timing:**
  - Wake listening pauses while Profe speaks and resumes 400 ms after, so Profe never wakes itself or answers its own voice.
  - Leaving the app releases the microphone; returning restarts it if hands-free is on.
  - Microphone denied: a clear message with the steps to allow it; text and touch keep working.

## 5. Hands-free lessons
- "Start my next lesson" or "Continue" opens the unit's question runner.
- With hands-free on, Profe reads each question and its options (Spanish voice for Spanish), then listens for the answer:
  - by letter, number or wording ("la segunda", "b", "fui al mercado")
  - typed answers are filled in and submitted
- Profe gives the feedback (right, or the correct answer with a short reason), then moves to the next question.
- During a question: "next", "skip", "show the answer", "previous", "repeat the question", "explain" and "stop" work.
- Finishing reads the score and offers "Show my progress".

## 6. Interruptions and voices
- Tapping the mic or the pill while Profe speaks stops playback at once and listens. Rapid presses never create two sessions; the session id guard extends to the wake listener.
- A new instruction cancels the generating reply and queued speech (existing supersede logic, extended to commands).
- The same mixed-voice segmentation is used for confirmations and lesson reading.
- Corrections keep the existing rules: English explanation, the correct form in the Spanish voice, a retry invitation, and no correction when the transcription was uncertain.

## 7. Keeping Profe current (workflow and CI)
- `tools/profe_check.js` (run in CI on every push, and in `build.sh`) fails when:
  - a route in `route()` or a `data-act` in the app has no registry entry or declared status
  - a registry route matches no real route
  - a registry `act` no longer exists
  - an entry lacks en/es examples, a handler, verification or a test
- Development rule added to `README.md` (Development section): any new or changed screen, route or action updates the registry in the same change, as complete, pending or unsuitable.
- Voice tests: `tools/profe-tests/sH.js` (commands, states, wake, lessons) and `sV.js` (the command corpus).

## 8. Tests and acceptance criteria
**Automated, in the harness with simulated Android code:**
- **Command routing corpus** (≥150 English and Spanish utterances, labelled command, answer or chat): ≥97% correct, and **0** answers executed as navigation.
- **Every registered action runs and its outcome is verified:** 100%.
- **Wake** (simulated on-device partials):
  - wake alone, and wake followed by a command
  - variations and mishearings
  - unrelated speech and Profe's own playback: no activation
  - no duplicate activation
- **States:**
  - follow-ups without the wake phrase
  - back to waiting after silence or "stop"
  - mic pressed just before playback
  - rapid presses
  - duplicate recognition events (the action runs once)
  - leaving and reopening the app releases and restarts the mic
- **Hands-free lesson:** from "Ok Profe, start my next lesson" through every question to the score and "show my progress", without a single tap.
- **Latency in the page:**
  - command recognised → action done: < 300 ms
  - interrupt → playback stop request: < 50 ms
- **Speak tile:** a busy recogniser shows a message and retries once; voice chat starts listening.
- **Baseline:** the existing suites sA–sL and all earlier suites pass unchanged.

**On a real phone (outstanding until done there):** real wake accuracy with accents and noise, false wakes over an hour, echo, the Samsung recogniser's start sound, battery.

Hands-free ships **off by default, labelled Beta**, until it has been verified on the phone.
