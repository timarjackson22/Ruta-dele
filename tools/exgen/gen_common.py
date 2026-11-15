# shared builders for the A2–C2 sample exams (same JSON shape as A1: see a1_common.py)
def mc(q, o, a):
    return {"q": q, "o": o, "a": a}

def P(es, en, kw):
    return {"es": es, "en": en, "kw": kw}

def R(t, ins, en, texts, qs):
    """reading, multiple choice: texts = [(heading, body), ...]"""
    return {"t": t, "ins": ins, "en": en, "texts": [{"h": h, "b": b} for h, b in texts], "q": qs}

def RM(t, ins, en, texts, opts, items, answers):
    """reading, matching: each item (person, gap, statement) gets one option; some options are not used"""
    return {"t": t, "ins": ins, "en": en, "texts": [{"h": h, "b": b} for h, b in texts], "opts": opts,
            "q": [{"q": items[i], "a": answers[i]} for i in range(len(items))]}

def A(t, ins, en, audio, qs):
    """listening, multiple choice: audio = strings (narration) or [speaker, line]"""
    return {"t": t, "ins": ins, "en": en, "audio": audio, "q": qs}

def AM(t, ins, en, audio, opts, items, answers):
    return {"t": t, "ins": ins, "en": en, "audio": audio, "opts": opts, "q": [{"q": items[i], "a": answers[i]} for i in range(len(items))]}

def numbered(label, parts):
    """several short recordings in one task: 'Conversación 1.' + its lines"""
    out = []
    for i, p in enumerate(parts):
        out.append(label + " " + str(i + 1) + ".")
        out += p if isinstance(p, list) else [p]
    return out

def W(t, task_es, task_en, typ, reg, words, points, model, source=None):
    d = {"t": t, "ins": task_es + " Número de palabras: entre %d y %d." % tuple(words), "en": task_en + " (%d–%d words)" % tuple(words),
         "task": task_es, "type": typ, "reg": reg, "words": list(words), "points": points, "model": model}
    if source: d["source"] = source
    return d

def O(t, ins, en, task, prep, speak, words, points, model="", card=None, ask=None):
    d = {"t": t, "ins": ins, "en": en, "task": task, "prep": prep, "speak": speak, "words": list(words), "points": points}
    if model: d["model"] = model
    if card: d["card"] = card
    if ask: d["ask"] = ask
    return d
