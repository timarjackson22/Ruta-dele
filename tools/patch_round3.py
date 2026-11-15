"""Round 3 (15 Nov 2026, 09:30): conditional forms the dictionary doesn't list («tendríamos») are recognised, so «si tendríamos» is corrected.
Usage: python3 tools/patch_round3.py index.html"""
import sys
p = sys.argv[1]; s = open(p, encoding="utf-8").read()
if "COND_STEMS" in s: sys.exit("already patched")
a = '''    if (typeof lexIdx === "function" && LEX) { const k = lexIdx(w); if (k >= 0 && LEX.L[k][1] === "verb") lemmas.add(LEX.L[k][0].split(", ")[0]); }
    const out = [];'''
assert s.count(a) == 1
b = '''    if (typeof lexIdx === "function" && LEX) { const k = lexIdx(w); if (k >= 0 && LEX.L[k][1] === "verb") lemmas.add(LEX.L[k][0].split(", ")[0]); }
    // future and conditional forms the dictionary doesn't list («tendríamos», «saldríais»): rebuild the infinitive from the stem; the
    // conjugation below confirms it, so a wrong guess finds nothing
    if (!lemmas.size) { const m = /^(.+?)(ría|rías|ríamos|ríais|rían|ré|rás|rá|remos|réis|rán)$/.exec(w); if (m) { const st = m[1] + "r";
      const COND_STEMS = { tendr: "tener", podr: "poder", sabr: "saber", saldr: "salir", vendr: "venir", pondr: "poner", har: "hacer", dir: "decir", querr: "querer", habr: "haber", cabr: "caber", valdr: "valer", deshar: "deshacer", mantendr: "mantener", obtendr: "obtener", contendr: "contener", detendr: "detener", propondr: "proponer", supondr: "suponer", compondr: "componer", dispondr: "disponer", convendr: "convenir", intervendr: "intervenir", prevendr: "prevenir", satisfar: "satisfacer", predir: "predecir", contradir: "contradecir", rehar: "rehacer" };
      if (COND_STEMS[st]) lemmas.add(COND_STEMS[st]); else if (/[aei]r$/.test(st)) lemmas.add(st); } }
    const out = [];'''
s = s.replace(a, b); open(p, "w", encoding="utf-8").write(s); print("patched", p)
# exam questions get visible numbers (Profe adds them; voice answers use them) and the question Profe is on is highlighted
s2 = open(p, encoding="utf-8").read()
if ".exn {" not in s2:
    s2 = s2.replace("</style>", """.exq > .exn { display: inline-grid; place-items: center; min-width: 1.6em; height: 1.6em; margin-right: 6px; border-radius: 999px; background: var(--cobalt); color: var(--on-cobalt, #fff); font-size: .8rem; font-weight: 800; vertical-align: middle }
.exq.ex-cur { outline: 2px solid var(--cobalt); outline-offset: 4px; border-radius: 10px }
</style>""", 1)
    open(p, "w", encoding="utf-8").write(s2); print("exam number styles added")
