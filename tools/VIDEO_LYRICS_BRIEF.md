# Song videos: exact lyrics as captions

## Problem
On music videos, YouTube's automatic captions and the phone's speech recogniser both miss words: singing, instruments and echo defeat speech recognition. For songs, the most accurate captions are the published lyrics, timed line by line.

## Source
**LRCLIB** (lrclib.net): free, open, no key, CORS `*`.
- `GET /api/search?track_name=&artist_name=` returns `syncedLyrics` in LRC format (`[mm:ss.xx] line`).
- No paid service, and nothing about the learner is sent: only the song title and artist.

## Order of sources for a song
A video counts as a song when its category is Music, or when its title or channel looks like a song.
1. The channel's own captions (manual).
2. LRCLIB synced lyrics.
3. YouTube's automatic captions.
4. Captions from the audio.

## Choosing the recording
- **Query:** the title with "(en vivo)", "(official video)" and anything after " - " or " | " removed, plus the first credited artist. If nothing synced comes back, a free-text search follows.
- **Pick:** the synced result whose length is closest to the video's (the video's length comes from the caption fetch).
- **Intro guess:** if the video runs 2 to 40 s longer than the recording and the singing starts in the first 3 s, the difference is assumed to be an intro. Whenever the lengths differ by more than 2 s, the learner is asked "Words early or late?".

## Display
- One caption per sung line; words are spread across each line for the moving highlight.
- English comes from the existing translation.
- Source note: "The song's lyrics (LRCLIB: artist – title), timed to the recording."

## Videos you add
YouTube titles look like "Artist - Song (Official Video)" and channels like "ArtistVEVO". The app:
- removes the extras: Official Video, Letra, Lyrics, Visualizer, ft. …
- cleans channel names: VEVO, "- Topic", Official, Music
- tries both orders of the title's parts, putting first the part that matches the channel
- for videos you added, only accepts a recording within 30 s of the video's length

## Borrowed captions (Android app)
When LRCLIB has no lyrics for the song:
1. YouTube's public search (no key) is run for "song artist letra".
2. Only uploads of the same song (all words of one title part, at least half of the other's) and within 15 s of the video's length are considered.
3. The first one with captions typed by a person is used, with the same one-button sync.

The search parsing was checked on real YouTube results on 14 Nov 2026.

## Sync
Since 14 Nov 2026, **one button: "Sync with the video"**. The nudge and tap buttons were removed as too technical.
- **Sync with the video** (Android app):
  - Records the video's sound for up to 75 s and fuzzy-matches each recognised phrase to a lyric line (at least 50% of the words in common).
  - Once two matches agree within 1.5 s, the offset is set to their median and recording stops.
  - Nothing heard is saved as captions.
- If the sync hears nothing, the button becomes **"Tap when the singing starts"**.
- After a sync, the note says "synced ✓" and the button reads "Sync again".
- **Wrong song?** switches to the YouTube or audio captions; this is remembered per video.

## Tests
`tools/profe-tests/vlyrics-test.js` (20 checks, LRCLIB mocked):
- picking the recording
- per-line captions
- nudge, tap and auto-sync
- reopening uses the cache
- the opt-out
- a song with no YouTube captions
- spoken videos skipped
- LRCLIB unreachable

**Real data:** `tools/video_check.py lrcapp:ID~Artist~Title` runs the app's own query and choice on GitHub. 14 Nov 2026: 9 of 10 library songs have synced lyrics; Pasito a pasito has none and falls back to the other sources.
