"""Interactive skill drills (15 Nov 2026): embeds tools/skilldrills.js, its CSS, the #ejercicios route, the chapter-challenge card
and a home tile. Re-runnable. Usage: python3 tools/patch_skill.py index.html"""
import sys, os, re
T = os.path.dirname(os.path.abspath(__file__)); p = sys.argv[1]; s = open(p, encoding="utf-8").read()
js = open(os.path.join(T, "skilldrills.js"), encoding="utf-8").read(); css = open(os.path.join(T, "skilldrills.css"), encoding="utf-8").read()
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, ("anchor", a[:90], s.count(a)); s = s.replace(a, b)
blk = "  /* ==SKILL== */\n" + js.rstrip() + "\n  /* ==/SKILL== */\n"
if "/* ==SKILL== */" in s: s = re.sub(r"  /\* ==SKILL== \*/\n[\s\S]*?  /\* ==/SKILL== \*/\n", lambda m: blk, s, count=1)
else: rep("  // a page that throws while drawing must not leave a blank screen\n  function route() {", blk + "  // a page that throws while drawing must not leave a blank screen\n  function route() {")
cb = "/* ==SKILL-CSS== */\n" + css.rstrip() + "\n/* ==/SKILL-CSS== */\n"
if "/* ==SKILL-CSS== */" in s: s = re.sub(r"/\* ==SKILL-CSS== \*/\n[\s\S]*?/\* ==/SKILL-CSS== \*/\n", lambda m: cb, s, count=1)
else: rep("/* ==READABLE== */", cb + "/* ==READABLE== */")
if "else if (/^ejercicios" not in s:
    rep('    else if (h === "costes") { setSec("hoy"); navChips(null); costsView(); }', '    else if (h === "costes") { setSec("hoy"); navChips(null); costsView(); }\n    else if (/^ejercicios(\\/[a-z0-9\\/-]+)?$/.test(h)) { setSec("practicar"); navChips(null); skRoute(h); }')
if "skReviewCard(qkey)" not in s:
    rep('''"</span>" : "") + "</div>" + pxHTML(u, u.xi) + "</section>";''', '''"</span>" : "") + "</div>" + skReviewCard(qkey) + pxHTML(u, u.xi) + "</section>";''')
    rep('''"</span>" : "") + "</div>" + pxHTML(g, "Fill in the blank.") + "</section></div>";''', '''"</span>" : "") + "</div>" + skReviewCard("guia-" + g.id) + pxHTML(g, "Fill in the blank.") + "</section></div>";''')
if 'href="#ejercicios"><span class="qp2i"' not in s:
    rep('''<a class="qp2t qd" href="#drill"><span class="qp2i" aria-hidden="true">🧩</span><span><b>Quick drill</b><small>5 minutes · mixed practice</small></span></a>''', '''<a class="qp2t qd" href="#drill"><span class="qp2i" aria-hidden="true">🧩</span><span><b>Quick drill</b><small>5 minutes · mixed practice</small></span></a><a class="qp2t qd" href="#ejercicios"><span class="qp2i" aria-hidden="true">🎯</span><span><b>Skill drills</b><small>Listen, speak, spell, build</small></span></a>''')
open(p, "w", encoding="utf-8").write(s); print("patched", p)
