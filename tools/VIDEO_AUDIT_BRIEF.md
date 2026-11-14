# Videos — audit and improvement brief

## Audit (what's wrong or weak today)
1. **Captions only exist when YouTube has them**; songs often have none, or only automatic ones that mishear slang.
2. **Caption noise:** YouTube's tags like [Música], [Aplausos], [Risas], ♪, >> show up as text.
3. **Ads:** the app resumes your last place automatically, so after a pre-roll ad the video doesn't start at 0:00; on some phones the ad's clock also moved the captions (caption copies saved before v135 have no video length, so the ad check couldn't work).
4. **Words with no meaning:** words heard in videos (above all slang in songs) that aren't in the dictionary show "Not in the app's dictionary yet".
5. **No home for informal words** in the Words list; the slang list only lives inside the caption window.
6. **Library:** three street interviews (one from a random channel) instead of real sit-down interviews; no Verano Rosa.
7. **Small frictions:** "Replay line" replays a fixed 5 s instead of the sentence; "0.75×" is unclear; cards don't say which videos have captions.

## Changes
**A. Captions from the audio (Android 13+).** "Captions from the audio" in the caption window: the app records its own playback sound (Android asks permission each session) and the phone's free on-device Spanish speech recogniser turns it into sentences, stamped with the video's time as they're spoken. They show live in the window and are saved, so next time the video has captions from the start (and Verbatim, word cards, informal colouring work on them). Offered when a video has no captions or only automatic ones; music makes recognition harder, so the window says how they were made.

**B. Clean captions.** Remove bracket/parenthesis tags ([Música], (risas)…), music notes, speaker markers (>>, -) and stray spaces before building sentences.

**C. Ads and starting at 0.** Every video starts at 0:00 (or its clip start); no automatic jump to your last place. A "Continue from m:ss" button appears instead when you'd stopped part-way. Ad check: another video ID, or a length that isn't the video's own (the length now always comes with the captions; saved caption copies without it are refreshed), plus YouTube's own ad signals when the player sends them. During an ad the captions stay at the start; when it ends, the video plays from 0:00 with the captions in step. A "Report a playback problem" link copies a short log of what the player reported, to send if anything still drifts.

**D. Every word in a video in the dictionary.** When a video's captions are first loaded (any video, including ones you add), the app runs a word check: every word is matched against the dictionary, the informal list and the shortening rules; the ones still unknown are translated with the app's translator (offline on Android) and saved as "video words" with the sentence they came from. Word cards and Verbatim use them, and a note says how many new words the video added.

**E. Informal words in Vocabulary.** Words › word types gets an "Informal" chip: all slang, shortened forms, expressions and jargon (with meaning and where they're used) plus the words learned from videos, searchable.

**F. More slang for songs.** Add common music/urban words (mami, papi, bebé, perreo, janguear, corillo, flow, rumbear, parche, vacilar, guaya, dale, fuego, mor…), each marked with its meaning and region; vulgar ones labelled.

**G. Library.** Replace three street interviews with sit-down interviews by BBC News Mundo (Joan Manuel Serrat, Mon Laferte, Fito Páez); add KAROL G & Feid's "Verano Rosa" (official visualizer, KarolGVEVO). All checked as playable in apps (YouTube oEmbed).

**H. Frictions.** Replay plays the current sentence when there are captions; speed button reads "Speed 1×" / "Speed 0.75×"; cards show "Captions" or "Captions from audio" once known.

**I. When a video is added:** the same pipeline runs (title, playable check by playing, captions or audio captions, cleaning, sentences, word check). For library additions, tools/video_check.py (GitHub workflow "Video check") confirms embedding and channel before an ID goes in.

**Done when** each part has automated tests (simulated player, captions, audio recogniser and translator), earlier tests pass, the Android app builds, and the parts that need a real phone (audio capture, real ads) are listed as checked there.
