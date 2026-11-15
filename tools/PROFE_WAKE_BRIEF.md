# "Ok Profe": a dedicated offline wake listener

## Why the old one failed
The old wake listener restarted Android's full speech recogniser over and over to catch the phrase. That is an anti-pattern:
- gaps between sessions, so the phrase is missed
- system beeps
- errors 5, 7, 11 and 13 on Samsung phones
- nothing at all when the Spanish on-device model is missing

## Best practice
Used by Home Assistant/microWakeWord, Porcupine and Android's own hotword:
- A small on-device model streams the microphone continuously and only answers "was the wake phrase said?".
- Full speech recognition starts only after the wake phrase.

## Our build
- **Engine:** Vosk (Apache 2.0, free) with the small Spanish model (39 MB).
  - The model is hosted as the `vosk` release asset by `.github/workflows/vosk-model.yml`.
  - It is downloaded once when hands-free is switched on.
- **Grammar:**
  - wake phrases: `ok profe`, `okey profe`, `oye profe`, `hola profe`
  - about 300 everyday Spanish words, including near-misses (profesor, profesión, profundizamos, perfecto, prefiero, probé…), plus `[unk]`
  - Without the filler words, ordinary speech is forced into the wake phrase.
- **Rule:** a wake word counts only when a lead word comes right before "profe" (within 0.6 s), with a 2 s debounce. Java: `VoskWake.java`.
- **Page interface:** unchanged.
  - `AndroidWake.start/stop` and `__awake.ev("final", "oye profe")`
  - new: `voskState()` / `voskDownload()` and `vosk` events (`progress:N`, `ready`, `error:…`)
- **Fallback:** until the model is on the phone, the previous recogniser path is used.

## Measured on the real model
`tools/vosk_wake_test.py` in CI: espeak-ng synthetic speech, 6 voices and speeds; 9 wake sentences and 20 non-wake sentences, including near-misses.

| Setup | Wake detected | False alarms |
|---|---|---|
| Wake phrases only | 52/54 | 36/120 ✗ |
| **Wake + filler words (shipped)** | **49/54 (91%)** | **3/120 (2.5%)** before "hey/ey" were removed as leads; all 3 were "el profe…" heard as "hey profe" |
| Free recognition | 8/54 | 0/120 |

Synthetic voices are harder than real ones. The real check is on the S24: say each wake phrase 10 times, then talk normally for 2 minutes.

## Settings (redesigned)
One card at the top of Profe › History & settings:
- an on/off switch with the current state
- status rows, each with one action:
  - the Ok Profe listener (Download, with progress)
  - Spanish speech recognition
  - the microphone
- example phrases
- Mic diagnostics with **Copy log**
