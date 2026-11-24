"""Usage knowledge (v296): embeds tools/usage.js (near-synonyms, regional words, natural phrasing, the AI second look) into
index.html between ==USAGE== markers, replacing it in place on re-runs. Usage: python3 tools/patch_usage.py index.html"""
import re, sys, os
P = sys.argv[1] if len(sys.argv) > 1 else "index.html"; T = os.path.dirname(os.path.abspath(__file__))
s = open(P, encoding="utf-8").read(); s0 = s
js = open(os.path.join(T, "usage.js"), encoding="utf-8").read().rstrip() + "\n"
m = re.search(r"  /\* ==USAGE== .*?/\* ==/USAGE== \*/\n", s, flags=re.S)
if m: s = s[:m.start()] + js + s[m.end():]
else:
    anc = "  /* ==TOPICS== "; assert s.count(anc) == 1; s = s.replace(anc, js + anc)
css = "#tutor .prwhy { margin: 6px 0 0; padding: 8px 10px; border-radius: 10px; background: #eef4ff; color: #1f3b6e; font-size: .92rem; line-height: 1.4 } [data-theme=\"dark\"] #tutor .prwhy { background: #1e2a40; color: #d6e2ff }\n"
if "#tutor .prwhy {" not in s:
    i = s.find("/* ==TOPICS-CSS== "); assert i > 0; s = s[:i] + css + s[i:]
if s != s0: open(P, "w", encoding="utf-8").write(s)
print("usage:", "embedded" if s != s0 else "no change")
