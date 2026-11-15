"""Reading & Listening title pane v3 (tools/TITLE_PANE_BRIEF.md): never collapses; borderless, edge to edge; its bottom is the top of
the text; the word being read stays about half an inch below it; a valley with a flowing stream; optional soft stream sound."""
import sys
p = sys.argv[1]; s = open(p, encoding="utf-8").read()
if "lh-valley" in s: sys.exit("already patched")
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, ("anchor", a[:90], s.count(a)); s = s.replace(a, b)
OLD = """<svg class="lh-land" viewBox="0 0 400 70" preserveAspectRatio="none" aria-hidden="true"><path class="m1" d="M0 46 L28 32 L52 40 L86 16 L118 38 L150 26 L178 40 L214 12 L250 36 L284 24 L316 38 L352 20 L400 36 V70 H0Z"/><path class="m2" d="M0 54 C36 42 74 50 112 44 C160 36 198 52 248 47 C298 42 340 52 400 45 V70 H0Z"/><path class="e1" d="M0 58 C60 53 120 59 190 56 C260 53 330 59 400 56 V70 H0Z"/><rect class="w1" x="0" y="61" width="400" height="9"/><path class="w2" d="M0 63.5 q12 -2 24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0"/></svg>"""
# a valley between two ridges; the stream rises in the valley and widens toward you, its surface moving
NEW = ('<svg class="lh-land lh-valley" viewBox="0 0 400 90" preserveAspectRatio="none" aria-hidden="true">'
       '<path class="m1" d="M0 26 L34 14 L70 30 L104 18 L140 40 L172 52 L200 60 L228 52 L262 38 L296 16 L332 30 L366 12 L400 24 V90 H0Z"/>'
       '<path class="m2" d="M0 50 C44 38 104 46 156 62 C176 68 190 71 200 72 C210 71 224 68 244 62 C296 46 356 38 400 50 V90 H0Z"/>'
       '<path class="e1" d="M0 72 C70 66 140 72 186 75 L200 76 L214 75 C260 72 330 66 400 72 V90 H0Z"/>'
       '<path class="w1" d="M197 72 C193 76 210 79 205 83 C198 87 176 89 148 90 L262 90 C238 89 222 87 222 83 C223 78 206 76 203 72 Z"/>'
       '<path class="fl f1" d="M199 73 C196 77 211 80 206 84 C201 87 186 89 170 90"/>'
       '<path class="fl f2" d="M201 73 C203 77 218 80 215 84 C212 87 220 89 236 90"/>'
       '<path class="fl f3" d="M200 74 C199 78 213 81 210 85 C207 88 200 89 202 90"/>'
       '</svg>')
rep(OLD, NEW)
CSS = r'''
/* ===== title pane v3: never collapses, borderless, edge to edge; the text starts at its bottom edge ===== */
#litem .lhead { border: 0 !important; border-radius: 0 !important; box-shadow: none !important; margin-left: calc(50% - 50vw); margin-right: calc(50% - 50vw); padding: 10px calc(50vw - 50% + 16px) 50px !important; margin-top: -8px; margin-bottom: 0 }
#litem .lhead::before { display: none }
body:has(#litem) { overflow-x: clip }
#litem .lh-land { height: 46px; transition: none }
/* at most a quarter of the screen: compact chips, title up to two lines, subtitle one line */
#litem .lh-top { gap: 8px; align-items: center } #litem .lh-chips { gap: 5px } #litem .lh-chip { font-size: 9.5px; padding: 1px 6px } #litem .lh-ic { width: 26px !important; height: 26px !important } #litem .lh-ic svg { width: 14px !important; height: 14px !important }
#litem .lh-sub { font-size: .86rem !important; margin: 2px 0 0 !important; white-space: nowrap; overflow: hidden; text-overflow: ellipsis }
#litem .lhead .ltitle { display: -webkit-box !important; -webkit-box-orient: vertical !important; -webkit-line-clamp: 2 !important; overflow: hidden !important }
#litem .lh-chips { flex: 1; min-width: 0; flex-wrap: nowrap !important; overflow: hidden; mask-image: linear-gradient(90deg, #000 85%, transparent) }
#litem .lh-chip { flex: none }
@media (max-height: 760px) { #litem .lh-sub { display: none !important } #litem .lhead .ltitle { -webkit-line-clamp: 1 !important; margin: 6px 0 0 !important }
  #litem .lhead, body.lplaying #litem .lhead { padding-top: 8px !important; padding-bottom: 36px !important } #litem .lh-land, body.lplaying #litem .lh-land { height: 32px !important } #litem .lprog { margin-top: 4px !important } }
@media (max-height: 620px) { #litem .lhead .ltitle { font-size: 1.12rem !important; margin: 4px 0 0 !important } #litem .lhead, body.lplaying #litem .lhead { padding-bottom: 30px !important } #litem .lh-land, body.lplaying #litem .lh-land { height: 26px !important } #litem .lamb { width: 28px; height: 28px; font-size: 14px } #litem .lh-ic { width: 22px !important; height: 22px !important } }
.lamb { margin-left: auto; flex: none; width: 34px; height: 34px; border-radius: 50%; border: 1px solid color-mix(in srgb, var(--rule) 70%, transparent); background: color-mix(in srgb, var(--par1) 70%, transparent); font-size: 16px; line-height: 1; display: grid; place-items: center; cursor: pointer }
.lamb + .lh-opts { margin-left: 6px }
/* frozen while reading: the same pane, stuck under the top bar; nothing shrinks or hides */
body.lplaying #litem .lhead { position: sticky; top: var(--hdrH, 56px); z-index: 6; padding: 10px calc(50vw - 50% + 16px) 50px !important; border-radius: 0 !important; box-shadow: none !important }
#litem .lhead .ltitle { font-size: clamp(1.25rem, 5.2vw, 1.65rem) !important; line-height: 1.2 !important; margin: 8px 0 2px !important; font-variation-settings: "opsz" 40 }
body.lplaying #litem .lhead .ltitle { font-size: clamp(1.25rem, 5.2vw, 1.65rem) !important; line-height: 1.2 !important; margin: 8px 0 2px !important }
body.lplaying #litem .lh-sub { display: block }

body.lplaying #litem .lh-land { height: 46px !important } body.lplaying #litem .lh-land .m1 { opacity: .55 !important }
/* lines fade as they reach the pane, never while they're being read (the spoken word sits ~half an inch below) */
body.lplaying #litem .lhead::after { content: none !important; display: none !important }
/* same height playing or paused: the progress line and the Options button keep their places */
#litem .lprog { display: block !important; visibility: hidden; margin-top: 6px !important; position: relative; z-index: 1 } body.lplaying #litem .lprog { visibility: visible }
body.lplaying #litem .lh-opts { display: inline-flex !important; visibility: hidden }
/* the stream flows */
.lh-valley .w1 { fill: var(--w1); opacity: .95 }
.lh-valley .fl { fill: none; stroke: var(--w2); stroke-width: .9; stroke-linecap: round; stroke-dasharray: 2.5 5.5; opacity: .85; animation: lhflow 2.6s linear infinite }
.lh-valley .f2 { animation-duration: 3.3s; opacity: .7 } .lh-valley .f3 { animation-duration: 2.1s; stroke-dasharray: 1.5 7; opacity: .6 }
body.lplaying .lh-valley .fl { animation-duration: 1.7s } body.lplaying .lh-valley .f2 { animation-duration: 2.2s } body.lplaying .lh-valley .f3 { animation-duration: 1.4s }
@keyframes lhflow { to { stroke-dashoffset: -32 } }
@media (prefers-reduced-motion: reduce) { .lh-valley .fl { animation: none } }

'''
k = s.rindex("</style>", 0, s.index("</head>")); s = s[:k] + CSS + s[k:]
# the read-along glide: the spoken word ~48 px (half an inch) below the title pane, not a third of the way down the screen
rep('''      const want = innerHeight * 0.3, d = rr.top + span * f - want;''',
    '''      const pane = document.body.classList.contains("lplaying") ? document.querySelector("#litem .lhead") : null, spw = k >= 0 ? ws[k] : null;
      const want = pane ? pane.getBoundingClientRect().bottom + 48 : innerHeight * 0.3, d = (spw ? spw.getBoundingClientRect().top : rr.top + span * f) - want;''')
rep('''if (r.top < 90 || r.bottom > innerHeight - (UI.cues !== false ? 260 : 170)) followTo(el); } }''',
    '''const pane = document.body.classList.contains("lplaying") ? document.querySelector("#litem .lhead") : null, top = pane ? pane.getBoundingClientRect().bottom + 48 : 90;
      if (r.top < top || r.bottom > innerHeight - (UI.cues !== false ? 260 : 170)) { if (pane && !FOL.free) scrollTo({ top: Math.max(0, scrollY + r.top - top), behavior: "smooth" }); else followTo(el); } } }''')
# the soft sound of a stream while the text is read (made in the page: no file, nothing downloaded); on/off in the player's ▾ menu
rep('''  function lhState() {''', '''  // background sound while the text is read, made in the page (no files): a gentle stream, birdsong, or nothing; switch at the top of the pane
  const LSA = { c: null, g: null, mode: null, tm: null };
  const lAmb = () => (UI.amb === "birds" || UI.amb === "off" ? UI.amb : "stream");
  const LAMB = { stream: ["🌊", "Background sound: gentle stream. Tap for birdsong"], birds: ["🐦", "Background sound: birdsong. Tap to turn it off"], off: ["🔇", "Background sound off. Tap for a gentle stream"] };
  const lambHTML = () => '<button type="button" class="lamb" data-act="l-amb" aria-label="' + LAMB[lAmb()][1] + '" title="' + LAMB[lAmb()][1] + '">' + LAMB[lAmb()][0] + "</button>";
  function lNoise(c, sec) { const n = c.sampleRate * sec, buf = c.createBuffer(2, n, c.sampleRate); for (let ch = 0; ch < 2; ch++) { const d = buf.getChannelData(ch); let b = 0; for (let i = 0; i < n; i++) { b = (b + 0.02 * (Math.random() * 2 - 1)) / 1.02; d[i] = b * 3.5; } } return buf; }
  function lChirp(c, out) { // one little phrase of 2–5 notes, high and short, at a random pitch
    const t0 = c.currentTime + 0.05, f = 2600 + Math.random() * 1600, k = 2 + Math.floor(Math.random() * 4);
    for (let i = 0; i < k; i++) { const o = c.createOscillator(), g = c.createGain(), t = t0 + i * (0.09 + Math.random() * 0.05), d = 0.06 + Math.random() * 0.05; o.type = "sine";
      o.frequency.setValueAtTime(f * (0.9 + Math.random() * 0.2), t); o.frequency.exponentialRampToValueAtTime(f * (1.15 + Math.random() * 0.35), t + d);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.5, t + 0.012); g.gain.exponentialRampToValueAtTime(0.001, t + d); o.connect(g); g.connect(out); o.start(t); o.stop(t + d + 0.02); } }
  function lStream(on) {
    const mode = on && !document.hidden ? lAmb() : "off";
    if (mode === LSA.mode) return;
    if (LSA.c) { const c = LSA.c, g = LSA.g; clearTimeout(LSA.tm); LSA.c = null; try { g.gain.cancelScheduledValues(c.currentTime); g.gain.setValueAtTime(g.gain.value, c.currentTime); g.gain.linearRampToValueAtTime(0, c.currentTime + 0.8); setTimeout(() => { try { c.close(); } catch (e) {} }, 1000); } catch (e) {} }
    LSA.mode = mode; if (mode === "off") return;
    try { const C = window.AudioContext || window.webkitAudioContext; if (!C) return; const c = new C(), g = c.createGain(); g.gain.value = 0; g.connect(c.destination);
      // the stream: soft low water, slowly rising and falling (much quieter and duller than before)
      const src = c.createBufferSource(); src.buffer = lNoise(c, 8); src.loop = true; const hp = c.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 110; const lp = c.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 520; lp.Q.value = 0.3;
      const bed = c.createGain(); bed.gain.value = mode === "birds" ? 0.35 : 1; const lfo = c.createOscillator(); lfo.frequency.value = 0.09; const lg = c.createGain(); lg.gain.value = 0.18; lfo.connect(lg); lg.connect(bed.gain); lfo.start();
      src.connect(hp); hp.connect(lp); lp.connect(bed); bed.connect(g); src.start();
      g.gain.setValueAtTime(0, c.currentTime); g.gain.linearRampToValueAtTime(mode === "birds" ? 0.02 : 0.016, c.currentTime + 2.5);
      LSA.c = c; LSA.g = g;
      if (mode === "birds") { const birds = c.createGain(); birds.gain.value = 0.045; birds.connect(c.destination); const sing = () => { if (LSA.c !== c) return; lChirp(c, birds); LSA.tm = setTimeout(sing, 1400 + Math.random() * 4200); }; LSA.tm = setTimeout(sing, 900); }
    } catch (e) {}
  }
  window.__lStream = () => !!LSA.c; window.__lAmb = () => LSA.mode;
  document.addEventListener("visibilitychange", () => { if (document.hidden) lStream(false); });
  addEventListener("hashchange", () => lStream(false));
  document.addEventListener("click", (e) => { const t = e.target.closest && e.target.closest('[data-act="l-amb"]'); if (!t) return; UI.amb = { stream: "birds", birds: "off", off: "stream" }[lAmb()]; try { uiSave(); } catch (x) {} t.outerHTML = lambHTML(); try { lStream(PL.playing && !!document.getElementById("litem")); } catch (x) {} });
  function lhState() {
    try { lStream(typeof PL !== "undefined" && PL.playing && !!document.getElementById("litem")); } catch (e) {}''')
# the sound switch sits in the pane's top row
rep('''      (opts ? '<button class="lh-opts" data-act="lh-opts"''', '''      lambHTML() + (opts ? '<button class="lh-opts" data-act="lh-opts"''')
open(p, "w", encoding="utf-8").write(s)
print("pane ok")
