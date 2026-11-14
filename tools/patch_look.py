"""Look and feel for focus and coming back: readable themes (contrast fixed), two new themes (Noche, Foco), a reading
font choice, theme-aware colours for the newer screens, small celebrations and optional sound effects."""
import sys
p = sys.argv[1]; s = open(p, encoding="utf-8").read()
if "function celebrate" in s: sys.exit("already patched")
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, ("anchor", a[:90], s.count(a)); s = s.replace(a, b)
# 1. accents that were too light for white text / links (WCAG AA 4.5:1)
for k, old, new in [("oceano", "#0a7bc2", "#086fb0"), ("arena", "#c0602a", "#a8501d"), ("rosa", "#d6457a", "#bf3166"), ("atardecer", "#e2572b", "#bf4317")]:
    rep(':root[data-pal="%s"][data-pal] {' % k, ':root[data-pal="%s"][data-pal] {' % k)
    i = s.index(':root[data-pal="%s"][data-pal] {' % k); j = s.index("}", i)
    s = s[:i] + s[i:j].replace("--cobalt: " + old, "--cobalt: " + new) + s[j:]
    rep('%s:{n:' % k, '%s:{n:' % k)
    i = s.index('%s:{n:' % k); j = s.index("}", i); s = s[:i] + s[i:j].replace('ti:"' + old + '"', 'ti:"' + new + '"') + s[j:]
# 2. two new themes: Noche (night reading, warm and low in blue light) and Foco (quiet, near-white, one calm accent)
rep('cafe:{n:"Café",m:"dark",bg:"#1e1611",su:"#2a1f18",ink:"#f3e9df",ti:"#e8a86a",sa:"#f0ba45"}};',
    'cafe:{n:"Café",m:"dark",bg:"#1e1611",su:"#2a1f18",ink:"#f3e9df",ti:"#e8a86a",sa:"#f0ba45"},noche:{n:"Noche",m:"dark",bg:"#121110",su:"#1c1a18",ink:"#ece4d8",ti:"#e6a35c",sa:"#d9a441"},foco:{n:"Foco",m:"light",bg:"#f7f7f4",su:"#ffffff",ink:"#1d1d1f",ti:"#0f6e66",sa:"#c98a12"}};')
NEW = ''':root[data-pal="noche"][data-pal] { --bg: #121110; --surface: #1c1a18; --surface-2: #262320; --ink: #ece4d8; --muted: #b3a896; --line: #353029; --cobalt: #e6a35c; --on-cobalt: #121110; --saffron: #d9a441; --saffron-soft: #3a2e1a; --tile-c: #121110; color-scheme: dark; --h1: #9a6332; --h2: #4a2e16 }
:root[data-pal="foco"][data-pal] { --bg: #f7f7f4; --surface: #ffffff; --surface-2: #ececE7; --ink: #1d1d1f; --muted: #5d5d63; --line: #dfdfd8; --cobalt: #0f6e66; --on-cobalt: #ffffff; --saffron: #c98a12; --saffron-soft: #f6ecd2; --tile-c: #f7f7f4; color-scheme: light; --h1: #15847a; --h2: #0b4f49 }
'''.replace("#ececE7", "#ececE7".lower())
i = s.index(':root[data-pal="cafe"][data-pal]'); j = s.index("\n", i) + 1; s = s[:j] + NEW + s[j:]

# 3. reading font + sound effects in Settings › Display
rep('''      '<p class="setl">Translation cue tips <span class="muted small">· Reading and Listening</span></p>' +''',
    '''      '<p class="setl">Reading font <span class="muted small">· texts, lessons and cards</span></p>' + seg("ui-rf", UI.rf || "clean", [["clean", "Clean"], ["book", "Book"], ["easy", "Easy-read"]]) +
      '<p class="setl">Sound effects <span class="muted small">· right and wrong answers</span></p>' + seg("ui-sfx", UI.sfx === false ? "off" : "on", [["on", "On"], ["off", "Off"]]) +
      '<p class="setl">Translation cue tips <span class="muted small">· Reading and Listening</span></p>' +''')
rep('''    else if (a === "ui-fs") {''', '''    else if (a === "ui-rf") { UI.rf = t.dataset.v; uiSave(); t.parentElement.querySelectorAll(".btn").forEach((b) => b.setAttribute("aria-pressed", b === t)); }
    else if (a === "ui-sfx") { UI.sfx = t.dataset.v === "on"; uiSave(); t.parentElement.querySelectorAll(".btn").forEach((b) => b.setAttribute("aria-pressed", b === t)); if (UI.sfx) sfx(true); }
    else if (a === "ui-fs") {''')
rep('''    if (P) { R.dataset.pal = UI.pal; R.dataset.theme = P.m; }''', '''    R.dataset.rf = UI.rf || "clean";
    if (UI.rf === "book" || UI.rf === "easy") { const id = "rf-font"; if (!document.getElementById(id)) { const l = document.createElement("link"); l.id = id; l.rel = "stylesheet"; l.href = "https://fonts.googleapis.com/css2?family=Literata:opsz,wght@7..72,400..700&family=Atkinson+Hyperlegible:wght@400;700&display=swap"; document.head.appendChild(l); } }
    if (P) { R.dataset.pal = UI.pal; R.dataset.theme = P.m; }''')

# 4. celebrations and sound effects
FX = r'''
  /* ---------- small rewards: confetti and sounds (quiet, short, can be turned off) ---------- */
  let SFXC = null;
  function sfx(ok) {
    if (UI.sfx === false) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return; SFXC = SFXC || new AC(); const c = SFXC, t = c.currentTime;
      const notes = ok ? [[659.3, 0], [987.8, 0.09]] : [[220, 0], [196, 0.11]];
      notes.forEach(([f, d]) => { const o = c.createOscillator(), g = c.createGain(); o.type = ok ? "sine" : "triangle"; o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, t + d); g.gain.exponentialRampToValueAtTime(ok ? 0.12 : 0.07, t + d + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t + d + (ok ? 0.28 : 0.22));
        o.connect(g); g.connect(c.destination); o.start(t + d); o.stop(t + d + 0.3); });
    } catch (e) {}
  }
  function celebrate(big) {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cv = document.createElement("canvas"); cv.className = "confetti"; cv.width = innerWidth * devicePixelRatio; cv.height = innerHeight * devicePixelRatio; document.body.appendChild(cv);
    const x = cv.getContext("2d"), cs = getComputedStyle(document.documentElement), col = ["--cobalt", "--saffron", "--good"].map((v) => cs.getPropertyValue(v).trim() || "#e0a01a").concat(["#ff6b8a", "#3fa0ff"]);
    const N = big ? 120 : 60, P = []; for (let i = 0; i < N; i++) P.push({ x: innerWidth * (0.2 + Math.random() * 0.6), y: innerHeight * 0.35, vx: (Math.random() - 0.5) * 9, vy: -Math.random() * 11 - 4, r: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.3, w: 6 + Math.random() * 6, h: 4 + Math.random() * 4, c: col[i % col.length] });
    const t0 = performance.now(), D = big ? 1900 : 1400;
    const tick = (now) => { const e = now - t0; x.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0); x.clearRect(0, 0, innerWidth, innerHeight); x.globalAlpha = Math.max(0, 1 - Math.max(0, e - D * 0.6) / (D * 0.4));
      P.forEach((p) => { p.vy += 0.32; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr; x.save(); x.translate(p.x, p.y); x.rotate(p.r); x.fillStyle = p.c; x.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); x.restore(); });
      if (e < D) requestAnimationFrame(tick); else cv.remove(); };
    requestAnimationFrame(tick);
  }
'''
rep('''  function actAdd(n) {''', FX + '''  function actAdd(n) {''')
rep('''    const g = S.goal || 20; if (before < g && S.act[k] >= g) coachToast(''', '''    const g = S.goal || 20; if (before < g && S.act[k] >= g) setTimeout(() => celebrate(true), 200); if (before < g && S.act[k] >= g) coachToast(''')
rep('''    try { actAdd(r.ok ? 2 : 1); if (!r.ok''', '''    try { sfx(r.ok); } catch (e) {} try { actAdd(r.ok ? 2 : 1); if (!r.ok''')
rep('''const pass = score >= Math.ceil(total * 0.8); if (pass) st.done = true;''', '''const pass = score >= Math.ceil(total * 0.8); if (pass) { if (!st.done) setTimeout(() => celebrate(true), 300); st.done = true; }''')
rep('''  function qdResult(ok, note) { const st = QDR.state; if (st.res) return;''', '''  function qdResult(ok, note) { const st = QDR.state; if (st.res) return; try { sfx(ok); } catch (e) {}''')
rep('''      const perfect = QDR.miss === 0; if (!QDR.fin) { QDR.fin = 1;''', '''      const perfect = QDR.miss === 0; if (!QDR.fin) { setTimeout(() => celebrate(perfect), 250); QDR.fin = 1;''')
rep('''if (!d.qdone && Q.every((q) => q.n >= q.of)) { d.qdone = 1;''', '''if (!d.qdone && Q.every((q) => q.n >= q.of)) { d.qdone = 1; setTimeout(() => celebrate(true), 400);''')

CSS = r'''
/* ===== look & feel: reading fonts, theme-aware newer screens, rewards ===== */
:root { --read: var(--body); --card: var(--surface) }
.hhchips a { color: var(--ink) }
:root[data-rf="book"] { --read: "Literata", Georgia, "Times New Roman", serif }
:root[data-rf="easy"] { --read: "Atkinson Hyperlegible", "Verdana", system-ui, sans-serif }
#ltext .story, #ltext .pod .txt, #ltext .verse { font-family: var(--read); font-size: calc(1.16rem * var(--fs, 1)); line-height: 1.72; letter-spacing: .003em; max-width: 36em; font-feature-settings: "kern", "liga" }
:root[data-rf="book"] #ltext .story, :root[data-rf="book"] #ltext .pod .txt { font-size: calc(1.2rem * var(--fs, 1)); line-height: 1.78 }
:root[data-rf="easy"] #ltext .story, :root[data-rf="easy"] #ltext .pod .txt { letter-spacing: .01em; word-spacing: .06em }
#ltext .story .en, #ltext .pod .en { font-family: var(--body) }
.fc .face, .drsay, .wod-es { font-family: var(--read) }
:root[data-rf="book"] .lx-body, :root[data-rf="book"] .fx-lead { font-family: var(--read) }
/* the Hoy card, drill feedback, progress calendar: follow the theme */
.hoyhero { background: linear-gradient(135deg, color-mix(in srgb, var(--saffron) 22%, var(--surface)), color-mix(in srgb, var(--saffron) 34%, var(--surface))); border-color: color-mix(in srgb, var(--saffron) 55%, var(--line)) }
.hoyhero b, .hoyhero.done b { color: var(--ink) } .hoyhero small, .hoyhero.done small { color: var(--muted) } .hoyhero .exgo { color: var(--saffron) }
.hoyhero.done { background: linear-gradient(135deg, color-mix(in srgb, var(--good) 18%, var(--surface)), color-mix(in srgb, var(--good) 28%, var(--surface))); border-color: color-mix(in srgb, var(--good) 45%, var(--line)) }
.drfb.ok { background: color-mix(in srgb, var(--good) 16%, var(--surface)); color: var(--ink); border: 1px solid color-mix(in srgb, var(--good) 45%, transparent) } .drfb.ok b { color: var(--good) }
.drfb.no { background: color-mix(in srgb, var(--bad) 13%, var(--surface)); color: var(--ink); border: 1px solid color-mix(in srgb, var(--bad) 40%, transparent) } .drfb.no b { color: var(--bad) }
.drtile { border-color: var(--line); background: var(--surface); color: var(--ink) } .drtile[aria-pressed="true"] { border-color: var(--cobalt); background: color-mix(in srgb, var(--cobalt) 12%, var(--surface)) }
.drfb { animation: fbUp .22s cubic-bezier(.2, .9, .3, 1.2) } @keyframes fbUp { from { transform: translateY(10px); opacity: 0 } }
.pcal .l1 { background: color-mix(in srgb, var(--saffron) 25%, var(--surface)); color: var(--ink) } .pcal .l2 { background: color-mix(in srgb, var(--saffron) 55%, var(--surface)); color: var(--ink) }
.pcal .l3 { background: var(--saffron); color: #1b1300 } .pcal .frz { background: color-mix(in srgb, #3fa0ff 35%, var(--surface)); color: var(--ink) }
.pbadges > div.on { background: color-mix(in srgb, var(--saffron) 14%, var(--surface)) }
.hs-ic { background: color-mix(in srgb, var(--saffron) 20%, transparent) } .hoysteps li.done .hs-ic { background: var(--good); color: var(--surface) }
.hoysteps .exgo { color: var(--cobalt) }
#hoypill { background: var(--ink); color: var(--bg) }
.confetti { position: fixed; inset: 0; width: 100vw; height: 100vh; pointer-events: none; z-index: 120 }
/* calmer focus: comfortable tap feedback everywhere */
.btn, .pbtn, .exopt, .drtile, .kcard, .hoysteps a { transition: transform .12s ease, background-color .15s, border-color .15s } .btn:active, .exopt:active, .drtile:active { transform: scale(.97) }
:focus-visible { outline: 3px solid color-mix(in srgb, var(--cobalt) 60%, transparent); outline-offset: 2px }
@media (prefers-reduced-motion: reduce) { .drfb { animation: none } }
'''
k = s.rindex("</style>", 0, s.index("</head>")); s = s[:k] + CSS + s[k:]
rep("w[1].length < 34) words.push(", "w[1].length < 34 && !/[áéíóúñ]/i.test(w[1]) && !(String(w[1]).length > 6 && !/\\s/.test(w[1]) && TG[String(w[1]).toLowerCase()] && TG[String(w[1]).toLowerCase()][3] >= 0)) words.push(")
open(p, "w", encoding="utf-8").write(s)
print("look ok")
