"""Reading & Listening: a designed headline pane with Options ▾ (tools/READING_HEADER_BRIEF.md); it freezes as a compact strip while
the text is read aloud (the body glides up and fades under it); the player bar's ••• becomes a ▾ drop-down panel."""
import sys
p = sys.argv[1]; s = open(p, encoding="utf-8").read()
if "lheadHTML" in s: sys.exit("already patched")
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, ("anchor", a[:90], s.count(a)); s = s.replace(a, b)
# 1. headline pane instead of the plain eyebrow + title + subtitle; notes move into Options; the first-visit hint goes
rep('''      '<div><p class="eyebrow">' + esc(meta) + "</p><h1 class=\\"ltitle\\"><span class=\\"sent\\" data-pi=\\"t\\">" + wrapWords(x.t) + '</span></h1><p class="muted" style="font-size:1.1rem;margin-top:6px">' + esc(x.s) + (x.author ? " · " + esc(x.author) + (x.year ? " (" + esc(x.year) + ")" : "") : "") + "</p></div>" +
      (x.note ? '<p class="callout">' + esc(x.note) + (x.cat === "song" ? " The app reads the lyrics aloud. Turn on the rhythm for a simple " + esc(x.genre || "") + " percussion loop underneath." : "") + "</p>" : "") +''',
    '''      lheadHTML(x, meta) +''')
rep('''      ((UI.lhint = (UI.lhint || 0) + 1) <= 3 ? '<p class="muted small lhint">Tap a word for its meaning · highlight any part of the text to see it in English' + (UI.cues !== false ? " · Verbatim translates word by word as the voice reads" : "") + "</p>" : "") +''', '''''')
# your own texts: the tools go into the Options panel
rep('''    lt.insertAdjacentHTML("beforebegin", myTools(x));''', '''    const op = document.getElementById("lopts-body"); if (op) op.insertAdjacentHTML("beforeend", myTools(x)); else lt.insertAdjacentHTML("beforebegin", myTools(x));''')
JS = r'''
  /* ---------- Reading & Listening headline pane (tools/READING_HEADER_BRIEF.md) ---------- */
  const NOTE_SVG = '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>';
  const LHK = { story: ["#7c5cff", "read"], podcast: ["#e5484d", "listen"], news: ["#0f8f86", "globe"], history: ["#b7791f", "guides"], culture: ["#d6457a", "globe"], song: ["#e8590c", null], poem: ["#3d7bd9", "write"], reading: ["#1a9c6b", "read"], mine: ["#2f6fd6", "read"] };
  function lheadHTML(x, meta) {
    const K = LHK[x.cat] || LHK.reading, svg = K[1] ? UIC[K[1]][1] : NOTE_SVG, lv = LV[x.lvl];
    const chips = [CATS[x.cat] ? CATS[x.cat][1] : "", lv ? lv.name : "", "≈ " + minutes(x) + " min", x.country || ""].filter(Boolean);
    const sub = [x.s, x.author ? x.author + (x.year ? " (" + x.year + ")" : "") : ""].filter(Boolean).join(" · ");
    const note = x.note ? x.note + (x.cat === "song" ? " The app reads the lyrics aloud. Turn on the rhythm for a simple " + (x.genre || "") + " percussion loop underneath." : "") : "";
    const opts = x.cat === "mine" || note;
    const ic = (p) => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + "</svg>";
    return '<header class="lhead" id="lhead" style="--a:' + K[0] + '"><div class="lh-top"><span class="lh-ic" aria-hidden="true">' + ic(svg) + '</span><span class="lh-chips">' + chips.map((c) => '<span class="lh-chip">' + esc(c) + "</span>").join("") + "</span>" +
      (opts ? '<button class="lh-opts" data-act="lh-opts" aria-expanded="false" aria-controls="lopts">Options ' + ic('<path d="m6 9 6 6 6-6"/>') + "</button>" : "") + "</div>" +
      '<h1 class="ltitle"><span class="sent" data-pi="t">' + wrapWords(x.t) + "</span></h1>" + (sub ? '<p class="lh-sub">' + esc(sub) + "</p>" : "") +
      '<div class="lprog" aria-hidden="true"><i id="lprog-i"></i></div><span class="lh-deco" aria-hidden="true">' + ic(svg) + "</span></header>" +
      (opts ? '<div class="lopts" id="lopts" hidden><div id="lopts-body">' + (note ? '<p class="small">' + esc(note) + "</p>" : "") + "</div></div>" : "");
  }
  function lhState() {
    const on = !!(PL.playing && document.getElementById("lhead"));
    if (on) { const h = document.querySelector("header.top"); document.documentElement.style.setProperty("--hdrH", Math.max(0, h ? Math.round(h.getBoundingClientRect().bottom) : 56) + "px"); }
    document.body.classList.toggle("lplaying", on);
    const i = document.getElementById("lprog-i"); if (i && PL.items && PL.items.length) i.style.width = Math.round(((PL.i + (PL.playing ? 1 : 0)) / PL.items.length) * 100) + "%";
  }
  addEventListener("hashchange", () => document.body.classList.remove("lplaying"));
  document.addEventListener("click", (e) => {
    const t = e.target.closest && e.target.closest('[data-act="lh-opts"]');
    if (t) { const o = document.getElementById("lopts"); if (!o) return; o.hidden = !o.hidden; t.setAttribute("aria-expanded", String(!o.hidden)); t.classList.toggle("on", !o.hidden); return; }
    const pl = document.querySelector("#litem .player.more"); if (pl && !e.target.closest(".player")) { pl.classList.remove("more"); const b = pl.querySelector(".pmore"); if (b) b.setAttribute("aria-expanded", "false"); } // tap outside closes the drop-down
  });
'''
rep("  function plUI() {", JS + "  function plUI() {\n    try { lhState(); } catch (e) {}")
# 2. player bar: ▾ drop-down with Speed, Hide text, English, Rhythm in a panel above the bar
rep('''      '<select id="pl-rate" aria-label="Speed">' + [[0.7, "0.7×"], [0.8, "0.8×"], [0.9, "0.9×"], [1, "1×"], [1.1, "1.1×"]].map(([v, n]) => '<option value="' + v + '"' + (v === PL.rate ? " selected" : "") + ">" + n + "</option>").join("") + "</select>" +
      '<button class="pbtn pmore" data-act="pl-more" aria-label="More options" aria-expanded="false">⋯</button>' +
      '<button class="btn small" data-act="l-text" aria-pressed="false" id="l-text">Hide text</button>' +
      '<button class="btn small" data-act="l-en" aria-pressed="false" id="l-en">English</button>' +''',
    '''      '<button class="pbtn pmore" data-act="pl-more" aria-label="More controls" aria-expanded="false" aria-controls="pmenu"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button>' +
      '<div class="pmenu" id="pmenu" role="group" aria-label="More controls"><label class="pm-row"><span>Speed</span><select id="pl-rate" aria-label="Speed">' + [[0.7, "0.7×"], [0.8, "0.8×"], [0.9, "0.9×"], [1, "1×"], [1.1, "1.1×"]].map(([v, n]) => '<option value="' + v + '"' + (v === PL.rate ? " selected" : "") + ">" + n + "</option>").join("") + "</select></label>" +
      '<button class="btn small" data-act="l-text" aria-pressed="false" id="l-text">Hide text</button>' +
      '<button class="btn small" data-act="l-en" aria-pressed="false" id="l-en">English</button>' +''')
rep('''      (song ? '<button class="btn small" id="rh-btn" data-act="l-rhythm" data-label="Rhythm: ' + esc(x.genre || "salsa") + '" aria-pressed="false">Rhythm: ' + esc(x.genre || "salsa") + "</button>" : "") + "</div>";''',
    '''      (song ? '<button class="btn small" id="rh-btn" data-act="l-rhythm" data-label="Rhythm: ' + esc(x.genre || "salsa") + '" aria-pressed="false">Rhythm: ' + esc(x.genre || "salsa") + "</button>" : "") + "</div></div>";''')
# Verbatim stays on the bar, in front of the drop-down
rep('''      '<button class="btn small cue-sw" data-act="l-cue" id="l-cue"''', '''      "</div>" + '<button class="btn small cue-sw" data-act="l-cue" id="l-cue"''')
rep('''      (song ? '<button class="btn small" id="rh-btn" data-act="l-rhythm" data-label="Rhythm: ' + esc(x.genre || "salsa") + '" aria-pressed="false">Rhythm: ' + esc(x.genre || "salsa") + "</button>" : "") + "</div></div>";''', '''      "</div>";''')
rep('''      '<button class="btn small" data-act="l-en" aria-pressed="false" id="l-en">English</button>' +''', '''      '<button class="btn small" data-act="l-en" aria-pressed="false" id="l-en">English</button>' +
      (song ? '<button class="btn small" id="rh-btn" data-act="l-rhythm" data-label="Rhythm: ' + esc(x.genre || "salsa") + '" aria-pressed="false">Rhythm: ' + esc(x.genre || "salsa") + "</button>" : "") +''')
CSS = r'''
/* ===== Reading & Listening headline pane ===== */
#litem .crumbs { display: none }
.lhead { position: relative; overflow: hidden; isolation: isolate; border-radius: 20px; padding: 14px 16px 16px 20px; color: var(--ink);
  background: linear-gradient(135deg, color-mix(in srgb, var(--a) 20%, var(--surface)) 0%, color-mix(in srgb, var(--a) 7%, var(--surface)) 55%, var(--surface) 100%);
  border: 1px solid color-mix(in srgb, var(--a) 26%, transparent); box-shadow: 0 10px 26px color-mix(in srgb, var(--a) 14%, transparent);
  transition: padding .45s cubic-bezier(.3, .8, .3, 1), border-radius .45s, box-shadow .45s }
.lhead::before { content: ""; position: absolute; left: 0; top: 0; bottom: 0; width: 5px; background: linear-gradient(var(--a), color-mix(in srgb, var(--a) 55%, #fff)) }
.lh-top { display: flex; align-items: center; gap: 8px; position: relative; z-index: 1 }
.lh-ic { flex: 0 0 auto; width: 34px; height: 34px; border-radius: 11px; display: grid; place-items: center; color: #fff; background: linear-gradient(150deg, color-mix(in srgb, var(--a) 70%, #fff), var(--a)); box-shadow: 0 5px 12px color-mix(in srgb, var(--a) 35%, transparent); transition: width .45s, height .45s }
.lh-ic svg { width: 18px; height: 18px }
.lh-chips { display: flex; flex-wrap: wrap; gap: 6px; min-width: 0; flex: 1 }
.lh-chip { font-size: 12px; font-weight: 700; letter-spacing: .02em; padding: 3px 9px; border-radius: 99px; background: color-mix(in srgb, var(--a) 15%, transparent); color: color-mix(in srgb, var(--a) 72%, var(--ink)); white-space: nowrap }
.lh-opts { flex: 0 0 auto; display: inline-flex; align-items: center; gap: 2px; border: 1px solid color-mix(in srgb, var(--a) 30%, transparent); background: var(--surface); color: var(--ink); font: inherit; font-size: 13px; font-weight: 600; padding: 5px 8px 5px 11px; border-radius: 99px; cursor: pointer }
.lh-opts svg { width: 16px; height: 16px; transition: transform .25s } .lh-opts.on svg { transform: rotate(180deg) }
.lhead .ltitle { position: relative; z-index: 1; margin: 12px 0 4px; font-size: clamp(1.55rem, 6.4vw, 2.2rem); line-height: 1.14; letter-spacing: -.015em; transition: font-size .45s cubic-bezier(.3, .8, .3, 1), margin .45s }
.lh-sub { position: relative; z-index: 1; margin: 0; color: var(--muted); font-size: .98rem; transition: opacity .3s }
.lh-deco { position: absolute; right: -22px; bottom: -26px; width: 130px; height: 130px; color: var(--a); opacity: .09; z-index: 0; pointer-events: none }
.lh-deco svg { width: 100%; height: 100%; stroke-width: 1.4 }
.lprog { display: none; position: relative; z-index: 1; height: 4px; margin-top: 8px; border-radius: 99px; background: color-mix(in srgb, var(--a) 16%, transparent); overflow: hidden }
.lprog i { display: block; height: 100%; width: 0; background: var(--a); border-radius: 99px; transition: width .8s ease }
.lopts { margin-top: -6px; padding: 12px 14px; border-radius: 16px; border: 1px solid var(--line); background: var(--surface) }
.lopts[hidden] { display: none } .lopts .mytools { margin: 0; padding: 0; border: 0; background: none; box-shadow: none }
/* frozen while the text is read aloud: a compact strip under the top bar; lines fade as they slide under it */
body.lplaying #litem .lhead { position: sticky; top: var(--hdrH, 56px); z-index: 6; overflow: visible; padding: 8px 14px 10px 18px; border-radius: 0 0 16px 16px; box-shadow: 0 8px 18px color-mix(in srgb, var(--a) 16%, transparent) }
body.lplaying #litem .lhead::after { content: ""; position: absolute; left: 6px; right: 6px; top: 100%; height: 22px; background: linear-gradient(color-mix(in srgb, var(--surface) 80%, transparent), transparent); pointer-events: none }
body.lplaying #litem .lhead .ltitle { font-size: 1.08rem; margin: 6px 0 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden }
body.lplaying #litem .lh-sub, body.lplaying #litem .lh-deco, body.lplaying #litem .lh-opts, body.lplaying #litem .lopts { display: none }
body.lplaying #litem .lh-ic { width: 26px; height: 26px } body.lplaying #litem .lh-ic svg { width: 14px; height: 14px }
body.lplaying #litem .lprog { display: block }
/* ===== player bar: ▾ drop-down instead of ••• ===== */
#litem .player, #litem .player.more { flex-wrap: nowrap }
#litem .player .pmore { order: 2; margin-left: 0; width: 34px; min-width: 34px; padding: 0; display: grid; place-items: center; font-size: 1rem }
#litem .player .pmore svg { width: 20px; height: 20px; transition: transform .25s }
#litem .player.more .pmore svg { transform: rotate(180deg) }
#litem .player .pmenu { display: none; position: absolute; right: 8px; bottom: calc(100% + 8px); z-index: 7; flex-direction: column; align-items: stretch; gap: 8px; min-width: 180px; padding: 10px; border-radius: 14px; border: 1px solid var(--line); background: var(--surface); box-shadow: 0 10px 28px rgba(0, 0, 0, .18) }
#litem .player.more .pmenu { display: flex }
#litem .player .pmenu > #l-text, #litem .player .pmenu > #l-en, #litem .player .pmenu > #rh-btn { display: inline-flex; justify-content: center }
#litem .player .pm-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; font-size: 14px; font-weight: 600 }
#litem .player .pm-row select { min-width: 84px }
'''
k = s.rindex("</style>", 0, s.index("</head>")); s = s[:k] + CSS + s[k:]
open(p, "w", encoding="utf-8").write(s)
print("lhead ok")
