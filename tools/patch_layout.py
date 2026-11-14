"""Spacing pass (layout audit tools/profe-tests/lay.js): stacked controls never touch; consistent rhythm."""
import sys
p = sys.argv[1]; s = open(p, encoding="utf-8").read()
if "LAYOUT_V1" in s: sys.exit("already patched")
CSS = r'''
/* ===== LAYOUT_V1: spacing rhythm ===== */
#v-body, #g-body { display: flex; flex-direction: column; gap: 12px }
#v-body > .row, #g-body > .row { gap: 8px }
#v-body > p.muted.small { margin: 0 }
'''
k = s.rindex("</style>", 0, s.index("</head>")); s = s[:k] + CSS + s[k:]
open(p, "w", encoding="utf-8").write(s)
print("layout ok")
