# Video captions brief — a reading window under every video

**Goal:** under the video, a caption window that reads along with what's being said, in the same style as the Listen and Reading pages, so you can read, listen, or both. Only videos that play inside the app are listed.

**Where the captions come from (free, no keys)**
- The video's own Spanish captions on YouTube (made by the channel, or YouTube's automatic ones), fetched by the Android app the same way the open-source transcript tools do (YouTube's player data → the caption track with its timings). Browsers block this for websites, so on iPhone and the web the window explains that and YouTube's subtitles stay on the video.
- English lines: YouTube's own English translation of the same track (same timings); if there isn't one, the app's translator (offline on Android).
- Song lyrics are never written into the app: for music, the window shows YouTube's own caption track while you watch, like YouTube's subtitles.

**The window**
- Sits below the player and controls. Each caption line starts on its own line with a blank line between lines; with English on, the English line follows directly under its Spanish line (no blank line).
- Lines glide up as the video plays; the line being said sits near the top, earlier lines slide up and fade out of the window, later lines come in from the bottom.
- In sync with the video: the current line is highlighted, and the current word too (word timings when YouTube has them, otherwise spread across the line). Uses the player's clock, smoothed between updates; jumps, pauses, speed changes and the replay loop follow straight away.
- Controls: English lines on/off; "Just listen" hides the text (window stays, lines blurred); both remembered.
- Tap a line's time to jump there. Tap any word: the video pauses and a card shows its meaning, with "Catch it" to add it to your words; closing the card resumes.

**Informal words**
- Colloquial, informal and slang words and jargon are shown in a different colour, with a small key above the window.
- Tapping one says what it is: a shortened form of a regular word (pa' → para, na' → nada, to' → todo, cansao → cansado, 'tá → está) or an informal/slang word with its meaning and where it's used (chévere, güey, parce, xopá, mola, chamo…), or jargon (golazo, borrasca…).

**The list**
- Only videos that play inside the app. Videos YouTube marks as not embeddable are removed (checked with YouTube's oEmbed: 401 = not allowed). If one still fails on the phone, it is taken off the list automatically, no separate section.
- Music adds Thiago Navarro's 4 most-viewed songs (view counts from his official channels' YouTube feeds).

**Done when** the window, glide, sync (play, pause, seek, loop, speed), English toggle, Just listen, word cards, informal-word colouring and the playable-only list are covered by automated tests with a simulated player and simulated captions, the earlier tests pass, and the Android code builds. Real caption fetching is checked on the phone (YouTube blocks the test servers).

## Revision 2 — sentences, punctuation and cue tips

- **Cue tips:** a small English bubble sits above the word being said and follows the speech word by word (the same cue tips as Reading and Listening, with the same meanings and phrases; little words like *de*, *el* are skipped ahead). Informal words show their meaning (pa' → for). A "Cue tips" button in the window turns them on or off; it is the same setting as in Reading and Listening.
- **No timing buttons** beside the lines.
- **One sentence per line**, a blank line before the next sentence (English sentence line, when on, directly under its Spanish sentence). Caption fragments are regrouped into sentences.
- **Punctuation:** captions that have it (made by the channel) are split at . ? ! …. YouTube's automatic captions have none, so the app adds it: a new sentence at each clear pause in speech (YouTube's word timings), long runs split at their longest pause; capital letter at the start; ¿…? when the sentence starts with a question word (qué, cómo, dónde, cuándo, cuál, quién, cuánto, por qué) or ends with ¿verdad? / ¿no?; full stop otherwise; commas after openers (bueno, pues, entonces, oye, mira, hola, sí, no…) and before pero / porque / aunque. The note under the window says the punctuation was added by the app.
- **English sentence lines:** each sentence translated whole (the app's translator, offline on Android), or the channel's English captions for that stretch when the captions were made by the channel.
- Sync stays word-accurate: word timings from YouTube, or spread across the caption line when it has none.
