# Video captions: larger, calmer type. The line being said is the largest and boldest; the next line is full size but
# regular weight; lines already said shrink and fade. Sizes scale with the screen (clamp), English sits just under its
# Spanish in a lighter, slightly smaller face, and long lines keep a comfortable measure.
import sys
P = sys.argv[1] if len(sys.argv) > 1 else "index.html"
s = open(P, encoding="utf-8").read()
def rep(a, b):
    global s
    assert s.count(a) == 1, (s.count(a), a[:100]); s = s.replace(a, b)
rep(".ves { margin: 0; font-size: 18px; line-height: 1.45; color: var(--ink) }",
    ".ves { margin: 0; font-size: clamp(20px, 5.4vw, 24px); line-height: 1.36; letter-spacing: .003em; color: var(--ink); max-width: 34ch }")
rep(".ven { display: none; margin: 1px 0 0; font-size: 14.5px; line-height: 1.4; color: var(--muted) }",
    ".ven { display: none; margin: 4px 0 0; font-size: clamp(16px, 4.3vw, 18.5px); line-height: 1.38; color: var(--muted); max-width: 38ch }")
rep(".vcue { display: flex; gap: 10px; align-items: flex-start; margin: 0 0 1.25em; opacity: .55; transition: opacity .4s }",
    ".vcue { display: flex; gap: 10px; align-items: flex-start; margin: 0 0 1.05em; opacity: .55; transition: opacity .4s }\n.vcue.on .ves { font-weight: 600 } .vcue.past .ves { font-size: clamp(17px, 4.6vw, 20px) } .vcue.past .ven { font-size: clamp(14px, 3.8vw, 16px) }\n.vcap-in { padding: 0 18px }")
open(P, "w", encoding="utf-8").write(s); print("ok")
