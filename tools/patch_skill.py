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
# words whose misspelling or moved stress would be another real word (carro→caro, hablo→habló): drills must not use them
import json, unicodedata
D = json.load(open(os.path.join(T, "..", "dictdata", "es-en.json"), encoding="utf-8")); real = set(x[0].lower() for x in D["L"])
try: real |= set(k.lower() for k in json.load(open(os.path.join(T, "..", "dictdata", "es-xf.json"), encoding="utf-8")))
except Exception: pass
words = set(w.lower() for w in re.findall(r"[a-záéíóúüñ]{3,14}", s, flags=re.I))
RULES = [("á", "a"), ("é", "e"), ("í", "i"), ("ó", "o"), ("ú", "u"), ("v", "b"), ("b", "v"), ("ll", "y"), ("ñ", "n"), ("z", "s"), ("ce", "se"), ("ci", "si"), ("qu", "k"), ("rr", "r"), ("j", "g"), ("ge", "je"), ("gi", "ji"), ("gue", "ge"), ("gui", "gi")]
strip = lambda w: "".join(c for c in unicodedata.normalize("NFD", w) if unicodedata.category(c) != "Mn").replace("n\u0303", "ñ")
AC = {"a": "á", "e": "é", "i": "í", "o": "ó", "u": "ú"}
taboo = set()
for w in words:
    vs = set()
    for a, b in RULES:
        if a in w: vs.add(w.replace(a, b, 1))
    if w.startswith("h"): vs.add(w[1:])
    base = "".join(AC.get(c, c) if False else c for c in w.translate(str.maketrans("áéíóú", "aeiou")))
    vs.add(base)
    for i, c in enumerate(base):
        if c in AC: vs.add(base[:i] + AC[c] + base[i + 1:])
    vs.discard(w)
    taboo |= {v for v in vs if v in real}
data = json.dumps(sorted(taboo), ensure_ascii=False)
if 'id="sk-taboo"' in s: s = re.sub(r'(<script type="application/json" id="sk-taboo">)[\s\S]*?(</script>)', lambda m: m.group(1) + data + m.group(2), s, count=1)
else: rep('<script type="application/json" id="pv-registry">', '<script type="application/json" id="sk-taboo">' + data + '</script>\n<script type="application/json" id="pv-registry">')
open(p, "w", encoding="utf-8").write(s); print("patched", p, "· taboo", len(taboo))
