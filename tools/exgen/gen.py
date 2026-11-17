import json, sys, importlib, os
sys.path.insert(0, os.path.dirname(__file__))
lv = sys.argv[1]
common = importlib.import_module(lv + "_common")
exams = []
for part in sorted(f[:-3] for f in os.listdir(os.path.dirname(__file__)) if f.startswith(lv + "_part") and f.endswith(".py")):
    exams += importlib.import_module(part).EXAMS
# DELE A2 v2020 reading = 5 + 8 + 6 + 6 items (Especificaciones DELE A2 2020). Tarea 1 keeps its first five questions;
# Tarea 4 is a narrative text (375–425 words) with six questions (a2_t4.py); the old gap-fill stays as labelled practice.
if lv == "a2" and not any(t.get("t") == "Práctica extra" for x in exams for t in x.get("lectura", [])):
    from a2_t4 import T4
    def _ren(o, a, b):
        if isinstance(o, str): return o.replace(a, b)
        if isinstance(o, list): return [_ren(v, a, b) for v in o]
        if isinstance(o, dict): return {k: _ren(v, a, b) for k, v in o.items()}
        return o
    for n, x in enumerate(exams):
        L = x["lectura"]; t1 = next(t for t in L if t["t"] == "Tarea 1"); t1["q"] = t1["q"][:5]
        for t in L:
            for k in ("ins", "en"):
                t[k] = t[k].replace("1–6", "1–5").replace("7–14", "6–13").replace("(15–20)", "(14–19)")
        i = next(i for i, t in enumerate(L) if t["t"] == "Tarea 4")
        old = L[i]; old["t"] = "Práctica extra"; old["extra"] = True
        old["ins"] = old["ins"].replace("(21–25)", "(1–5)"); old["en"] = old["en"].replace("21–25", "1–5")
        L[i:i] = [json.loads(json.dumps(T4[n]))]
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
                tot += 0 if t.get("extra") else 1
                lim = len(t["opts"]) if "opts" in t else len(q["o"])
                assert 0 <= q["a"] < lim, (n, k, t["t"], q)
        assert tot == 25 or lv not in ("a1", "a2"), (n, k, tot)
# DELE A1 v2020 has 3 speaking tasks: the old Tarea 4 (role-play dialogues) stays as practice, clearly labelled and outside the exam's timing and score
if lv == "a1":
    for x in exams:
        if len(x.get("oral", [])) > 3: x["oral"][3]["extra"] = True; x["oral"][3]["t"] = "Práctica extra"
        for t in x.get("oral", []):
            if t.get("prep", 0) > 10: t["prep"] = 10  # A1 v2020: 10 min preparation
# DELE A2 v2020 speaking: monologue, photo description, role-play. The app's follow-up conversation (old Tarea 2) stays as labelled practice
if lv == "a2":
    for x in exams:
        o = x.get("oral", [])
        if len(o) == 4 and o[1]["t"] == "Tarea 2": o[1]["extra"] = True; o[1]["t"] = "Práctica extra"; o[2]["t"] = "Tarea 2"; o[3]["t"] = "Tarea 3"
# official durations and lengths (DELE specs; the coverage dashboard compares these): speaking minutes and writing word ranges
OFF = {"a2": {("oral", "Tarea 3"): {"speak": 3.5}},
       "b2": {("oral", "Tarea 1"): {"speak": 6.5}, ("oral", "Tarea 2"): {"speak": 5.5}},
       "c1": {("oral", "Tarea 3"): {"speak": 5}, ("escritura", "Tarea 2"): {"words": [180, 220], "txt": ("220–250", "180–220")}},
       "c2": {("escritura", "Tarea 3"): {"words": [200, 250], "txt": ("150–250", "200–250")}}}
def _fix(o, a, b):
    if isinstance(o, str): return o.replace(a, b)
    if isinstance(o, list): return [_fix(x, a, b) for x in o]
    if isinstance(o, dict): return {k: _fix(v, a, b) for k, v in o.items()}
    return o
for x in exams:
    for (pr, tt), ch in OFF.get(lv, {}).items():
        for i, t in enumerate(x.get(pr, [])):
            if t.get("t") != tt or t.get("extra"): continue
            if "txt" in ch: t = x[pr][i] = _fix(t, *ch["txt"])
            for k, v in ch.items():
                if k != "txt": t[k] = v
json.dump({"lvl": lv, "format": common.FORMAT, "exams": exams}, open("/home/claude/ruta-dele/examdata/" + lv + ".json", "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
print(lv, len(exams), "exams")
