# DELE exam orals: full audit and rebuild of the voice pipeline

## Goal
The speaking paper (*Expresión e interacción orales*) must capture **everything the candidate says, exactly once, in order**, on the phones people actually use (Samsung S24 / Android 16 first, then iPhone and the browser). It then has to mark that answer with the DELE criteria. Nothing said may be lost, duplicated, rewritten or reordered.

It should feel like the real exam:
- a preparation timer
- clear speaking time per task
- the examiner's turns in the conversation tasks
- a transcript you can review and correct before marking

## What we know (evidence, 14 Nov 2026)
- **The S24's voice services:**
  - **Speech services:** on-device: yes (Android System Intelligence); online: Speech Services by Google (the default); Claude's service; no Google app recognition service.
  - **The cause of the failures:** the Spanish on-device model was **not downloaded**, so every on-device path failed with "language not installed".
- **Observed bugs:**
  1. Words in progress replaced after a pause (Samsung never confirms a phrase before starting the next). This was fixed in v151, but only for live mode.
  2. Only the last part of an answer kept.
  3. Recording mode silently fell back to live mode.
  4. Duplicate words after the iPhone restarts (fixed earlier).
  5. The clock ran out during preparation (fixed).
  6. Raw `**` and `<br>` on cards (fixed).
- **Fixes shipped since:**
  - v152 adds "Download Spanish" (triggerModelDownload) and an online fallback (Speech Services by Google) for recording.
  - Neither has been verified on the phone.
- **Testing so far:** all test coverage simulates the recognizer. The simulator behaves better than Samsung's real one, which is why tests passed while the phone failed.

## Part 1: Audit (before changing anything)
1. **Trace every path end to end.** For each phone type (Android app with on-device Spanish, Android app without it, Android app with only the online service, Android browser, iPhone Safari, desktop Chrome), write down:
   - which engine runs (record-then-transcribe, or live)
   - which recogniser
   - which events arrive and in what order
   - how text goes into the answer
   - what happens on Stop, Next, time up, leaving the page, the app going to the background, and a phone call
2. **Event logging.**
   - Instrument the exam capture so every recogniser event is logged with a timestamp: start, partial, final, error with code, end, restarts, and the text before and after each change to the answer.
   - The log appears in Mic diagnostics and can be copied with one tap ("Copy exam voice log").
3. **Real-phone recordings.** The user runs a fixed script on the S24 and shares the log:
   - one minute of speech with pauses of 1, 3 and 6 s
   - a conversation task
   - Stop mid-sentence
   - letting the time run out
   - switching apps for 10 s
4. **Simulator fidelity.** Update the test simulator to reproduce what the logs show:
   - Samsung: partials only, restarts without finals, final text that differs from the last partial, late events from an old session, errors 5, 7, 8, 11, 12 and 13
   - Google online: segmented finals
   - iPhone: one phrase per session
   - Tests must fail on today's bugs before any fix.
5. **Findings table.** For every defect, record:
   - how to reproduce it
   - what was expected and what happened
   - the root cause, with the line of code
   - the fix and its regression test

## Part 2: Design (what it should be)
**One capture engine for the exam**, with one rule: the answer is an **append-only list of segments** `{t0, t1, text, source, confirmed}`.
- A segment is added when the recogniser confirms it.
- If a new phrase starts without confirmation, the unconfirmed text is added and marked "unconfirmed".
- Nothing already in the list is ever rewritten. The only exception: a confirmed final may replace *its own* unconfirmed version, matched by session and segment.
- The text box is derived from the segments.

**Engines, chosen per phone and shown in the UI:**
1. **Record, then transcribe** (Android app with Spanish on the phone, or the online service that accepts recorded audio):
   - The audio is kept in memory while you speak.
   - Recognition runs in parallel, but nothing is shown until Stop / Next / time up; then the words appear within about 2 s.
   - If that recognition fails, the whole recording is read again once.
   - The audio is deleted after the words are delivered.
2. **Live** (iPhone, browser, or no usable recorder): segments are added as they come, and words in progress show in a faint line, never in the box.
3. **Typed:** always available.

**Engine selection is explicit, not silent.**
- The app tests the engine at the start of the paper with a 2-second mic check: "Say *hola*".
- It shows which engine it will use ("Recording on this phone", "Recording with Google online", "Live captions") with a short reason.
- If Spanish isn't downloaded, it offers **Download Spanish** before the paper starts, not mid-answer.

**Robustness:**
- **Pauses:** pauses of up to 8 s in a monologue never end the capture; only Stop / Next / time up do.
- **Restarts:** silent recogniser restarts are invisible to the candidate. A restart that can't be resumed after three tries switches engines and tells the candidate.
- **Stopping:** Stop waits for the last words (with a 4 s ceiling), then always delivers what was heard.
- **Late events:** events from finished sessions are ignored using session ids, on both the Java side and in the page.
- **Interruptions:** the app going to the background, a phone call or another app taking the mic all stop the recording and keep the words. On return: "Recording paused: tap to continue".
- **Saving:**
  - The draft, including segments, is saved after every segment and restored after a reload or crash.
  - Marking waits for the transcription before it starts.

**Conversation tasks (Tareas 3–4):**
- The examiner asks a question in the Spanish voice, and the mic opens only after the voice has finished, so Profe never hears itself.
- The answer ends after 2.5 s of quiet once the candidate has spoken, or on **Next question**.
- "Repeat the question" is offered.
- Each answer is stored with its question; unanswered questions are marked.

**Exam realism:**
- A preparation timer with notes for Tareas 1–2 (15 min).
- A speaking-time bar per task that turns amber at the target time.
- The paper clock includes preparation time.
- The DELE criteria marks plus a few transcription-aware comments:
  - unclear words are not counted as mistakes
  - "the recogniser didn't catch part of this" when confidence is low

**Before marking:**
- Review screen: your transcript per task, editable, with "Record again" per task.
- Marking happens on confirm.

## Part 3: Tests (acceptance criteria)
**Simulated, using the recogniser patterns from the real logs:**
- **Monologue:**
  - Pauses of 1, 3, 6 and 8 s: every word appears exactly once and in order.
  - Samsung restarts without finals: no loss.
  - A final that differs from its partial: replaces only its own segment.
- **Stop, Next and time up:**
  - Stop mid-word: the last phrase is kept.
  - Next mid-answer: the answer is kept, and the next question is asked only after the words land.
  - Time up while recording: the words land first, then marking runs.
- **Interruptions:**
  - The app goes to the background mid-answer: words are kept, with a resume prompt.
  - A reload mid-answer restores everything.
- **Sessions and errors:**
  - A late event from an old session changes nothing.
  - Errors 5, 7, 8, 11, 12 and 13 each have a defined outcome: retry, switch engine, or message; never a silent stop.
- **Engine choice:**
  - With Spanish missing, the online fallback is used and the UI says so.
  - Download Spanish shows progress, and record mode is used afterwards.
- **Conversation:**
  - The examiner's voice never ends up in the answer.
  - Answers are stored per question.
- **All 15 A1 exams:** each paper opens, the timers are correct, and marking runs.

**On the S24 (required before calling it done):**
- The fixed script above, with the log shared:
  - **zero lost or duplicated words** across three runs
  - from Stop to words in under 3 s for a 2-minute answer
- **Each engine on the phone:**
  - with Spanish downloaded (on-device)
  - without it (online)
  - Android browser, iPhone
- A conversation task with real examiner audio through the speaker, with no echo in the transcript.

## Part 4: Delivery
- Ship behind a "New exam recorder" switch, on by default once the S24 run passes; the old path stays available for one version.
- Update `tools/profe-tests/exam-robustness-test.js` with the new simulator and the findings' regression tests.
- Report:
  - what was broken and why
  - what changed
  - the results on each phone
  - anything still unverified
