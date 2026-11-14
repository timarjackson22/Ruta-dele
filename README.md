# Ruta DELE

My DELE app: a complete Spanish course from A1 to C2 for the Instituto Cervantes DELE exams, built as an installable web app.

- 6 levels, 43 units: vocabulary with audio, grammar, self-checking exercises, flashcards, exam guides and mock tests
- Escuchar: 131 listening exercises from Latin America (stories, podcasts, news, history, culture, original songs with rhythm tracks, and poems) with sentence-by-sentence playback, tap or highlight to translate, and dictation
- Leer: 30 DELE-style reading comprehension texts
- Gramática: every part of speech with key rules, common mistakes and ranked word lists with examples and audio: 1,360 nouns, the top 150 pronouns, adjectives, adverbs, prepositions, conjunctions, interjections, determiners, numbers and DELE connectors, plus all the articles
- Reflexive verbs: the 150 most used, with types, rules and conjugation
- Verbos: 8,115 verbs ranked by usage, with pronunciation, meanings, synonyms, antonyms, examples and full conjugations (irregular forms highlighted)
- Thematic vocabulary: about 4,100 words and expressions by DELE topic, A1–C2
- LatAm / España switch for conjugations, pronunciation and voice
- Practice: 120 role-plays (20 per level) of everyday Panama situations, checked offline
- Profe, an AI tutor powered by Claude (inside Claude, or with your own Anthropic API key, using Claude Opus 5.5)
- The 2,500 most-used Spanish words, ranked by frequency, with continuous Spanish–English audio and quizzes

**Open the app:** https://timarjackson22.github.io/Ruta-dele/

Install on Android: download the APK from the latest release (ruta-dele.apk), or open the link in Chrome → ⋮ → Install app.
Install on iPhone: open the link in Safari → Share → Add to Home Screen.

Word ranking: FrequencyWords by Hermit Dave (CC BY-SA), via the spanish_data project. Meanings adapted from Wiktionary (CC BY-SA).

Example sentences in Verbos: Tatoeba (CC BY 2.0 FR).

Noun ranking: FrequencyWords (OpenSubtitles) via spanish_data.

## Development: keeping Profe's abilities current

Profe can open any part of the app and drive lessons, playback and practice by voice or text ("Ok Profe, start my next lesson").
What it can do comes from one registry, `tools/profe_registry.py` (actions, routes) plus `tools/profe_acts.json` (every on-screen
button's voice status), built into the page and checked by `tools/profe_check.js` in the build and in CI (`.github/workflows/profe-check.yml`).

Whenever you add, change, rename or remove a screen, route or on-screen action (`data-act`):
1. Review its effect on Profe and hands-free use.
2. Declare its voice status in the registry, in the same change: an action (with English and Spanish example commands, patterns,
   the route or button it uses, how success is checked, and its test), or `pending` / `unsuitable` with the reason.
3. Add or update the handler in `PVH` (`/home/claude/app/pvoice.js` → built into `index.html`). Handlers use the app's own routes
   and buttons and must verify the result before Profe says it worked.
4. Update the corpus `tools/profe-tests/sV.js` and the integration test `tools/profe-tests/sH.js`.
5. Remove obsolete entries: the check fails on routes or buttons that no longer exist.
6. Run `node tools/profe_check.js`, `sV.js`, `sH.js` and the baseline Profe suites (`sA`–`sL`).

New actions are only exposed to Profe once they are in the registry and the checks pass. "What can you do?" and "What can I do here?"
are generated from the registry, so they stay accurate. Design: `tools/PROFE_HANDSFREE_BRIEF.md`.
