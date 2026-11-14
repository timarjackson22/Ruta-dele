"""Spanish words read by the English voice: teach the voice splitter the Spanish words it didn't know (grammar terms such as
«verbo», every word form found in the app's Spanish texts), drop Spanish words that had leaked into its English list from
glosses (grande, cien, bueno…), and read unknown words that look Spanish (-amos, -ción, -mente…) with the Spanish voice."""
import sys, json
p = sys.argv[1]; s = open(p, encoding="utf-8").read()
if "RA_ES_EXTRA" in s: sys.exit("already patched")
D = json.load(open("/home/claude/app/lexfix2.json", encoding="utf-8"))
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, ("anchor", a[:90], s.count(a)); s = s.replace(a, b)
dump = lambda x: json.dumps(" ".join(x), ensure_ascii=False)
rep("    RA_LEX = { es, en: en2, esN, common: COMMON, pos }; return RA_LEX;",
    "    RA_ES_EXTRA.split(\" \").forEach((x) => { es.add(x); en2.delete(x); const n = x.normalize(\"NFD\").replace(/[\\u0300-\\u036f]/g, \"\"); if (!COMMON.has(n)) esN.add(n); });\n"
    "    RA_NOT_EN.split(\" \").forEach((x) => { if (!COMMON.has(x)) { en2.delete(x); es.add(x); esN.add(x.normalize(\"NFD\").replace(/[\\u0300-\\u036f]/g, \"\")); } });\n"
    "    try { LISTEN.forEach((it) => it.paras.forEach((pp) => pp.s.forEach((q) => tok(q[0]).forEach((x) => { if (!en2.has(x)) es.add(x); })))); } catch (e) {}\n"
    "    RA_LEX = { es, en: en2, esN, common: COMMON, pos }; return RA_LEX;")
rep("  function raLex() {", "  const RA_ES_EXTRA = " + dump(D["extra"]) + ";\n  const RA_NOT_EN = " + dump(D["not_en"]) + ";\n  function raLex() {")
# unknown words that look Spanish
rep("(/es$/.test(n) && L.esN.has(n.slice(0, -2))))))) return true; return false; };",
    "(/es$/.test(n) && L.esN.has(n.slice(0, -2))))))) return true; if (x.length >= 5 && !L.en.has(x) && /(amos|emos|imos|aron|ieron|ando|iendo|yendo|aba|abas|aban|ción|ciones|mente|idad|idades|ísimo|ísima|arse|erse|irse|ándose|iéndose)$/.test(x)) return true; return false; };")
open(p, "w", encoding="utf-8").write(s)
print("voicelex ok", len(D["extra"]), len(D["not_en"]))
