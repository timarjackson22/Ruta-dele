# M4: Study plan. Embeds tools/plan.js (between ==PLAN== markers; re-running replaces it) and wires the #plan route, tab and Profe hook once.
import sys
P = sys.argv[1] if len(sys.argv) > 1 else "index.html"
s = open(P, encoding="utf-8").read()
js = open("tools/plan.js", encoding="utf-8").read().rstrip() + "\n"
if "/* ==PLAN==" in s:
    i = s.index("  /* ==PLAN=="); j = s.index("/* ==/PLAN== */", i) + len("/* ==/PLAN== */\n")
    s = s[:i] + js + s[j:]
    open(P, "w", encoding="utf-8").write(s); print("plan block updated"); sys.exit()
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, (s.count(a), a[:120]); s = s.replace(a, b)
rep("  /* ==ADAPTIVE== ", js + "  /* ==ADAPTIVE== ")
rep('    else if (h === "hoy") { setSec("hoy"); navChips(null); hoyView(); }', '    else if (h === "plan") { setSec("plan"); navChips(null); planPage(); }\n    else if (h === "hoy") { setSec("hoy"); navChips(null); hoyView(); }')
rep('    if (!h || /^(inicio|ajustes|hoy|progreso|drill)$/.test(h)) return "hoy";', '    if (h === "plan") return "plan";\n    if (!h || /^(inicio|ajustes|hoy|progreso|drill)$/.test(h)) return "hoy";')
rep('["hoy", "curso", "practicar", "biblioteca"].indexOf(tab)', '["hoy", "curso", "practicar", "biblioteca", "plan"].indexOf(tab)')
rep('["#f59e0b", "#2f7cf0", "#16a36a", "#8b5cf6"][ix]', '["#f59e0b", "#2f7cf0", "#16a36a", "#8b5cf6", "#e11d48"][ix]')
CAL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/><path d="m9 15 2 2 4-4"/></svg>'
i = s.index('<nav class="tabbar"'); j = s.index("</nav>", i)
s = s[:j] + '<a data-s="plan" href="#plan">' + CAL + '<span>Plan</span></a>' + s[j:]
i = s.index('class="secnav"'); j = s.index("</nav>", i)
s = s[:j] + '<a data-s="plan" href="#plan">Plan</a>' + s[j:]
rep('.tabbar { grid-template-columns: repeat(4, 1fr) !important;', '.tabbar { grid-template-columns: repeat(5, 1fr) !important;')
rep('width: calc((100% - 12px) / 4); border-radius: 20px;', 'width: calc((100% - 12px) / 5); border-radius: 20px;')
rep('.tabbar [data-s="biblioteca"] { --tc: #8b5cf6 }', '.tabbar [data-s="biblioteca"] { --tc: #8b5cf6 } .tabbar [data-s="plan"] { --tc: #e11d48 }')
# (the Profe hook lives in tools/pvoice.js: pvRoute hands turns to planChatTurn while the setup conversation is on)
CSS = """
/* ===== study plan (M4) ===== */
.plan .plintro .row, .plformbtns { gap: 8px; flex-wrap: wrap }
.plstatus { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 10px 0; padding: 12px; border: 1px solid var(--line); border-radius: 16px; background: var(--surface) }
.plstatus > div { display: flex; flex-direction: column; gap: 2px }
.plstatus .placts { grid-column: 1 / -1; flex-direction: row; gap: 8px }
.plchip { align-self: flex-start; font-size: .75rem; font-weight: 650; padding: 2px 9px; border-radius: 999px; background: color-mix(in srgb, var(--muted) 14%, transparent) }
.plchip.ok { background: color-mix(in srgb, #16a36a 16%, transparent); color: #0f7a4f } .plchip.warn { background: color-mix(in srgb, #f59e0b 20%, transparent); color: #92570a }
.plexam { display: flex; flex-direction: column; gap: 3px; padding: 12px; border-radius: 16px; border: 1px dashed var(--line); margin: 8px 0 }
.plexam.conf { border-style: solid; border-color: color-mix(in srgb, #16a36a 50%, var(--line)) }
.plexam .btn { align-self: flex-start; margin-top: 4px }
.plbadge { font-size: .72rem; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; color: var(--muted) }
.plexam.conf .plbadge { color: #0f7a4f }
.plwarn { padding: 10px 12px; border-radius: 12px; background: color-mix(in srgb, #f59e0b 13%, transparent); font-size: .92rem }
.pltabs { margin: 10px 0; flex-wrap: wrap; overflow: visible }
.pllist { list-style: none; margin: 6px 0 0; padding: 0; display: flex; flex-direction: column; gap: 8px }
.plrow { display: grid; grid-template-columns: 54px 1fr; gap: 4px 10px; padding: 10px; border-radius: 14px; border: 1px solid var(--line); border-left: 4px solid var(--k); background: var(--surface) }
.plrow.done { opacity: .72 } .plrow.over { border-color: color-mix(in srgb, #e11d48 40%, var(--line)); border-left-color: var(--k) }
.plt { display: flex; flex-direction: column; font-variant-numeric: tabular-nums } .plt small { color: var(--muted) }
.plb { display: flex; flex-direction: column; gap: 1px; min-width: 0 }
.plk { font-size: .74rem; font-weight: 650; color: var(--k) } .plti { overflow-wrap: anywhere } .plb small { color: var(--muted) }
.plst { font-size: .74rem; font-weight: 650; color: var(--muted) } .plrow.over .plst { color: #c0143c } .plrow.done .plst { color: #0f7a4f }
.pla { grid-column: 1 / -1; display: flex; flex-wrap: wrap; gap: 6px }
.plnav { justify-content: space-between; align-items: center; margin: 6px 0 }
.plweek { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 4px }
@media (max-width: 640px) { .plweek { grid-template-columns: 1fr } }
.plwd { border: 1px solid var(--line); border-radius: 12px; padding: 6px; display: flex; flex-direction: column; gap: 4px; min-height: 70px }
.plwd.today { border-color: var(--cobalt) }
.plwh { background: none; border: 0; font: inherit; font-weight: 700; text-align: left; padding: 0; color: inherit; cursor: pointer }
.plchipk { font-size: .74rem; padding: 4px 6px; border-radius: 8px; background: color-mix(in srgb, var(--k) 14%, transparent); display: flex; flex-direction: column }
.plchipk small { color: var(--muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis } .plchipk.done { opacity: .6 }
.plmonth { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 3px; text-align: center }
.plmonth > b { font-size: .72rem; color: var(--muted) }
.plmd { position: relative; aspect-ratio: 1 / 1.05; border: 1px solid var(--line); border-radius: 10px; background: var(--surface); font: inherit; font-size: .8rem; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1px; padding: 2px; color: inherit; cursor: pointer }
.plmd.out { opacity: .4 } .plmd.today { border-color: var(--cobalt); border-width: 2px } .plmd.exam { background: color-mix(in srgb, #e11d48 14%, var(--surface)) }
.plmd i { display: block; width: 70%; height: 4px; border-radius: 3px; background: linear-gradient(90deg, #16a36a var(--p), color-mix(in srgb, var(--muted) 25%, transparent) var(--p)) }
.plmd small { font-size: .62rem; color: var(--muted) }
.plform label { display: flex; flex-direction: column; gap: 3px; font-size: .88rem; font-weight: 600 }
.plform input, .plform select, .plform textarea { font: inherit; font-weight: 400; padding: 8px 10px; border: 1px solid var(--line); border-radius: 10px; background: var(--surface); color: inherit; min-height: 40px }
.plgrid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin: 8px 0 }
.plskills { border: 0; padding: 0; margin: 8px 0; display: flex; flex-wrap: wrap; gap: 6px 14px } .plskills legend { font-weight: 600; font-size: .88rem; margin-bottom: 4px }
.plform .plck { flex-direction: row; align-items: center; gap: 8px; font-weight: 500; margin: 4px 0 } .plck input { min-height: 0; width: 20px; height: 20px }
.plavail { display: flex; flex-direction: column; gap: 8px }
.plad { display: grid; grid-template-columns: minmax(84px, max-content) 1fr; gap: 6px 10px; align-items: start; padding: 8px 0; border-bottom: 1px solid var(--line) }
.plws { display: flex; flex-wrap: wrap; gap: 6px; align-items: center }
.plw { display: inline-flex; align-items: center; gap: 4px } .plw input { width: 132px; padding: 6px 4px }
.plform .plwant { grid-column: 2; flex-direction: row; align-items: center; gap: 6px; font-weight: 500 } .plwant input { width: 76px }
.plo { gap: 6px; flex-wrap: wrap; align-items: center; margin: 4px 0 }
.plsum { display: grid; grid-template-columns: max-content 1fr; gap: 4px 12px; margin: 8px 0 } .plsum dt { font-weight: 650; color: var(--muted) } .plsum dd { margin: 0 }
.plnote { margin-top: 18px }
.lnk { background: none; border: 0; padding: 0; color: var(--cobalt); text-decoration: underline; font: inherit; cursor: pointer }
"""
rep("/* ===== type system", CSS + "/* ===== type system")
open(P, "w", encoding="utf-8").write(s); print("plan wired")
