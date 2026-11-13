"""Business, finance & office: a 2,000-word flashcard deck ranked by use (bands of 250), and the same words merged into
the 7,000-word list without repeats (1,405 new entries tagged "biz", a 💼 Business filter covering all 2,000)."""
import sys, json
p = sys.argv[1]; s = open(p, encoding="utf-8").read()
if "WBIZ0" in s: sys.exit("already patched")
B = json.load(open("/home/claude/app/biz/bizout.json", encoding="utf-8"))
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, ("anchor", a[:90], s.count(a)); s = s.replace(a, b)
dump = lambda x: json.dumps(x, ensure_ascii=False, separators=(",", ":"))

# the 7,000-word list: add what's missing, remember which entries are business words (in deck order)
i = s.index("const W = ["); j = s.index("\n", i)
s = s[:j + 1] + "const WBIZ0 = W.length; W.push(..." + dump(B["wadd"]) + ");\n" + \
    "const WBIZR = " + dump(B["wbiz"]) + ".map((v) => (v >= 0 ? v : WBIZ0 - v - 1)); const WBIZS = new Set(WBIZR);\n" + s[j + 1:]
rep('''  const POSGRP = (p) =>''', '''  POSN.biz = "💼 business"; POSN.expr = "expressions";
  const POSGRP = (p) =>''')
rep('''if (WV.types.includes(POSGRP(W[i][1])) && !(WV.hideKnown && S.w[i])) out.push(i);''', '''if ((WV.types.includes(POSGRP(W[i][1])) || (WV.types.includes("biz") && WBIZS.has(i))) && !(WV.hideKnown && S.w[i])) out.push(i); if (WV.types.length === 1 && WV.types[0] === "biz") { const o = new Map(WBIZR.map((x, k) => [x, k])); out.sort((a, b) => o.get(a) - o.get(b)); }''')
rep('''    const cnt = {}; W.forEach((e) => { const g = POSGRP(e[1]); cnt[g] = (cnt[g] || 0) + 1; });''', '''    const cnt = {}; W.forEach((e) => { const g = POSGRP(e[1]); cnt[g] = (cnt[g] || 0) + 1; }); cnt.biz = WBIZR.length;''', 1)
rep('''(i < WN ? i + 1 : '<span class="core" title="Core word, added by type">core</span>')''', '''(i < WN ? i + 1 : i >= WBIZ0 ? '<span class="core biz" title="Business, finance &amp; office word">biz</span>' : '<span class="core" title="Core word, added by type">core</span>')''')

rep('''idx = idx.filter((i) => (!WV.types.length || WV.types.includes(POSGRP(W[i][1]))) && !(WV.hideKnown && S.w[i]))''', '''idx = idx.filter((i) => (!WV.types.length || WV.types.includes(POSGRP(W[i][1])) || (WV.types.includes("biz") && WBIZS.has(i))) && !(WV.hideKnown && S.w[i]))''')
rep('''" matches across all 7,000 words''', '''" matches across all " + W.length.toLocaleString("en") + " words (7,000 most used + core and business words)''')
# the flashcard deck, ranked, in bands of 250
deck = B["deck"]; themes = []
for a in range(0, len(deck), 250):
    themes.append({"t": "%d–%d" % (a + 1, min(a + 250, len(deck))), "en": "Ranked %d–%d" % (a + 1, min(a + 250, len(deck))), "w": deck[a:a + 250]})
i = s.index("  const VPRO = "); j = s.index("\n", i)
s = s[:j + 1] + "  VPRO.unshift(" + dump({"id": "bizfin", "t": "Negocios, finanzas y oficina", "en": "Business, finance & office · 2,000 words", "themes": themes}) + ");\n" + s[j + 1:]
s = s.replace(".core.biz {", ".core.biz {", 1)
k = s.index("</style>\n\n</head>"); s = s[:k] + "\n.core.biz { background: color-mix(in srgb, var(--cobalt) 14%, transparent); color: var(--cobalt) }\n" + s[k:]
open(p, "w", encoding="utf-8").write(s)
print("biz ok", len(deck), len(B["wadd"]))
