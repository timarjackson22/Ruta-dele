"""Ok Profe wake test on the real Vosk Spanish model (tools/PROFE_WAKE_BRIEF.md).
Which wake words the model knows, and detections on synthetic speech (espeak-ng, several voices and speeds): wake phrases must fire,
ordinary sentences (including near-misses like "profesor", "probé") must not. Run by .github/workflows/vosk-model.yml."""
import json, os, subprocess, sys, wave, io, contextlib
from vosk import Model, KaldiRecognizer, SetLogLevel
M = Model(sys.argv[1])
# 1. vocabulary: a grammar word the model doesn't know is dropped with a warning (stderr), so test each word alone
def known(w):
    r, w2 = subprocess.run([sys.executable, "-c", f"""
from vosk import Model, KaldiRecognizer; import json
m = Model({sys.argv[1]!r}); KaldiRecognizer(m, 16000, json.dumps([{w!r}, "[unk]"]))"""], capture_output=True, text=True), w
    return "missing in vocabulary" not in (r.stderr or "") and "Ignoring" not in (r.stderr or "")
WORDS = ["ok", "okey", "oye", "hola", "profe", "profesor", "profesora", "ey", "hey", "oiga", "vale"]
voc = {w: known(w) for w in WORDS}
print("VOCAB " + json.dumps(voc))
SetLogLevel(-1)
GRAM = [p for p in ["ok profe", "okey profe", "oye profe", "hola profe", "hey profe", "ey profe"] if all(voc.get(x) for x in p.split())]
print("GRAMMAR " + json.dumps(GRAM))
def say(text, voice, speed):
    raw = subprocess.run(["espeak-ng", "-v", voice, "-s", str(speed), "--stdout", text], capture_output=True).stdout
    r = subprocess.run(["sox", "-t", "wav", "-", "-r", "16000", "-c", "1", "-b", "16", "-t", "raw", "-", "pad", "0.5", "0.8"], input=raw, capture_output=True).stdout
    return r
def detect(pcm):
    rec = KaldiRecognizer(M, 16000, json.dumps(GRAM + ["[unk]"])); rec.SetWords(True); hits = []
    for i in range(0, len(pcm), 3200):
        if rec.AcceptWaveform(pcm[i:i + 3200]): hits.append(json.loads(rec.Result()))
    hits.append(json.loads(rec.FinalResult()))
    out = []
    for h in hits:
        t = h.get("text", ""); ws = h.get("result", [])
        if "profe" in t.split(): out.append({"text": t, "conf": round(min([w["conf"] for w in ws if w["word"] != "[unk]"] or [0]), 2)})
    return out
POS = ["oye profe", "ok profe", "okey profe", "hola profe", "oye, profe", "ok profe, ¿qué hora es?", "oye profe llévame al menú"]
NEG = ["¿qué hora es?", "el profesor llegó tarde", "probé el café ayer", "voy a la oficina por la mañana", "pues mira, la verdad no lo sé",
       "hola, ¿cómo estás?", "oye, ¿me pasas la sal?", "ok, perfecto, nos vemos", "la profesión de mi padre", "prefiero el té", "hoy profundizamos en la gramática", "por fe"]
VOICES = [("es", 150), ("es", 190), ("es-419", 160), ("es-419", 130)]
res = {"pos": [], "neg": []}
for kind, L in (("pos", POS), ("neg", NEG)):
    for s in L:
        for v, sp in VOICES:
            d = detect(say(s, v, sp)); res[kind].append({"s": s, "v": v + "@" + str(sp), "hit": bool(d), "d": d})
tp = sum(x["hit"] for x in res["pos"]); fp = sum(x["hit"] for x in res["neg"])
for x in res["pos"] + res["neg"]: print(("POS " if x in res["pos"] else "NEG ") + ("HIT  " if x["hit"] else "miss ") + x["v"] + "  " + x["s"] + "  " + json.dumps(x["d"], ensure_ascii=False))
# thresholds: how many false alarms remain at each confidence
for th in (0, 0.5, 0.6, 0.7, 0.8, 0.9):
    a = sum(any(d["conf"] >= th for d in x["d"]) for x in res["pos"]); b = sum(any(d["conf"] >= th for d in x["d"]) for x in res["neg"])
    print(f"THRESH {th}: wake {a}/{len(res['pos'])}  false {b}/{len(res['neg'])}")
print(f"SUMMARY wake {tp}/{len(res['pos'])}  false alarms {fp}/{len(res['neg'])}")
