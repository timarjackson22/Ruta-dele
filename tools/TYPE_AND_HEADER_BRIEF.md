# Type system, classic headline card, all-caps captions

**1. All-caps captions (Videos).** Songs often caption in CAPITALS. Every word looked like an acronym, so Verbatim echoed the words back instead of translating them. Fix: a caption that is mostly capitals is shown as a normal sentence (lower case, capital at the start) and its words are looked up as usual; an all-capitals word counts as an acronym only when it isn't an ordinary word (BBC stays BBC; SOL in a shouted line is "sun"). When the sentence's English says "little hug", the bubble for *abracito* says "little hug" too.

**2. Fonts for reading, focus and looks, across the app.**
- Research (Wallace et al., ACM TOCHI 2022; Adobe/Readability Matters) finds no single best font: people read fastest in their own best one (about a third faster, same comprehension). So: strong defaults, and the reading-font choice stays in Settings.
- **Interface: Inter**, made for screens, clear at small sizes; replaces each phone's system font so iPhone and Android look the same.
- **Titles and reading: Literata**, a classic book serif drawn for long reading on screens (Google Play Books), with optical sizes from text to display, so a big headline and the body text are one family. Default reading font becomes Literata ("Book") unless you've chosen another; Easy-read (Atkinson Hyperlegible) and Clean (Inter) stay as options.
- One font request for all three, loaded once.

**3. Classic headline card (Reading & Listening).**
- Parchment tones with a fine paper grain, a thin double rule like a book plate, a small accent rule in the text type's colour.
- Chips as small spaced capitals in thin outlined labels; an outlined emblem icon.
- Title in Literata, generous size; subtitle in Literata italic.
- A landscape band along the bottom: distant mountains, nearer hills in earth and sage tones, a waterline with gentle waves (water, mountains, earth), in light and dark versions.
- Frozen while reading: the title stays large (about 1.3–1.6rem, up to two lines), the landscape shrinks to the waterline, progress line kept.

**Done when** caps captions translate (with a test), the card is checked in light and dark and while frozen, titles are ≥20px when frozen, layout scans stay clean on two phone sizes with the new fonts, and earlier tests pass.
