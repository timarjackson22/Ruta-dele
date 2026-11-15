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
FILL = """de la que el en y a los se del las un por con no una su para es al lo como más pero sus le ya o este sí porque esta entre cuando muy sin sobre también me hasta hay donde quien desde todo nos durante todos uno les ni contra otros ese eso ante ellos e esto mí antes algunos qué unos yo otro otras otra él tanto esa estos mucho quienes nada muchos cual poco ella estar estas algunas algo nosotros mi mis tú te ti tu tus ellas nosotras vosotros os mío mía tuyo suyo nuestro ser estoy estás está estamos están he has ha hemos han soy eres somos son era fue tengo tiene tenemos tienen hago hace voy vas va vamos van puedo puede quiero quiere sé sabe digo dice creo bien mal bueno buena hoy ayer mañana ahora luego después siempre nunca aquí allí casa tiempo día año vez cosa hombre mujer vida mundo parte gente café té agua comida trabajo oficina escuela clase lección examen pregunta respuesta palabra frase español inglés gracias perdón favor claro vale okay pues mira oiga oye hola adiós profesor profesora profesión profesional profundo profundizamos profundizar perfecto perfecta prefiero preferir probé probar problema programa pronto propio proyecto por fe fue pro hoy oye hey ok okey ey padre madre hijo amigo ciudad país calle tarde noche hora minuto llegó llega vemos nos sal pasas pasa menú ir venir ver hablar comer leer escribir escuchar repetir siguiente anterior otra vez cómo estás qué tal""".split()
FILL = sorted(set(w for w in FILL if w != "profe"))
def detect(pcm, mode="A"):
    if mode == "C": rec = KaldiRecognizer(M, 16000)
    else: rec = KaldiRecognizer(M, 16000, json.dumps(GRAM + (FILL if mode == "B" else []) + ["[unk]"]))
    rec.SetWords(True); hits = []
    for i in range(0, len(pcm), 3200):
        if rec.AcceptWaveform(pcm[i:i + 3200]): hits.append(json.loads(rec.Result()))
    hits.append(json.loads(rec.FinalResult()))
    out = []
    for h in hits:
        t = h.get("text", ""); ws = [w for w in h.get("result", []) if w["word"] != "[unk]"]
        for k in range(1, len(ws)):  # a lead word right before "profe"
            if ws[k]["word"] == "profe" and ws[k - 1]["word"] in LEADS and ws[k]["start"] - ws[k - 1]["end"] < 0.6:
                out.append({"text": t, "conf": round(min(ws[k]["conf"], ws[k - 1]["conf"]), 2)})
        if mode == "C" and not out and t: out.append({"text": t, "conf": -1, "free": 1})
    return [x for x in out if not x.get("free")], t if mode == "C" else ""
LEADS = {"ok", "okey", "oye", "hola", "hey", "ey"}
POS = ["oye profe", "ok profe", "okey profe", "hola profe", "oye, profe", "ok profe, ¿qué hora es?", "oye profe llévame al menú"]
NEG = ["¿qué hora es?", "el profesor llegó tarde", "probé el café ayer", "voy a la oficina por la mañana", "pues mira, la verdad no lo sé",
       "hola, ¿cómo estás?", "oye, ¿me pasas la sal?", "ok, perfecto, nos vemos", "la profesión de mi padre", "prefiero el té", "hoy profundizamos en la gramática", "por fe"]
VOICES = [("es", 150), ("es", 190), ("es-419", 160), ("es-419", 130), ("es+f3", 165), ("es-419+m3", 175)]
POS += ["ey profe", "hola profe, una pregunta"]
NEG += ["el profe de matemáticas", "okey, perfecto", "hay profesores nuevos", "ella es profesora", "oye, ¿qué haces hoy?", "esto es un problema", "hola, buenos días", "pro fe"]
for mode in ("A", "B", "C"):
    res = {"pos": [], "neg": []}
    for kind, L in (("pos", POS), ("neg", NEG)):
        for s in L:
            for v, sp in VOICES:
                pcm = say(s, v, sp); d, free = detect(pcm, mode); res[kind].append({"s": s, "v": v + "@" + str(sp), "hit": bool(d), "d": d, "free": free})
    for x in res["pos"] + res["neg"]:
        if (x in res["pos"]) != x["hit"] or mode == "C": print(f"{mode} " + ("POS " if x in res["pos"] else "NEG ") + ("HIT  " if x["hit"] else "miss ") + x["v"] + "  " + x["s"] + "  " + json.dumps(x["d"], ensure_ascii=False) + ("  free=" + x["free"] if x["free"] else ""))
    for th in (0, 0.5, 0.7, 0.9):
        a = sum(any(d["conf"] >= th for d in x["d"]) for x in res["pos"]); b = sum(any(d["conf"] >= th for d in x["d"]) for x in res["neg"])
        print(f"THRESH {mode} {th}: wake {a}/{len(res['pos'])}  false {b}/{len(res['neg'])}")
