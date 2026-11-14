"""Transitions (tools/TRANSITIONS_BRIEF.md): right tab highlighted everywhere, Profe shows what it is looking at,
says when it paused the page's audio, and follows the page if it changes."""
import sys
p = sys.argv[1]; s = open(p, encoding="utf-8").read()
if "t-ctx" in s: sys.exit("already patched")
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, ("anchor", a[:90], s.count(a)); s = s.replace(a, b)
rep('''    if (!h || h === "inicio" || h === "ajustes") return "hoy";''', '''    if (!h || /^(inicio|ajustes|hoy|progreso|drill)$/.test(h)) return "hoy";''')
rep('''    if (/^(practicar|escuchar|leer|leer-add|escritura|repaso|errores)$/.test(h)''', '''    if (/^(practicar|escuchar|leer|leer-add|escritura|repaso|errores|examenes)$/.test(h)''')
# Profe: what it's looking at, in its header
rep('''    const head = back + '<div class="th"><div><b>' + esc(pName()) + '</b><span class="muted small"> · ' + esc(engineLabel()) + '</span></div>''',
    '''    const head = back + '<div class="th"><div><b>' + esc(pName()) + '</b><span class="muted small"> · ' + esc(engineLabel()) + '</span><p class="t-ctx">' + (window.__IC ? __IC("pin") : "") + ' Looking at: <b>' + esc(ctx.label || "Ruta DELE") + '</b></p></div>''')
# Profe opening pauses what the page is reading, and says so
rep('''    const pan = document.getElementById("tutor"); pan.hidden = false; document.body.classList.add("tutor-open"); if (!PR) tView = "chat"; tRender();''',
    '''    let paused = "";
    try { if (PL.playing) { const b = document.getElementById("pl-play"); if (b) b.click(); else { PL.playing = false; speechSynthesis.cancel(); } paused = "Reading"; } } catch (e) {}
    try { if (typeof RA !== "undefined" && RA.on && !RA.paused) { RA.paused = true; RA.gen++; speechSynthesis.cancel(); raPlayerUI(); paused = "The lesson"; } } catch (e) {}
    const pan = document.getElementById("tutor"); pan.hidden = false; document.body.classList.add("tutor-open"); if (!PR) tView = "chat"; tRender();
    if (paused) try { coachToast("⏸ " + paused + " paused while you talk to Profe. Press play to continue after."); } catch (e) {}''')
rep('''  window.addEventListener("hashchange", route);''', '''  window.addEventListener("hashchange", () => setTimeout(() => { const t = document.getElementById("tutor"); if (t && !t.hidden) try { tRender(); } catch (e) {} }, 60));
  window.addEventListener("hashchange", route);''')
CSS = r'''
.t-ctx { margin: 2px 0 0; font-size: .8rem; color: var(--muted); display: flex; align-items: center; gap: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 62vw }
.t-ctx b { color: var(--ink); font-weight: 600; overflow: hidden; text-overflow: ellipsis }
'''
k = s.rindex("</style>", 0, s.index("</head>")); s = s[:k] + CSS + s[k:]
rep("download the on-device AI (works offline on your phone) or add a Claude key", "download the on-device AI (free, and it works offline on your phone)")
open(p, "w", encoding="utf-8").write(s)
print("trans ok")
