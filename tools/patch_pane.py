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
#litem .lhead { border: 0 !important; border-radius: 0 !important; box-shadow: none !important; margin-left: calc(50% - 50vw); margin-right: calc(50% - 50vw); padding: 16px calc(50vw - 50% + 16px) 92px !important; margin-top: -8px; margin-bottom: 0 }
#litem .lhead::before { display: none }
body:has(#litem) { overflow-x: clip }
#litem .lh-land { height: 86px; transition: none }
/* frozen while reading: the same pane, stuck under the top bar; nothing shrinks or hides */
body.lplaying #litem .lhead { position: sticky; top: var(--hdrH, 56px); z-index: 6; padding: 16px calc(50vw - 50% + 16px) 92px !important; border-radius: 0 !important; box-shadow: none !important }
#litem .lhead .ltitle { font-size: clamp(1.7rem, 7vw, 2.4rem) !important; line-height: 1.2 !important }
body.lplaying #litem .lhead .ltitle { font-size: clamp(1.7rem, 7vw, 2.4rem) !important; line-height: 1.2 !important; margin: 14px 0 6px !important; display: block !important; -webkit-line-clamp: unset !important; overflow: visible !important }
body.lplaying #litem .lh-sub { display: block !important }
body.lplaying #litem .lh-ic { width: 32px !important; height: 32px !important } body.lplaying #litem .lh-ic svg { width: 18px !important; height: 18px !important }
body.lplaying #litem .lh-land { height: 86px !important } body.lplaying #litem .lh-land .m1 { opacity: .55 !important }
/* lines fade as they reach the pane, never while they're being read (the spoken word sits ~half an inch below) */
body.lplaying #litem .lhead::after { content: none !important; display: none !important }
/* same height playing or paused: the progress line and the Options button keep their places */
#litem .lprog { display: block !important; visibility: hidden; margin-top: 8px !important; position: relative; z-index: 1 } body.lplaying #litem .lprog { visibility: visible }
body.lplaying #litem .lh-opts { display: inline-flex !important; visibility: hidden }
/* the stream flows */
.lh-valley .w1 { fill: var(--w1); opacity: .95 }
.lh-valley .fl { fill: none; stroke: var(--w2); stroke-width: .9; stroke-linecap: round; stroke-dasharray: 2.5 5.5; opacity: .85; animation: lhflow 2.6s linear infinite }
.lh-valley .f2 { animation-duration: 3.3s; opacity: .7 } .lh-valley .f3 { animation-duration: 2.1s; stroke-dasharray: 1.5 7; opacity: .6 }
body.lplaying .lh-valley .fl { animation-duration: 1.7s } body.lplaying .lh-valley .f2 { animation-duration: 2.2s } body.lplaying .lh-valley .f3 { animation-duration: 1.4s }
@keyframes lhflow { to { stroke-dashoffset: -32 } }
@media (prefers-reduced-motion: reduce) { .lh-valley .fl { animation: none } }
#pmenu .lstream[aria-pressed="true"] { background: color-mix(in srgb, var(--w1) 22%, transparent) }
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
rep('''  function lhState() {''', '''  const LSA = { c: null, g: null };
  function lStream(on) {
    on = !!on && UI.stream !== false && !document.hidden;
    if (on && !LSA.c) { try { const C = window.AudioContext || window.webkitAudioContext; if (!C) return; const c = new C(), n = c.sampleRate * 6, buf = c.createBuffer(2, n, c.sampleRate);
        for (let ch = 0; ch < 2; ch++) { const d = buf.getChannelData(ch); let b = 0; for (let i = 0; i < n; i++) { b = (b + 0.02 * (Math.random() * 2 - 1)) / 1.02; d[i] = b * 3.5; } }
        const src = c.createBufferSource(); src.buffer = buf; src.loop = true;
        const hp = c.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 160; const lp = c.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 1000;
        const lfo = c.createOscillator(); lfo.frequency.value = 0.21; const lg = c.createGain(); lg.gain.value = 260; lfo.connect(lg); lg.connect(lp.frequency); lfo.start();
        const bp = c.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 2600; bp.Q.value = 1.2; const tg = c.createGain(); tg.gain.value = 0.25; const lfo2 = c.createOscillator(); lfo2.frequency.value = 1.7; const l2 = c.createGain(); l2.gain.value = 0.18; lfo2.connect(l2); l2.connect(tg.gain); lfo2.start();
        const g = c.createGain(); g.gain.value = 0; src.connect(hp); hp.connect(lp); lp.connect(g); src.connect(bp); bp.connect(tg); tg.connect(g); g.connect(c.destination); src.start();
        g.gain.setValueAtTime(0, c.currentTime); g.gain.linearRampToValueAtTime(0.045, c.currentTime + 2); LSA.c = c; LSA.g = g; } catch (e) {} }
    else if (!on && LSA.c) { const c = LSA.c, g = LSA.g; LSA.c = null; try { g.gain.cancelScheduledValues(c.currentTime); g.gain.setValueAtTime(g.gain.value, c.currentTime); g.gain.linearRampToValueAtTime(0, c.currentTime + 0.7); setTimeout(() => { try { c.close(); } catch (e) {} }, 900); } catch (e) {} }
  }
  window.__lStream = () => !!LSA.c;
  document.addEventListener("visibilitychange", () => { if (document.hidden) lStream(false); });
  addEventListener("hashchange", () => lStream(false));
  document.addEventListener("click", (e) => { const t = e.target.closest && e.target.closest('[data-act="l-stream"]'); if (!t) return; UI.stream = UI.stream === false; try { uiSave(); } catch (x) { try { localStorage.setItem("rd-ui", JSON.stringify(UI)); } catch (y) {} } t.setAttribute("aria-pressed", String(UI.stream !== false)); t.textContent = "Stream sound: " + (UI.stream !== false ? "on" : "off"); try { lStream(PL.playing && !!document.getElementById("litem")); } catch (x) {} });
  function lhState() {
    try { const pm = document.getElementById("pmenu"); if (pm && !pm.querySelector(".lstream")) { const b = document.createElement("button"); b.type = "button"; b.className = "btn small lstream"; b.dataset.act = "l-stream"; b.setAttribute("aria-pressed", String(UI.stream !== false)); b.textContent = "Stream sound: " + (UI.stream !== false ? "on" : "off"); pm.appendChild(b); } } catch (e) {}
    try { lStream(typeof PL !== "undefined" && PL.playing && !!document.getElementById("litem")); } catch (e) {}''')
open(p, "w", encoding="utf-8").write(s)
print("pane ok")
