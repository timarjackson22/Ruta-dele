"""Flashcards: Business Spanish and Finance Spanish decks (banking, markets, investment banking, accounting, compliance), next to Legal and Medical."""
import sys, json
sys.path.insert(0, "/home/claude/app")
from pro_decks import BUSINESS, FINANCE
p = sys.argv[1]; s = open(p, encoding="utf-8").read()
if '"id":"business"' in s: sys.exit("already patched")
i = s.index("  const VPRO = "); j = s.index("\n", i)
s = s[:j + 1] + "  VPRO.push(" + json.dumps(BUSINESS, ensure_ascii=False, separators=(",", ":")) + ", " + json.dumps(FINANCE, ensure_ascii=False, separators=(",", ":")) + ");\n" + s[j + 1:]
open(p, "w", encoding="utf-8").write(s)
print("pro ok", sum(len(t["w"]) for t in BUSINESS["themes"]), sum(len(t["w"]) for t in FINANCE["themes"]))
