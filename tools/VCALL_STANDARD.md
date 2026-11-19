# Profe Call Operating Standard (v239)

Scope: the Profe video call (`tools/vcall.js`, `tools/vcall.css`, embedded by `tools/patch_vcall.py`), plus the page code it depends on
(`utter()`, `streamSpeaker`, `tSend()`, `natChat()`, `micGuard()`), and the Android bridges (`TtsBridge`, `SttBridge`, `LlmBridge`, `bridge.js`).

## 1. Architecture (what "video" is here)

There is no streamed video and no paid avatar service. "Video" = a **locally drawn SVG character** animated on the phone.

| Stage | Component | Notes |
|---|---|---|
| Mic capture + recognition | Android `SttBridge` (one shared `SpeechRecognizer`, segmented sessions) behind `bridge.js`; browsers: Web Speech `SpeechRecognition` | Every recogniser is wrapped by `micGuard()` (one owner at a time). Language: `es-US`/`es-ES` plus `en-US` multi-language where the phone supports it |
| Turn detection | `vcListen()` + `vcEot()` (adaptive pause) + `vcHold()` (continuation while thinking) | Provisional words shown as provisional |
| Interpretation / reply | `tSend()` → commands, dictionary, then AI (`natChat` on-device Gemma/Qwen via `LlmBridge`, or a cloud engine if configured) | Replies stream (`part` events) |
| Speech | `streamSpeaker` → `speakMixed` → `utter()` → `speechSynthesis` (Android: `TtsBridge` = the phone's default TTS engine) | Voice chosen by `vxRank()`: variety first, then the look's gender, then quality, then "reports word positions" |
| Lip-sync | `hookSpeech()` wraps `speechSynthesis.speak/cancel`; `onstart`/`onboundary`/`onend` drive `AV` | Timing source = the TTS engine's word events (Android `onRangeStart`, tied to playback); text-paced fallback only when the engine sends none |
| Render | `vcScene()` (SVG, built once per call) + `vcAnimate()` (one `requestAnimationFrame` loop, attribute updates only) | No WebGL, no network assets |
| State / lifecycle | `VC.st` (connecting, listening, thinking, speaking, paused) + independent `VC.muted`, `VC.cc`, camera | `VC.gen` invalidates stale callbacks |

Failure boundaries: TTS engine (voices, word events), recogniser (availability, language packs, errors), on-device model (load time, generation speed), the page's main thread (shared with the rest of the app).

## 2. The standard

| # | Rule | Why | Where | Test |
|---|---|---|---|---|
| A | One call at a time; one mic owner; the chat's `listen()`/`hfCapture()`/`autoAgain()`/`afterSpeech()` stand down while `__vcOn` | Competing recognisers truncate speech | `vcOpen`, `micGuard`, patch_vcall hooks | sVC, sMG, stress test (re-entry ×8: one root, no owner leak) |
| B | Explicit states; mute/captions/camera are separate flags | "Muted while speaking" must stay valid | `vcSet()`, `VC.muted` | sVC (states, mute) |
| C | Mouth timing comes from the engine's word events for the utterance being played; text pacing only as fallback | Lip-sync must follow audio | `hookSpeech`, `avWord`, `avKeys` | sVC lip-sync (median ~13 ms, p95 30–70 ms in automation) |
| D | A turn ends only after a learner-length pause; unfinished sentences wait longer; speech during "thinking" continues the turn | No truncation | `vcEot`, `vcHold`, `VC.contDrop` | sVC #17 |
| E | Interrupt/end bump `VC.gen` and `SPK_GEN`, abort the generation (`tCtl`), cancel speech, close the mouth | No stale audio/animation | `vcInterrupt`, `vcEnd` | stress test A/B: 0 utterances after interrupt/end; sVC interrupt <400 ms |
| F | Bounded work: one animation loop; no page-wide DOM churn; caption buffer is one turn | Jank, battery, delayed speech events | `vcAnimate`, `CAP`, sIDLE | sIDLE (idle screens 0 work; call ≤70 frames/s) |
| G | Degrade: audio-only if the scene fails; reduced motion stops sway/gaze | Keep the conversation | `vcxHTML` (`VC.audioOnly`), `reduce` | sVC (forced face failure → audio only) |
| H | Observable without content: timings per turn (`eot`, `lat`, `total`) in call settings; no raw audio stored | Diagnose privately | `VC.metrics`, `vcSheet` | sVC |
| I | Done = end-to-end evidence (tests below + real-device checks), not a moving face | — | this file | — |
| J | Honest about the platform: no background/locked-screen listening claimed; camera optional and asked only when turned on; voices limited to what the phone has | Trust | `vcCam`, `accVoiceLine`, `pvVoiceMatch` | sVC camera, sACC |

Platform references: Web Speech API (W3C draft, MDN `SpeechSynthesisUtterance.onboundary`, `SpeechRecognition`), Android `UtteranceProgressListener.onRangeStart` (API 26+), Android `SpeechRecognizer` (segmented sessions API 33+), `requestAnimationFrame` (HTML Living Standard).

## 3. Issue register (v239 audit)

| ID | Pri | Issue | Evidence | Root cause | Status |
|---|---|---|---|---|---|
| I-1 | P0 | Whole app busy every frame: ~360 observer callbacks/s, each re-scanning the page (unquote, prose formatting, phrase marking) | rAF/mutation counter: idle lesson page 360 rAF/s; call 22 fps at 4× CPU throttle | `raTopUI()` compared `innerHTML` with its own string (SVG re-serialised → never equal) and rewrote the Listen button; `gpBtns()` rewrote labels; both fed MutationObservers → infinite loop (since v219) | **Fixed** (0/s idle on 18 screens; call 31 fps at 4×) |
| I-2 | P1 | Call replies silent until fully written | Code: `streamSpeaker.feed` returned when the chat panel was hidden (always, in a call) | Gate for the chat panel | Fixed v237 (sNAT) |
| I-3 | P1 | Two caption words lit at once | Screenshot | `capMark` cleared only the first `.on` | **Fixed** |
| I-4 | P1 | Learner cut off at pauses | v235 analysis | Fixed pause thresholds | Fixed v235/v237 (`vcEot`, `vcHold`) |
| I-5 | P1 | Voice ≠ look | v235 | No gender in voice choice | Fixed v235/v238 (Readium table, Samsung `SMTf/SMTm`) |
| I-6 | P1 | Highlight/mouth drift with some voices | Field report | Engines that send no word events (often online voices) | Mitigated v237 (learned and down-ranked) |
| I-7 | P2 | Response time depends on on-device model speed | Not measurable here | Gemma prefill/generation on the phone | Open: needs device measurement (call settings shows it) |
| I-8 | P2 | Mixed English/Spanish recognition quality | Not testable here | Phone recogniser | Open: device test |

## 4. Measurements (automation, desktop Chromium emulating a Pixel 7; NOT a real phone)

| Metric | Before | After |
|---|---|---|
| Idle page animation callbacks/s | 360 | 0 |
| Idle page DOM mutations/s | ~180 | 0 |
| Call frame rate, 4× CPU throttle | 22 fps (p95 frame 67 ms) | 31 fps (p95 50 ms) |
| Stop after interrupt (tap) | <400 ms | <400 ms |
| Utterances after interrupt / after end during generation | — | 0 / 0 |
| Re-entry ×8 | — | 1 root, 0 mic owners left, 1 loop |
| First speech after end of turn (mock model writing 1 sentence/450 ms) | whole answer (≈4 s) | ≈ end-of-turn wait + first sentence (sNAT) |

## 5. Test matrix

| Area | Status | How |
|---|---|---|
| Call states, mute, captions, camera, end, re-entry, layout, lip-sync timing | PASSED | sVC (43) — automation with mocked speech/mic/camera |
| Streaming replies, preload, short answers | PASSED | sNAT (5) — mocked on-device model |
| Variety + gender voice choice | PASSED | sACC (40) — mocked voice lists |
| Idle work / loop regression | PASSED | sIDLE (3) |
| Interrupt/end during generation, re-entry, navigation | PASSED | stress script (automation) |
| Real microphone, accents, noise, speakerphone vs headphones | NOT TESTED | needs the phone |
| Real on-device model latency, 30-min session, thermal | NOT TESTED | needs the phone |
| iOS | NOT TESTED | no device |

## 6. Rollout and rollback

- Ships with the web app (no APK change). Rollback: revert the commit, or `VC_FLAG = false` / `TS.vcall = false` to hide the call.
- Monitor: call settings timing line (per call), learner reports with screenshots of call settings.
- Next validation on a real phone: a 15-minute call with the four example sentences, an interrupt, «Barcelona es la capital de España», and a lesson command; read the timing line after.
