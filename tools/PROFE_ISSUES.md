# Profe pipeline — issue log

Harness: `tools/profe-tests/` runs the real web app with the real Android `bridge.js`; the Android Java side is simulated
(TTS with `QUEUE_FLUSH` and per-voice languages, the recogniser with session ids, the on-device LLM streaming tokens and
honouring cancel). Suites: `sA` interruptions/timing (run at 3 TTS speeds), `sB` voice routing, `sB2` failed voice,
`sC` conversation state, `sD` correction layer, `sL` latency.

| # | Area | Reproduction | Expected | Actual (before) | Root cause | Fix | Verified |
|---|------|--------------|----------|-----------------|------------|-----|----------|
| 1 | Segmentation | Reply "Use «fui» instead of «voy»…" | "Use" English, "fui" Spanish | "Use fui" read by the Spanish voice | splitter took English "use" as the Spanish verb form (usar) | outside «» in an English sentence only clearly-Spanish words go to the Spanish voice (`strictSplit`) | sB ✓ |
| 2 | Segmentation | Reply with "…«Tengo hambre», which…" | punctuation stays with its words | "." and ", which…" sent as separate English utterances | no punctuation merge | `segTidy` merges punctuation-only pieces and leading punctuation into the previous segment | sB ✓ |
| 3 | Segmentation | Reply containing "EN: …" | labels never spoken | "EN:" read aloud | labels not stripped | `forVoice` removes EN:/ES:/English:/Spanish: labels | sB ✓ |
| 4 | Voice selection (Java) | Phone without a Spanish voice | Spanish never read by the English voice | `setLanguage` failure ignored → Spanish read with the English voice | `TtsBridge.setVoice` didn't check the result or the voice's locale | `setVoice` returns false when the language isn't available; `speak` reports an error instead of speaking; the app shows a one-time notice | sB2 ✓ (simulated Java) |
| 5 | Recogniser state (Java + bridge) | Press mic, press again, press again within ~100 ms | mic ends up open, the next utterance is heard | mic closed: the first session's delayed "end" closed the new session | `SttBridge.stop()` posts `end()` 2.5 s later regardless of new sessions; events carried no session | session id on every recogniser event (`SttBridge.sid`, `bridge.js jsSid`); stale events ignored; recogniser cancelled before a new session | sA A5 ✓ |
| 6 | UI state | Same as 5 (web side) | third press means "start" | third press was taken as "stop" (still `listening` while closing) | `listening` flipped only when the phone confirmed the end | `stopListening` flips the state at once | sA A5 ✓ |
| 7 | Cancellation | Send a new message while the previous reply is still generating | old reply never spoken, new one answered | (earlier) blocked with "Profe is still answering"; after the first fix the old partial reply could still be spoken by the old request finishing | the old request's speech path ran after abort | new message marks the old reply superseded, bumps the speech generation, cancels audio and the AI; superseded replies are never spoken and are removed if empty or marked "(interrupted)" | sA A6, A6c ✓ |
| 8 | Turn detection | "Ayer fui a" | flagged as unfinished | not flagged | unfinished-word list missed "a/al/del…" | list extended; generic "chat about it" steer dropped for questions/help/repeat/unfinished turns | sA A7b ✓ |
| 9 | Conversation state | "How do you say dinner?" during a drill | answered, then back to the exercise | drill ended, no way back | drill treated any other message as "moved on" | questions don't end a drill; instant answers append "Back to the exercise: …" | sC C2 ✓ |
| 10 | Conversation state | "más despacio, por favor" / "repite" | immediate slower replay / exact replay | sent to the AI (slow, may rephrase) | not handled by the app | handled locally: speed −0.15 (min 0.6) and replay; "repite" replays the last question exactly; ~160 ms to first sound | sC C3 ✓ |
| 11 | Interruption context | Interrupt mid-sentence | Profe told what was heard | "(nothing yet)" when cut during the first sentence | only finished utterances were counted | estimate of the words already spoken in the current utterance added | sC C1 ✓ |
| 12 | Corrections (rule layer) | 15 typical learner errors | caught, no false alarms | 7/15 caught; "¡Excelente frase!" praise given to wrong sentences | missing rules | rules for plural ser, adjective agreement, «ir a» + conjugated verb, past time + present, «quiero que» + indicative, «pensar de», «años viejo» | sD 14/15, 0/14 false ✓ |
| 13 | Task detection | "Nosotros vamos a la playa ayer" | treated as an answer | started a new "task" (matched «vamos a») and skipped correction | over-broad pattern | Spanish task phrases need an activity verb («vamos a practicar…») | sD ✓ |

## Latency (measured in the harness; phone audio/recogniser/AI times are simulated and excluded)
- Mic tap → playback stop request: 0–1 ms in the page. The real Android audio stop adds the Java main-thread hop and the engine flush (not measurable here).
- AI finished → first speech request: 130–310 ms (includes the app's reply clean-up and quality check).
- Learner's last word → message sent: 3.0 s — the end-of-turn pause (Settings › Voice › wait time). Longer after an unfinished phrase (up to 5.5 s), by design.
- On the on-device AI, nothing is spoken until the whole reply is generated (the app post-processes the full reply). This is the largest delay on the phone and depends on the model.

## Not verifiable here
- Real audio: voice identity, actual playback timing and interruption latency on the device (no audio output or Android device in this environment).
- The real on-device model's answers (correction quality beyond the app's rule layer) — the model was simulated.
- Web-browser speech (Chrome's own speechSynthesis queue) and streamed speech while generating (used by the Claude/WebGPU engines).
