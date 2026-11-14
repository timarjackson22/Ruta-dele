# Exams: speaking answers saved and graded, plus a full robustness test

## What goes wrong today (found in the code)

1. **Unfinished speech is thrown away.** While you speak, the box shows the words as they come in, but the answer only stores a phrase once the recogniser marks it *final*. It loses the last phrase whenever the session ends before that happens:
   - you tap **Stop** and the phone's recogniser times out instead of sending a final result (common on Samsung), or
   - you tap **Finish and mark** (or the clock runs out) while still recording: the mic is aborted and the last phrase vanishes.
   The paper is then graded on an empty or partial text, and anything under 3 words scores 0 without a word of explanation.
2. **iPhone keeps only the last phrase.** iPhone listens one phrase at a time and restarts the same recogniser. Each restart rebuilt the answer from the text saved at the *first* start, so every phrase replaced the one before.
3. **Nothing is saved to the phone during a paper.** Answers live only in memory. A reload, the app being closed in the background, or opening a different paper wipes them.
4. **Leaving the page doesn't stop anything.** The mic keeps listening and the timer keeps running. When time runs out, the result page is drawn over whatever page you are on.
5. **The conversation tasks aren't a conversation.** The examiner reads every question in a row, then you have to answer all of them from memory. Pressing the button again while the questions are being read starts a second, overlapping run.
6. **Typing while recording is overwritten** by the next recognised phrase.

## Changes

**Transcript capture (one routine for all phones)**
- Each recognition session adds to the answer. The text before the session is the *base*. Final phrases are base + finals. The words still in progress are kept separately as *pending*.
- Pending words are **committed** into the answer (never dropped) in all of these cases:
  - the session ends (including a timeout with no final result)
  - Stop
  - Finish and mark
  - the timer running out
  - leaving the page
  - the app going to the background
- iPhone: before each restart, the base is reset to the full answer so far, so phrases add up instead of replacing each other.
- While a task is recording, its box is read-only ("Stop to edit"). It becomes editable again after Stop.
- A status line under each task shows: "Listening…", then "✓ Saved · N words". If the mic fails, it shows the error with "type your answer instead".

**Autosave and restore**
- Every change is written to the phone's storage as a draft for that paper:
  - an option chosen
  - a keystroke
  - a phrase recognised or committed
  - the plays used on each recording
  - the clock's end time
- Reopening the paper (after a reload, a crash, or the app being closed) restores the draft with a notice: "Your answers were restored".
- A timed paper keeps the real exam clock. If time ran out while you were away, it is marked as soon as it reopens, flagged "time ran out".
- The draft is deleted once the paper is marked, or on "Do this paper again" / "Clear results".

**Leaving the page**
- Leaving a paper while recording commits the words and stops the mic.
- The clock keeps running, as in the real exam. If it runs out while you are on another page, the paper is marked quietly and the result is waiting when you return; the app never draws it over another page.

**Conversation tasks (examiner questions)**
- Turn-taking: the examiner asks one question, the mic listens for your answer, the answer is saved, then the next question comes.
- Controls while it runs: "Question 2 of 5", **Next question ›** and **■ Stop**.
- If no answer is heard, the examiner moves on and the question is marked unanswered.
- Answers are stored per question, and the result page shows the exchange (examiner line, your answer).
- Only your own words are graded.

**Before marking**
- "Finish and mark" warns, like unanswered questions do, when a writing or speaking task has fewer than 3 words: "Task 2 has no answer yet. Tap again to finish".
- On the result page, a task with no answer says "No answer was recorded for this task" instead of showing silent zeros.

**Android app**
- SttBridge.stop(): if the recogniser times out after Stop without a final result, the last words shown are sent as the final result. This also benefits Profe's mic.

**Not in scope:** keeping an audio recording of your voice. On Android the speech recogniser holds the microphone, so a second recorder would get silence or break recognition. The transcript is what gets graded.

## Robustness test (Playwright, mocked speech)

**Data check (all 15 A1 exams)**
- All four papers are present.
- Reading and Listening have 25 questions each; Writing has 2 tasks and Speaking 4.
- Every answer key points to an existing option.
- Every listening task has audio.
- Writing and speaking tasks have word ranges and points.
- The format minutes are correct.

**Reading** (each exam)
- All answers right gives 25/25.
- All wrong gives 0, and the wrong answers are added to My mistakes.
- The unanswered warning shows before marking.

**Listening**
- Plays twice, then the play button is disabled.
- Practice mode has no play limit.
- Marking works.

**Writing**
- Form and email are marked above 0.
- The word count updates.
- An empty task gives the warning.

**Speaking**
- *Interim words only, then Finish* (Android): the words are kept and graded.
- *Stop with no final result*: the words are committed.
- *iPhone restarts*: three phrases are all kept.
- *Conversation*: questions are asked one at a time, each answer is saved against its question, and the exchange appears on the result page.
- *Reload mid-paper*: the answers are restored.
- *Timer runs out while recording*: the words are committed and the paper is marked as late.
- *Leaving the page while recording*: the mic stops and the words are saved.
- *An empty task*: the warning shows, and the result explains the zero.

**Whole exam**
- With all four papers done, the scores add up to Apto or No apto with the group rule.
- Clear results resets the exam.
- The result page never appears over another page.

**Also**
- No script errors.
- The speaking page has no overflow on a small phone.

**Done when** all of the above pass, the earlier suites still pass, and it is released with the APK rebuilt.
