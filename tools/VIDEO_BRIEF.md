# Video brief — watch Spanish videos in the app and practise with them

**Goal:** pick a Spanish video (from a starter list or any YouTube link you share or paste), watch it inside the app, and practise with it, with no paid services.

**Sources (free, no keys)**
- YouTube's official embedded player (youtube-nocookie domain), the free IFrame player API.
- Starter list of videos for learners. Content questions only where the content is known from published summaries. Every video gets the generic exercises.
- Your own videos: share a YouTube link to Ruta DELE from the YouTube app (Android), or paste a link (any phone). The title is fetched where the browser allows it; otherwise you name it.

**Where:** Practice › Videos (a list, so the menu shows). Each video opens its own page (menu tucked, back to Videos).

**The player**
- 16:9, full width; Spanish subtitles on by default (YouTube's own captions, when the video has them).
- Controls under the video: back 5 s, replay the last line (5 s loop), speed 0.75× / 1×, and "Catch a word".
- If the owner blocks embedding, say so and offer "Open in YouTube"; the exercises still work.

**Exercises**
1. **Catch words while you watch.** Pause, type what you heard; the app shows the meaning from its dictionary, saves the moment (tap to jump back), and can add it to a "Videos" flashcard deck.
2. **Shadowing.** Pick a caught phrase: the app replays that moment, then listens to you say it and scores your pronunciation against what you typed.
3. **Comprehension** (starter videos with known content): multiple-choice questions.
4. **Retell.** Write or say a short summary in Spanish, guided by ¿Quién? ¿Dónde? ¿Qué pasa? It's checked by the app's writing analyser, with one tap to have Profe review it.
5. **Progress.** Watched videos are marked, earn points and count for the day; the Videos list shows what you've watched and caught.

**Done when** the list, adding by link and by share, the player controls, every exercise, saving and progress are covered by automated tests against a simulated player (the real YouTube player can't be reached from the test environment), and the earlier tests still pass. Real playback is checked on the phone.
