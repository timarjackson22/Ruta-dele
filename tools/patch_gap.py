"""Closing the gap with Duolingo: backup/restore, reminders, streak freezes, Hoy daily session, quick drills, quests, badges, progress."""
import sys
p = sys.argv[1]; s = open(p, encoding="utf-8").read()
if "function hoyView" in s: sys.exit("already patched")
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, ("anchor", a[:90], s.count(a)); s = s.replace(a, b)
G = open("/home/claude/app/gap.js", encoding="utf-8").read()
rep("  function route() {\n", G + "\n  function route() {\n")
rep('''    else if (h === "ajustes") {''', '''    else if (h === "hoy") { setSec("hoy"); navChips(null); hoyView(); }
    else if (h === "drill") { setSec("practicar"); navChips(null); QDR = null; qdStart(); }
    else if (h === "progreso") { setSec("hoy"); navChips(null); progView(); }
    else if (h === "ajustes") {''')
rep('''    while (A[dayKey(d)] >= 5) { n++; d.setDate(d.getDate() - 1); }''', '''    const F = new Set(S.frzDays || []); // a day saved by a streak freeze keeps the chain without adding to it
    while (A[dayKey(d)] >= 5 || F.has(dayKey(d))) { if (A[dayKey(d)] >= 5) n++; d.setDate(d.getDate() - 1); }''')
rep('''      '<h2 class="ghead">Microphone</h2>''', '''      settingsExtra() + '<h2 class="ghead">Microphone</h2>''')
rep('''      hero + goal +''', '''      hoyHero() + hero + goal +''')
rep('''st.heard = true; S.l[PL.id] = st; save(); plUI(); }''', '''st.heard = true; S.l[PL.id] = st; save(); plUI(); try { qBump("listen"); } catch (e) {} }''')
rep('''  function pxFinish() {
    PX.phase = "end";''', '''  function pxFinish() {
    PX.phase = "end"; try { qBump("px"); } catch (e) {}''')
rep('''|| /-examen-\\d+-[a-z]+$/.test(h));''', '''|| /-examen-\\d+-[a-z]+$/.test(h) || h === "drill");''')
CSS = open("/home/claude/app/gap.css", encoding="utf-8").read()
k = s.rindex("</style>", 0, s.index("</head>")); s = s[:k] + "\n" + CSS + "\n" + s[k:]
open(p, "w", encoding="utf-8").write(s)
print("gap ok")
