# Ruta DELE: rules for every update

## Service gaps & costs dashboard (Settings → Service gaps & costs, route #costes)
Every change must be checked against `tools/costs/gaps.json`:
- Does it add, remove or change a dependency on an outside service (AI, speech, translation, hosting, analytics, accounts)?
- Does it change usage per user (more AI calls, longer audio, bigger downloads)?
- Does it close or open a gap (something now done well for free, or newly needing a paid tier)?
If yes: edit `tools/costs/gaps.json` (gap, tiers, prices with source URL, impact 0–10 on the five metrics, usage assumptions),
then run `python3 tools/sync_profe.py index.html /tmp/pvoice.orig.js` (it re-runs `tools/costs/model.py` and embeds the new numbers).
If no: say so in the commit message ("costs: no impact").

## Go to market & unit economics (Settings › Admin, route #gtm)
- Assumptions, prices and sources: `tools/costs/gtm.json`; model: `tools/costs/gtm.py` (uses costs.json); embed: `python3 tools/costs/patch_gtm.py index.html` (re-runs both models). Re-run after any change to gaps.json or gtm.json.

## Voice (Profe)
- Word answers are grounded in the app's dictionaries: `facts()` and `verbLemma()` map conjugated forms («socavan» → socavar) and pass meanings with a no-invention rule; `teachCard()` puts the dictionary meaning above every "Teach me how to use «…»" reply.
- `tools/pvoice.js` is embedded in index.html; edit it there, then sync as above and `cp tools/pvoice.js /tmp/pvoice.orig.js`.
- `node tools/profe_check.js` must pass (every route and data-act button has a voice status; no duplicate top-level names).
- Suggested phrases in page intros (PV_PAGES) must really work: `node tools/profe-tests/sP.js`.
- Audio turn-taking and lesson commands: `node tools/profe-tests/sMIC.js` must pass (read-aloud × "Ok Profe" × taps × Profe's voice; every page/view/reading command executed).
  Read-aloud owns its utterances (`u.__ra`, `RA.self`); anything else that speaks or cancels pauses it through raGuard. Never cancel speech around it without that rule.

- Voices (v217): one engine. `pickVoices()` ranks every device voice (`vq()`: network/neural/enhanced up, `VX_ROBOT` novelty/eSpeak voices out, `S.region` accent, the learner's pick first) and sets `V2` (two Spanish speakers, different people), `VEN` and `voice`. Every utterance goes through `utter()` (`ttsNorm()` clean-up, pacing ≥0.75); never build a raw SpeechSynthesisUtterance.
  Who says what: `tagSpeech()` (quotes judged by their own words and the words before them, a word after a Spanish article stays Spanish, the learner's name `TS.lname` uses the English voice unless `TS.nameLang === "es"`). `node tools/profe-tests/sVX.js` must pass (mock Android, iPhone and Chrome voice lists × both regions, plus the split cases).

- Word highlight while listening/reading (`cueTrack`) maps voice boundary positions against `u.text`, the cleaned text the voice really speaks, never the page text. `node tools/profe-tests/sSYNC.js [ids]` must pass (every lit word = spoken word).

- Read aloud (v219) is the `#nb-ra` Listen button in the top bar (`raBtn()`/`raTopUI()`), on every RA_PAGES route; no in-page bar. It keeps `data-act="ra-start"` (voice commands click it); a real tap while reading pauses/resumes. Scroll view starts at the first block on screen, page view at the current page. `node tools/profe-tests/sRA.js` must pass.

- Profe home (v221): Profe opens on the practice icons (`.prapps`, `PA_ICON`; icon + 1–2 word name, no descriptions, no dropdown, no explanatory text). There is no Chat/Practice switch: chat is the bar at the bottom (`.pchat`, «Chat · have a conversation with Profe»), and the header «Practice» chip (`t-tab` practice) is the way back. Flows that need the chat (plan setup, prompts, «Ok Profe») set `tView = "chat"`.
  After every answer (right, or the last try) the mic stays off and `.prnextbar` shows one big Next; nothing moves on until Next. Clues: what's wrong + the answer's shape with gaps (`adShape`/`adGap`: clue 1 first letter, clue 2 half the word). Test helper `open()` opens the chat (pass `{home:true}` for the icons). `node tools/profe-tests/sPH.js` must pass.

- Mic (v222, native `SttBridge.java`): ONE SpeechRecognizer, created and bound at app start (`ensure()`/`warm()`), reused for every session with a per-session listener; rebuilt only after error 11 / client error. Never destroy+create per tap (S24: error 11 on every first try, start of the sentence lost). Continuous listening = segmented session (Android 13+), no restart gaps. The page shows «One moment… opening the mic» (`micReady`) until the phone's `start`, and counts the time to speak from then.
  Spoken answers are compared by sound: `spokenAs()` writes homophones (`SPK_SAME`: porque/por qué, sino/si no, hay/ahí…) the way the expected answer does; typed answers keep their spelling. Callers that know the language pass `speakMixed([[text, isSpanish], …])` instead of letting it guess.

- Profe wording (v224): no internal codes on screen (`adLabel` returns "" for anything it can't name; «fr» = Survival Kit), no "Now"/"Practising:" labels or repeated notes; the focus is one chip; answer boxes say «Say or type…» when the mic exists; feedback lines are de-duplicated. `node tools/profe-tests/sPW.js` scans every Profe screen.

- MIC GUARD (v226): every recogniser in the page is `micGuard(window.SpeechRecognition)` (`SR`, `PC_SR`): one owner at a time (a new start ends the previous owner with error "aborted" + end), stop/abort only touch your own session, watchdogs (no mic-open in 8 s → "audio-capture" + end; unanswered stop/abort → end after 2.5/1.2 s; 25 s / 2 min max), end fires exactly once. Never use `window.SpeechRecognition` directly. The Android bridge (bridge.js) has the same ownership rules from APK v226. `node tools/profe-tests/sMG.js` must pass (reproduces the old bridge's behaviour).

- Numbers (v227): Spanish speech says numbers as words (`numsEs`/`numEs` in `ttsNorm`: thousands separators, decimals, %, money, ordinals, clock times, years; «21 años» → veintiún; phone numbers digit by digit). The word highlight matches whole words only, and a number spoken as words keeps the highlight on the word before it.
- The mic guard also restarts the phone's recogniser once, silently, when it gives up before hearing anything; the flashcard mic says «One moment…» until the mic is open.

- Video call (v228, tools/vcall.js + vcall.css, embedded by `python3 tools/patch_vcall.py index.html`): button `vc-open` beside Practice. Profe's own portrait animated on the phone (no paid avatar service). Lip sync: while a call is on, `speechSynthesis.speak/cancel` are watched; each utterance's start / word boundaries / end drive the mouth from the letters of the word being spoken (`visOf`, `AV`); cancel or end closes it at once. Turns: the call's guarded recogniser (never while Profe speaks unless «interrupt by voice» is on; echo filter), end of turn after learner-length pauses, then `tSend()` (commands, dictionary, AI). During a call the chat's `listen()`, `hfCapture()`, `autoAgain()`/`afterSpeech()` stand down; `rules()` adds `window.__vcNote()` (language mode, correction mode, the learner's instructions); `utter()` applies the call speed. An app command that opens content pauses the call (bubble «Tap to talk»). Unspoken replies are spoken by the call; with no AI, Profe says how to turn it on. Rollback: `VC_FLAG = false` or `TS.vcall = false`. `node tools/profe-tests/sVC.js` must pass.
  Look (v229): `vcScene()` draws a full-bleed café (blurred shelves, lamp, bokeh, bunting by `S.region`) and a head-and-shoulders Profe (`.vc-char`, scaled about the forehead so the face sits above the captions) for all six `PV_PORTRAITS` looks. FaceTime-style frosted controls; landscape and desktop are two columns (Profe left, captions + controls right). Lip-sync size is read through `window.__vcMouthH()`; the layout test checks the face (`.vc-face-shape`) is never under captions, hint or controls.
  Life (v231): `hookSpeech()` runs again on every `vcOpen()` (it must watch the speechSynthesis object that is live then). The mouth moves by syllables (`avKeys`: vowels held, consonants short) and keeps time from the text when the phone sends no word events (or stops), never resting mid-sentence; it waits ~280 ms after «start» for the first word. Moods from what Profe says (`AV.mood`: joy / excited / ask / warm; listening, thinking) drive smile, smiling eyes (`.vc-cheeks`), brows and head; nods on stressed words (`avBeat`) and «mm-hm» nods while the learner talks; call voice pitch +5–12%. Captions (`CAP`, `capAdd`/`capPaint`/`capMark`) hold the whole reply of the turn with the spoken word lit and the card following the voice; Settings › Captions: Profe and me / Only Profe / Off (`vcTxt()`, `TS.vc_cc`, `TS.vc_you`). Costs: gap `avatar` in gaps.json (`call_min_per_day`, calc type `once`).

## Exams
- Formats follow the current Instituto Cervantes specs (A1/A2 v2020; C1/C2 2024). Tasks not in the official exam stay only as `extra: true` (labelled, outside clock and score). Open items: tools/AUDIT_2026-11-16.md.
- Curriculum content fixes for dashboard gaps: tools/content/add_*.py (each re-runnable; appended so saved answers keep their indexes).
- A2 reading is 5 + 8 + 6 + 6 (Especificaciones 2020): Tarea 4 is a narrative text from tools/exgen/a2_t4.py, and the old gap-fill is kept as «Práctica extra» (gen.py).
- Exam data is generated: `python3 tools/exgen/gen.py <level>` from `tools/exgen/<level>_part*.py`. Update `EXREADY` and `sw.js` when adding exams.

## Curriculum coverage dashboard (Settings › Admin, route #cobertura)
- Register: `tools/curric/build_register.py` (sources, outcomes, DELE tasks, skills mapping); embed with `python3 tools/curric/patch_curric.py index.html`.
- New lesson or guide: add its id to `tools/curric/topics.json` (and targets if not the default) or it is flagged "needs its own skills mapping".
- Exam format changes: update the DELE task rows/sources in build_register.py. `node tools/profe-tests/sCR.js` must pass. Method: tools/curric/METRICS.md.

## Quick drill (Practice tab, #drill) — v223
- One drill for everything: its own exercises (match, hear, build, dictation, say) + skill questions from every lesson of the chosen level (`__sk.pool(lv, focus)`, run in the drill's frame by `__sk.embed`). Level (`S.qdLv`, A1–C2 chips) and focus (`S.qdF`: Mixed or one skill) sit at the top of every drill screen (`qdHead()`). The old Skill drills page (#ejercicios, #ejercicios/skill/…) redirects here; lesson «Check yourself» drills (#ejercicios/<unit>/<part>) and chapter challenges stay. `node tools/profe-tests/sQD.js` must pass.

## Skill drills (Check yourself cards, #ejercicios)
- `tools/skilldrills.js` (+ .css) embedded by `python3 tools/patch_skill.py index.html`; generated from lesson/guide content, so new content gets drills automatically.
- `node tools/profe-tests/sSK.js` must pass (every drill type renders and grades; difficulty by level).

## Lesson flow (tap-a-word meanings, page mode, Mastery full screen)
- `tools/lessonflow.js` (+ .css) embedded by `python3 tools/patch_lessonflow.py index.html`. `node tools/profe-tests/sLF.js` must pass.
- Word meanings must stay off where they'd give an answer away (drill types in skilldrills.js `noGloss`) and in exam mode (`lfExamLocked`).
- Page view is semantic: pages are runs of whole blocks (PG_KEEP stays with what follows, PG_TAIL never sits alone, blocks open only at their seams). Never reintroduce CSS-column slicing.
  After lesson/layout changes run `node /tmp/audit/pgall.js`-style checks via sLF (every page fits above the bar, no text missing, no heading alone).

## Survival Kit (Library › Survival Kit, route #frases)
- Data: tools/frases/data*.py (category, level, pattern, English, tip, tense variations). Build and embed: `python3 tools/frases/build.py index.html` (view frases.js + frases.css; route, Library tile, flashcard deck `frases` in VPRO, global player source, Profe practice `PR.pat` via `startPatterns()`).
- Each Spanish sentence must be unique, and tenses must use the codes in build.py. Level gating for practice comes from `FR_T` (tense level) and the pattern level.

## Home (#inicio) — v226
- One purpose per block: the top banner (cbHTML: what to continue, then the word of the day as its second slide via `wodToday()`), a short «Today» list (today's session, streak/goal mini ring, Quick drill, Flashcards and My mistakes only when something waits), the word of the day as one line, the journey. No carousels of tiles that repeat the tabs.

## Videos (#videos) — v227
- Rationed library: `VID_KEEP` in tools/video.js (and its embedded copy in index.html) = the best 2 per category; all music stays; sports keeps a live radio commentary. Hidden videos stay in `VID_ALL` so links and history still open them.

## Reading hub (#leer) — v225
- Same shape as Listening: level (`RF`), then kinds of text (`RK`, `RD_K`/`rdKind()` from the text's first line: Messages, Notices & ads, Articles, Opinion & essays, Literature, My texts), then the list. Each kind has its own icon colour (`t-r<kind>`). «Add your own text» is a row at the end (and under My texts). `node tools/profe-tests/sRD.js` must pass.

## Display rules (v212)
- Nothing may cross the floating bottom controls: `#px-dock` (script PXDOCK) frosts the band under the tab bar, Profe, players, pager and video bar. Add any new floating bottom control to its `SEL`.
- Tables never scroll sideways on phones: `tblTooWide()` turns a too-wide grammar table into one card per row (`.tbl-stack`, labels from `data-th`).
- Full-app display audit (360-px phone, every route, every page of page view): /tmp/audit/px/run.js with check.js. It flags text under controls, clipped or off-screen text, and sideways scrolling.

## Spanish variety and accent (Settings › Spanish variety) — v232
- `S.region` (es / latam) decides grammar (vosotros or ustedes) and the Profe backgrounds; `S.accent` (`ACC`: es-ES, es-MX, es-PA, es-CO, es-419 = any LatAm) decides the voices (`vxRank`: the chosen country's voice first, then es-US/MX/419, then any LatAm), the mic language (`regLang()`: never hard-code es-ES/es-US), Profe's vocabulary (`accNote()` in the prompt) and the call's bunting. `setAccent()` keeps both in step; the top-bar `region` toggle swaps Spain ↔ the last LatAm accent (`S.accLat`). Settings says honestly when the phone has no voice for the chosen country (`accVoiceLine()`).
- v233: the variety is a rule for every voice, not a preference: `vxReg()` puts any voice of the chosen variety above every voice of the other (quality only orders voices within it); a voice picked earlier (`TS.pvEs`) is ignored while it doesn't match (`vxRegOk`); voice lists show only the variety; `ttsLang()` is the voice language when no named voice is known (es-PA/es-CO would fall back to Spain on Android), and the APK's `TtsBridge.setVoice` retries es-US/es-MX/es-419 instead of landing on a Spain voice. `node tools/profe-tests/sACC.js` must pass.

## Profe screen backgrounds
- By Spanish variety (`S.region` → `html[data-region]`): latam = Casco Viejo (tools/profe-bg/latam.svg), es = Andalusian village (es.svg). Original SVGs, embedded by `python3 tools/patch_profebg.py index.html`. Keep the veil: text must stay readable in light and dark.

## Versions
- Never edit `window.__BUILD`, `var BUILD` or `version.json` by hand: `tools/sync_profe.py` stamps all three with one value.
  If version.json is newer than the page's stamp, the update check reloads for ever ("Updating to the latest version…").
- Bump the `sw.js` cache name (ruta-dele-vNNN) with each release.
