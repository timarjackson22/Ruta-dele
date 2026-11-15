# Video controller v3: main bar = 5 s · Replay (previous + current line) · Verbatim (translate symbol) · English (🇬🇧) · ▾;
# speed, play/pause and Just listen go in the drop-down; labels sit under the icons. Verbatim gets the translate symbol and
# English the British flag on the reading/listening player too.
import sys
P = sys.argv[1] if len(sys.argv) > 1 else "index.html"
s = open(P, encoding="utf-8").read()
def rep(a, b):
    global s
    assert s.count(a) == 1, (s.count(a), a[:100]); s = s.replace(a, b)
VB = '<svg class="ic-tr" viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M12.87 15.07l-2.54-2.51.03-.03A17.52 17.52 0 0 0 14.07 6H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/></svg>'
# a shared constant for the Verbatim symbol
rep("  const esc = (s) => String(s).replace(", "  const VERB_IC = '" + VB + "'; // Verbatim (live word-by-word translation): the translate symbol, everywhere\n  const esc = (s) => String(s).replace(")
old = s[s.index("""      (() => { const P = vcPref(); return '<div class="vctl vbar" id="vbar">"""):s.index("""<span id="vmenu-x"></span></div></div>'; })() +""") + len("""<span id="vmenu-x"></span></div></div>'; })() +""")]
new = """      (() => { const P = vcPref(); return '<div class="vctl vbar" id="vbar">' +
        '<button class="btn small vstk" data-act="v-back5" aria-label="Back 5 seconds">' + IC("back") + '<span>5 s</span></button>' +
        '<button class="btn small vstk" data-act="v-loop" aria-pressed="false" aria-label="Replay sentence: the previous line and this one" title="Replay the previous line and this one">' + IC("repeat") + '<span>Replay</span></button>' +
        '<button class="btn small vstk vico" data-act="vc-cue" aria-pressed="' + cueOn() + '" aria-label="Verbatim: live word-by-word translation" title="Verbatim: live word-by-word translation">' + VERB_IC + '<span>Words</span></button>' +
        '<button class="btn small vstk vico" data-act="vc-en" aria-pressed="' + !!P.en + '" aria-label="English translation" title="English translation"><span class="vflag" aria-hidden="true">🇬🇧</span><span>English</span></button>' +
        '<button class="btn small vstk vmorebtn" data-act="v-more" aria-label="More options" aria-expanded="false" aria-controls="vmenu"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 15 6-6 6 6"/></svg><span>More</span></button>' +
        '<div class="vmenu vcap-tg" id="vmenu"><button class="btn small vplaybtn" data-act="v-play" aria-label="Play or pause">' + IC("play") + '</button><button class="btn small" data-act="v-rate" aria-pressed="false" aria-label="Playback speed">Speed 1×</button><button class="btn small" data-act="vc-hide" aria-pressed="' + !!P.hide + '">Just listen</button><span id="vmenu-x"></span></div></div>'; })() +"""
s = s.replace(old, new)
# replay: back to the start of the previous line, play on through the current one
rep("""    else if (a === "v-loop") { if (VP.loop) { VP.loop = null; t.setAttribute("aria-pressed", "false"); } else { const n = vpT(), c = VCAP.cues.length ? VCAP.cues[Math.max(0, vcFind(n))] : null; VP.loop = c && n >= c.s - 0.2 ? { a: Math.max(vpLo(), c.s - 0.15), b: c.e + 0.1 } : { a: Math.max(0, n - 5), b: n + 0.2 }; vpSeek(VP.loop.a); vpPlay(); t.setAttribute("aria-pressed", "true"); } }""",
    """    else if (a === "v-loop") { VP.loop = null; const n = vpT(), k = VCAP.cues.length ? vcFind(n) : -1; const from = k >= 0 ? VCAP.cues[Math.max(0, k - 1)].s - 0.15 : n - 8; vpSeek(Math.max(vpLo(), from)); vpPlay(); }""")
# labels under the icons, compact bar
rep("""body.vpage-on .vbar > .btn { padding: 6px 9px; font-size: 13.5px; min-width: 0; flex: 0 1 auto; white-space: nowrap }""",
    """body.vpage-on .vbar > .btn { padding: 6px 9px; font-size: 13.5px; min-width: 0; flex: 0 1 auto; white-space: nowrap }
body.vpage-on .vbar > .vstk { flex: 1 1 0; flex-direction: column; gap: 2px; padding: 5px 4px; border-radius: 12px; font-size: 11px; font-weight: 600; line-height: 1.1 }
body.vpage-on .vbar > .vstk svg { width: 20px; height: 20px } body.vpage-on .vbar .vflag { font-size: 19px; line-height: 20px }
body.vpage-on .vbar > .vstk > span:last-child { font-size: 10.5px; color: var(--muted) } body.vpage-on .vbar > .vstk[aria-pressed="true"] > span:last-child { color: var(--cobalt) }
.vbar .vmenu .vplaybtn { justify-content: center }""")
rep("""@media (max-width: 380px) { body.vpage-on .vbar > [data-act="v-loop"] { font-size: 0; gap: 0 } body.vpage-on .vbar > [data-act="v-loop"] svg { width: 18px; height: 18px } }""", "")
# reading / listening player: same symbols
rep("""aria-label="Verbatim: live word-by-word translation"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-4.6A8 8 0 1 1 21 12z"/><path d="M8.5 10.5h7M8.5 13.5h4.5"/></svg>Verbatim</button>""",
    """aria-label="Verbatim: live word-by-word translation">' + VERB_IC + '</button>""")
rep("""<button class="btn small" data-act="l-en" aria-pressed="false" id="l-en">English""", """<button class="btn small" data-act="l-en" aria-pressed="false" id="l-en" aria-label="English translation" title="English translation"><span aria-hidden="true">🇬🇧</span> English""")
rep("""'<p class="setl">Verbatim <span class="muted small">""", """'<p class="setl">' + VERB_IC + ' Verbatim <span class="muted small">""")
open(P, "w", encoding="utf-8").write(s); print("ok")

# play/pause on the main bar too (user, 16:08)
s = open(P, encoding="utf-8").read()
rep("""'<div class="vmenu vcap-tg" id="vmenu"><button class="btn small vplaybtn" data-act="v-play" aria-label="Play or pause">' + IC("play") + '</button><button class="btn small" data-act="v-rate\"""",
    """'<div class="vmenu vcap-tg" id="vmenu"><button class="btn small" data-act="v-rate\"""")
rep("""        '<button class="btn small vstk vico" data-act="vc-cue\"""", """        '<button class="btn small vstk vplaybtn" data-act="v-play" aria-label="Play or pause"><span class="vpi">' + IC("play") + '</span><span class="vpl">Play</span></button>' +
        '<button class="btn small vstk vico" data-act="vc-cue\"""")
rep("""const want = st === 1 ? "pause" : "play"; if (b.dataset.ic !== want) { b.dataset.ic = want; b.innerHTML = want === "pause" ? '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>' : IC("play"); }""",
    """const want = st === 1 ? "pause" : "play"; if (b.dataset.ic !== want) { b.dataset.ic = want; const ic = b.querySelector(".vpi"), lb = b.querySelector(".vpl"); if (ic) ic.innerHTML = want === "pause" ? '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>' : IC("play"); if (lb) lb.textContent = want === "pause" ? "Pause" : "Play"; }""")
rep(""".vbar .vmenu .vplaybtn { justify-content: center }""", """body.vpage-on .vbar .vpi { display: grid; place-items: center; height: 20px }""")
open(P, "w", encoding="utf-8").write(s); print("play ok")

# the informal-word key sits just above the caption pane, at its top-left edge (user, 16:11)
s = open(P, encoding="utf-8").read()
rep("""      '<div class="vcap" id="vcap"><div class="vcap-in" id="vcap-in"></div><div class="vcap-listen" aria-hidden="true">Listening mode: text hidden</div></div><p class="vcap-note small muted" id="vcap-note"></p></section>'; }""",
    """      '<p class="vcap-note small muted" id="vcap-note"></p><div class="vcap" id="vcap"><div class="vcap-in" id="vcap-in"></div><div class="vcap-listen" aria-hidden="true">Listening mode: text hidden</div></div></section>'; }""")
rep(""".vcap-note { margin: 6px 0 0; display: flex; flex-wrap: wrap; gap: 4px 10px; align-items: center }""",
    """.vcap-note { margin: 0 0 4px 4px; display: flex; flex-wrap: wrap; gap: 4px 10px; align-items: center } .vcap-note:empty { display: none }""")
open(P, "w", encoding="utf-8").write(s); print("key ok")
