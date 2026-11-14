# Exam speaking v2: record, then the words, and clear time bars

**What you reported:** in *Expresión e interacción orales*, while you speak, the text box erases and changes what you said: you say a line about yourself, carry on, and it "autocorrects".

**Why it happens:** the box showed the recogniser's running guess. Speech recognisers keep revising their guess of the current phrase until it is final. On Android, the recogniser also restarts after every pause and re-guesses. So the words visibly change under you.

## Your idea, and what's built
**Recording first, words when you stop: Android app.**
- Your voice is recorded while you speak, and nothing appears in the box.
- On **Stop**, **Next question** or **time up**, the words appear.
- The recording is fed to Android's **on-device** recogniser as you speak, so the words are ready a second or two after you stop instead of after a full re-listen. Nothing is shown until then.
- If that pass failed, the phone re-reads the whole recording once.
- The audio lives only in the phone's memory until the words are delivered, then it is discarded. Nothing is saved or sent anywhere.

**Browser and iPhone:**
- A browser can't turn a recording into words without a paid cloud service, so live recognition stays.
- But **only confirmed words go into the box**. Words still being worked out show in a faint "Hearing: …" line under the controls, and nothing in the box is ever erased or replaced.

**Fallbacks:**
- If the phone has no on-device Spanish recognition, or the pack isn't downloaded, it says so (with where to get it) and uses the live mode.
- If the microphone is blocked, it says how to allow it.
- Typing always works.

## Speaking screen
- **Record:** a red dot, a moving level meter (so you can see it hears you), "Recording… your words appear when you stop", and **■ Stop**.
- **Time bar per task:**
  - fills as you speak, with elapsed / target ("1:12 / 2:30")
  - turns amber at the task's speaking time: "Time for this task is up: finish your sentence"
  - recording continues; the paper's clock is what ends it
- **Paper clock bar** under the header: fills as the exam time passes, turning amber in the last 5 minutes.
- After Stop: "Writing down what you said…", then "✓ Saved · N words" (or "I couldn't make out any words: try again closer to the phone, or type").
- **Conversations:**
  - The examiner asks a question, then the recording starts.
  - It stops on its own after about 2.5 s of quiet once you've spoken, or when you tap **Next question ›**. Then the next question comes.
  - Each answer is stored with its question.
- Finish, the time running out, or leaving the page while recording: the recording is stopped, the words are written down, and **then** the paper is marked.

## Tests
- Android with a simulated recorder:
  - the box never changes while recording
  - words appear on Stop
  - the level meter and the time bar move
  - Finish and time-up wait for the words before marking
  - conversations: silence advances, and Next works
  - no on-device recognition / no Spanish pack: falls back to live mode with the reason
- Live mode:
  - in-progress words never enter the box
  - confirmed words are only ever added
- All earlier exam checks still pass.
- **Real phone check outstanding:** on-device recognition quality and the time from Stop to words.
