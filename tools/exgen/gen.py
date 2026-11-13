import json, sys, importlib, os
sys.path.insert(0, os.path.dirname(__file__))
lv = sys.argv[1]
common = importlib.import_module(lv + "_common")
exams = []
for part in sorted(f[:-3] for f in os.listdir(os.path.dirname(__file__)) if f.startswith(lv + "_part") and f.endswith(".py")):
    exams += importlib.import_module(part).EXAMS
# shuffle options so the right answer is never in a predictable place (seeded: the same every build)
import random
for n, x in enumerate(exams, 1):
    for k in ("lectura", "auditiva"):
        for ti, t in enumerate(x[k]):
            R = random.Random("%s-%d-%s-%d" % (lv, n, k, ti))
            if "opts" in t:
                order = list(range(len(t["opts"]))); R.shuffle(order); inv = {o: i for i, o in enumerate(order)}
                t["opts"] = [t["opts"][o] for o in order]
                for q in t["q"]: q["a"] = inv[q["a"]]
            else:
                for q in t["q"]:
                    order = list(range(len(q["o"]))); R.shuffle(order); inv = {o: i for i, o in enumerate(order)}
                    q["o"] = [q["o"][o] for o in order]; q["a"] = inv[q["a"]]
# checks: every answer index valid, question counts as the DELE format
for n, x in enumerate(exams, 1):
    for k in ("lectura", "auditiva"):
        tot = 0
        for t in x[k]:
            for q in t["q"]:
                tot += 1
                lim = len(t["opts"]) if "opts" in t else len(q["o"])
                assert 0 <= q["a"] < lim, (n, k, t["t"], q)
        assert tot == 25 or lv != "a1", (n, k, tot)
json.dump({"lvl": lv, "format": common.FORMAT, "exams": exams}, open("/home/claude/ruta-dele/examdata/" + lv + ".json", "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
print(lv, len(exams), "exams")
