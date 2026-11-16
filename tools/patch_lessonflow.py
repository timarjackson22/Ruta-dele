"""Lesson flow (16 Nov 2026): tap-any-word meanings, page mode for lessons/guides, Profe's button tucked away during lessons.
Embeds tools/lessonflow.js and its CSS. Re-runnable. Usage: python3 tools/patch_lessonflow.py index.html"""
import sys, os, re
T = os.path.dirname(os.path.abspath(__file__)); p = sys.argv[1]; s = open(p, encoding="utf-8").read()
js = open(os.path.join(T, "lessonflow.js"), encoding="utf-8").read(); css = open(os.path.join(T, "lessonflow.css"), encoding="utf-8").read()
blk = "  /* ==LFLOW== */\n" + js.rstrip() + "\n  /* ==/LFLOW== */\n"
if "/* ==LFLOW== */" in s: s = re.sub(r"  /\* ==LFLOW== \*/\n[\s\S]*?  /\* ==/LFLOW== \*/\n", lambda m: blk, s, count=1)
else:
    a = "  // a page that throws while drawing must not leave a blank screen\n  function route() {"; assert s.count(a) == 1; s = s.replace(a, blk + a)
cb = "/* ==LFLOW-CSS== */\n" + css.rstrip() + "\n/* ==/LFLOW-CSS== */\n"
if "/* ==LFLOW-CSS== */" in s: s = re.sub(r"/\* ==LFLOW-CSS== \*/\n[\s\S]*?/\* ==/LFLOW-CSS== \*/\n", lambda m: cb, s, count=1)
else: assert s.count("/* ==READABLE== */") == 1; s = s.replace("/* ==READABLE== */", cb + "/* ==READABLE== */")
open(p, "w", encoding="utf-8").write(s); print("patched", p)
