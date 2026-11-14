# Reading & Listening title pane v3: a living landscape that never collapses

**Requests:**
- Don't shrink the title pane when reading starts.
- No border, edge to edge.
- Its bottom edge *is* the top of the text pane.
- The words being read stay about **½ inch** below it, instead of disappearing under it while they're read.
- Seamless quality.
- Add a **valley**, make the stream look live and flowing, and add a low ambient sound of water running down a stream.

**Pane**
- Full width, from the left edge of the screen to the right; no border, rounded corners or shadow.
- The parchment texture stays; the title and chips line up with the text below.
- While reading it sticks under the top bar at **exactly the same size**: same title size, subtitle and landscape. Only its position changes.
- The text scrolls up beneath it, fading over the last ~26 px under the pane's edge (a soft edge, not a line).

**The line being read**
- The read-along glide aims at the **word being spoken**, kept 48 px (½ inch) below the pane's bottom edge, speed-limited, so it never jumps.
- Lines only fade after they've been read.
- Texts that move sentence by sentence scroll the same way.

**Landscape**
- Two ridges sloping into a valley, near hills, and earth.
- A stream rises in the valley and widens toward you.
- Its surface lines move continuously (faster while reading), and they stay still for people who've turned motion off in their phone's settings.
- Light and dark versions use the existing palette.

**Stream sound**
- Generated in the page (filtered noise with slow ripples and a soft trickle), so there's no file to download.
- Very quiet (about 4–5% volume), fades in over 2 s.
- Plays only while the text is being read aloud. It stops on pause, on leaving the page, or when the app goes to the background.
- **Stream sound: on/off** in the player's ▾ menu, remembered.

**Done when**
- the pane's height is the same paused and reading
- it spans the full screen width with no border
- the spoken word stays 40–60 px below the pane while reading
- the stream animates (and not with reduced motion)
- the sound starts while reading and stops on pause or when switched off
- light and dark are checked by screenshot
- earlier tests pass, with the compact-strip checks replaced by these
