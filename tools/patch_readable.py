# Reading comfort for lessons (#a1-u3…) and guides (#guia-…): clearer hierarchy, more air, stacked examples on phones.
import sys
P = sys.argv[1] if len(sys.argv) > 1 else "index.html"
s = open(P, encoding="utf-8").read()
CSS = open("tools/readable.css", encoding="utf-8").read()
A, B = "/* ==READABLE== */", "/* ==/READABLE== */"
block = A + "\n" + CSS + B + "\n"
if A in s:
    i = s.index(A); j = s.index(B, i) + len(B) + 1; s = s[:i] + block + s[j:]
else:
    a = "/* ===== study plan (M4) ===== */"; assert s.count(a) == 1; s = s.replace(a, block + a)
    a = "  function route() {\n"; assert s.count(a) == 1
    s = s.replace(a, a + "    try { document.body.classList.toggle(\"read-page\", /^#((a1|a2|b1|b2|c1|c2|esc)-u\\d+|guia-.+)$/.test(location.hash)); } catch (e) {}\n")
open(P, "w", encoding="utf-8").write(s); print("readable css applied")
