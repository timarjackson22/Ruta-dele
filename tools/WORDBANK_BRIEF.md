# Spanish word bank: expressions, slang and regional words

## Goal
The app should be close to exhaustive for words and expressions, including colloquialisms, so that Verbatim, word cards, video and song captions and Profe all explain real Spanish and not just single dictionary words. It must use no paid service.

## Source
**Wiktionary**, extracted by wiktextract and published at kaikki.org.
- License: CC BY-SA 4.0. The app credits it under each expression card.
- Google's dictionary data is licensed from Oxford Languages (paid; research-only free tier), so it isn't an option.

## Build
`.github/workflows/wordbank.yml` runs `tools/wordbank.py` and saves the results on the `wordbank-data` branch. The release copies them into `dictdata/`.

**`es-xp.json`** (2.1 MB, 0.66 MB compressed):
- `P`: 15,155 multi-word expressions as `[expression, part of speech, English, register, places, example]`.
  - Literal-use senses ("Used other than figuratively…") are skipped.
  - Plain grammar pairs are dropped, e.g. "de la", "lo que".
- `W`: 9,033 single words that have a register label (colloquial, slang, vulgar, offensive, humorous…) or a place label (Panama, Mexico, Spain…). `primary` = every meaning of the word is labelled.

**`es-xf.json`** (2.2 MB, 0.34 MB compressed): 92k forms the app couldn't resolve before.
- Covers forms of common words and every form of the expression verbs, e.g. fuese → ir, ponte → poner, pares → par|parar.

## Coverage (measured 14 Nov 2026 on the app's own Spanish: lessons, readings, podcasts, exams, grammar data; 91,910 words)

| Measure | Before | After |
|---|---|---|
| Words with a dictionary entry | 97.5% | 98.3% |
| Expressions recognised | 24 | 3,538 (853 different) |

The words still unknown are almost all names of people and places.

## How the app uses it

**Finding expressions** (`xpFind`):
- The first word is matched by any of its base forms: "echó una mano" → echar una mano, "me puse las pilas" → ponerse las pilas.
- Reflexive expressions need their pronoun, either before the verb or attached to it.
- Two-word expressions made of everyday words ("y qué" = so what?, "se puede" = may I?, "ser de", "tela de") count only when said on their own.

**Where it shows up:**
- **Verbatim** (Reading, Listening): the expressions join the phrase list. Idioms and labelled expressions are trusted even when the sentence's English uses different words.
- **Word cards** (reading and video): "Expression: meter la pata · to mess up · colloquial" with a Wiktionary example, plus informal or regional meanings of the word. Places are listed Panama-first.
- **Video and song captions:**
  - Informal or regional expressions of 2–4 words are coloured as one unit.
  - Words that are only informal and aren't common dictionary words are coloured as slang.
- **Profe:** "what does … mean" answers expressions of up to 6 words and informal words, with labels and an example.
- **Words › Informal:** adds Panama's words and expressions from the bank, minus vulgar ones.

**Loading:** the bank is fetched quietly 6 s after start, or the first time something needs it. It is then cached for offline use.

## Known limits
- Wiktionary is thin on Panama: 12 expressions and 236 words. The app's own Panama list (53 entries) and slang list stay on top. A curated Panamanian list is the next step.
- Wiktionary's sense order can pick a rarer meaning for an expression; the risky-pair rule removes the common false hits.

## Tests
`tools/profe-tests/wordbank-test.js` (19 checks):
- expressions found in real sentences, in any verb form
- no false hits in a plain sentence
- word cards, Profe, the chat answer
- video colouring and its card
