# Panamanian Spanish: a curated list

## Why
Wiktionary has only about 250 Panamanian entries. This list adds the slang and expressions people in Panama actually use, each with a plain English meaning, a register and, for many, an example.

## Content
`tools/panama_words.json` holds 155 entries (27 expressions, 56 with an example), each `[term, English, register, colour, example, variants]`.
- **Register:**
  - `col`: colloquial
  - `slg`: street slang
  - `rude`
  - `reg`: regional within Panama (Chiriquí, Azuero)
  - `std`: a standard word with a Panamanian meaning, e.g. chino = corner shop, real = five cents
- **Colour** (`c: 1`): only distinctive words are coloured in captions. Everyday words with a Panama meaning (chino, real, vaina, limpio) are explained in cards but never coloured.
- **Left out on purpose:** sexual terms and slurs.
- **Sources:** every meaning was written for this app and checked against at least two of:
  - Día a Día, "conoce a fondo la jerga panameña"
  - PortalPanamá
  - Detalles de Panamá
  - Lingo To Go
  - Language Learning Institute's Panamanian Spanish guide

## How the app uses it
The list is built into the page by `patch_wordbank.py` (it's small), so it works even before the word bank downloads.
- **Captions:** words that are only Panamanian (chantin, buco, chuleta…) are coloured as informal, marked "Panama".
- **Word bank:** the expressions join the bank, so "le metió un bate", "echar pa'lante" and "arroz con mango" are found in any verb form, used by Verbatim and coloured in captions.
- **Word cards:** "🇵🇦 In Panama: …" with an example, shown ahead of other meanings.
- **Profe:** "what does qué xopá mean" is answered from this list first.
- **Words › Informal:** shows these words alongside the app's own list.

## Tests
4 checks in `tools/profe-tests/wordbank-test.js`:
- Profe's answers
- expressions found in sentences
- colouring of distinctive vs everyday words
- the "chino" word card
