# M2 (Continue banner on Home) and M3 (Next video). Embeds tools/homebanner.js (re-running replaces it) and wires it once.
import sys
P = sys.argv[1] if len(sys.argv) > 1 else "index.html"
s = open(P, encoding="utf-8").read()
js = open("tools/homebanner.js", encoding="utf-8").read().rstrip() + "\n"
if "/* ==HOMEBANNER==" in s:
    i = s.index("  /* ==HOMEBANNER=="); j = s.index("/* ==/HOMEBANNER== */", i) + len("/* ==/HOMEBANNER== */\n")
    s = s[:i] + js + s[j:]; open(P, "w", encoding="utf-8").write(s); print("homebanner block updated"); sys.exit()
def rep(a, b):
    global s
    assert s.count(a) == 1, (s.count(a), a[:120]); s = s.replace(a, b)
rep("  /* ==CHULETAS== ", js + "  /* ==CHULETAS== ")
rep("""'<div class="home-top">' + hoyHero() + wod + "</div>" + hero + goal +""", """'<div class="home-top">' + hoyHero() + wod + "</div>" + cbHTML(hero) + goal +""")
rep('    const u = app.querySelector("u[data-href]");', '    try { cbMount(); } catch (e) {}\n    const u = app.querySelector("u[data-href]");')
rep("""app.innerHTML = '<div class="stack vpage"><div><p class="eyebrow">'""", """app.innerHTML = '<div class="stack vpage">' + vNextHTML(id) + '<div><p class="eyebrow">'""")
rep("events: { onReady: () => { vlive(); vContinue(d); },", "events: { onReady: () => { vlive(); vContinue(d); try { vAutoStart(id); } catch (e) {} },")
CSS = """
/* ===== continue banner (M2) and next video (M3) ===== */
.cbwrap { display: flex; flex-direction: column; gap: 8px; margin: 10px 0 }
.cbanner { position: relative }
.cbslide[hidden] { display: none }
.cbcard { display: flex; flex-direction: column; gap: 3px; width: 100%; text-align: left; font: inherit; color: #fff; text-decoration: none; border: 0; cursor: pointer; padding: 16px 16px 14px; border-radius: 22px; min-height: 148px; box-sizing: border-box;
  background: linear-gradient(135deg, var(--cb, #2f7cf0), color-mix(in srgb, var(--cb, #2f7cf0) 62%, #10204a)); box-shadow: 0 6px 20px color-mix(in srgb, var(--cb, #2f7cf0) 30%, transparent) }
.cbcard:focus-visible { outline: 3px solid var(--ink, #111); outline-offset: 3px }
.cbeye { font-size: .74rem; font-weight: 700; letter-spacing: .03em; opacity: .9; text-transform: uppercase }
.cbt { font-size: 1.22rem; font-weight: 750; line-height: 1.2; overflow-wrap: anywhere }
.cbwhere { font-size: .88rem; opacity: .92 }
.cbbar { display: block; height: 6px; border-radius: 4px; background: rgba(255, 255, 255, .28); margin-top: 6px; overflow: hidden } .cbbar i { display: block; height: 100%; background: #fff; border-radius: 4px }
.cbfoot { display: flex; justify-content: space-between; align-items: center; margin-top: auto; padding-top: 8px; font-size: .82rem }
.cbgo { background: #fff; color: color-mix(in srgb, var(--cb, #2f7cf0) 72%, #000); font-weight: 750; padding: 6px 14px; border-radius: 999px }
.cbin { animation: cbFade .35s ease }
@keyframes cbFade { from { opacity: .35; transform: translateX(10px) } to { opacity: 1; transform: none } }
@media (prefers-reduced-motion: reduce) { .cbin { animation: none } }
.cbctl { display: flex; align-items: center; justify-content: center; gap: 6px; margin-top: 6px }
.cbbtn { min-width: 36px; min-height: 36px; border-radius: 999px; border: 1px solid var(--line); background: var(--surface); color: inherit; font: inherit; font-size: 1rem; cursor: pointer }
.cbbtn[hidden] { display: none }
.cbdots { display: flex; gap: 2px } .cbdot { width: 24px; height: 24px; border: 0; background: none; padding: 0; cursor: pointer; display: grid; place-items: center }
.cbdot::before { content: ""; width: 8px; height: 8px; border-radius: 50%; background: color-mix(in srgb, var(--muted) 45%, transparent) }
.cbdot[aria-current="true"]::before { width: 18px; border-radius: 6px; background: var(--cobalt) }
.cbsched { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; padding: 10px 12px; border-radius: 16px; border: 1px solid var(--line); background: var(--surface) }
.cbsched > span { flex: 1 1 180px; display: flex; flex-direction: column; gap: 2px } .cbsched small { color: var(--muted) } .cbsched i { font-style: normal }
.vnextbar { display: flex; align-items: center; gap: 8px; justify-content: flex-end; flex-wrap: wrap }
.vnextt { max-width: 60%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; order: -1 }
.vnext[disabled] { opacity: .55 }
.vframe { position: relative }
.vtapplay { position: absolute; inset: 0; margin: auto; width: max-content; height: max-content; display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 14px 20px; border-radius: 18px; border: 0; background: rgba(0, 0, 0, .78); color: #fff; font: inherit; font-weight: 700; font-size: 1.05rem; cursor: pointer; z-index: 3 }
.vtapplay small { font-weight: 400; font-size: .78rem; opacity: .85; max-width: 220px; text-align: center }
"""
rep("/* ===== revision cheat sheets (M5) ===== */", CSS + "/* ===== revision cheat sheets (M5) ===== */")
open(P, "w", encoding="utf-8").write(s); print("m2/m3 wired")
