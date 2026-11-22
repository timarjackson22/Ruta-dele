"""Library › Picture dictionary (#visual). Embeds tools/visual.js and tools/visual.css, adds the route and the Library tile.
Re-runnable (a no-op when the page already holds the current sources).   Usage: python3 tools/patch_visual.py index.html"""
import re, sys, os
P = sys.argv[1] if len(sys.argv) > 1 else "index.html"; T = os.path.dirname(os.path.abspath(__file__))
s = open(P, encoding="utf-8").read()
def rep(a, b):
    global s
    assert s.count(a) == 1, (a[:80], s.count(a)); s = s.replace(a, b)
js = open(os.path.join(T, "visual.js"), encoding="utf-8").read(); css = open(os.path.join(T, "visual.css"), encoding="utf-8").read()
s = re.sub(r"  /\* ==VISUAL== .*?/\* ==/VISUAL== \*/\n", "", s, flags=re.S)
rep("  /* ==CURRIC== */", js + "  /* ==CURRIC== */")
m = re.search(r"/\* ==VISUAL-CSS== .*?/\* ==/VISUAL-CSS== \*/\n", s, flags=re.S)
if m: s = s[:m.start()] + css + s[m.end():]  # replace in place (later <style> blocks, e.g. rl-frame, stay last)
else: i = s.rfind("</style>", 0, s.find("<style id=\"rl-frame\">") if "<style id=\"rl-frame\">" in s else len(s)); s = s[:i] + css + s[i:]
if 'h === "visual"' not in s:
    rep('    else if (h === "biblioteca") { setSec("biblioteca"); navChips(null); libraryHub(); }', '    else if (h === "biblioteca") { setSec("biblioteca"); navChips(null); libraryHub(); }\n    else if (h === "visual") { setSec("biblioteca"); navChips(null); vdHub(); }\n    else if (/^visual\\/[a-z]+$/.test(h)) { setSec("biblioteca"); navChips(null); vdView(h.slice(7)); }')
if '"Picture dictionary", "Diccionario visual", "#visual"' not in s:
    rep('["phrase", "Survival Kit", "260 everyday phrases", "#frases", "#ff8a4c", "#d9581d"]]', '["phrase", "Survival Kit", "260 everyday phrases", "#frases", "#ff8a4c", "#d9581d"], ["picture", "Picture dictionary", "Diccionario visual", "#visual", "#2bb3a3", "#0f7f86"]]')
if 'picture:["' not in s:
    rep('const UIC = {', 'const UIC = {picture:["#0f7f86",\'<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 17-5-5-9 8"/>\'],')
open(P, "w", encoding="utf-8").write(s)
print("visual: picture dictionary embedded")
